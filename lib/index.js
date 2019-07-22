(function() {
  var path, through, glob, _, del;

  glob = require("glob-all");

  through = require("through");

  path = require("path");

  _ = require("underscore");

  del = require("del");

  var repl = /\\/g

  module.exports = function(dest, destPatterns) {
    if (destPatterns === undefined) return through(function write(data) {this.emit('data', data)},function end () {this.emit('end')});

    var srcFiles, destFiles, files, onEnd, onFile;
    files = [];
    srcFiles = [];

    destFiles = glob.sync( destPatterns, {cwd: path.join(process.cwd(), dest) } );   

    onFile = function(file) {
      srcFiles.push(file.path);
      this.push(file);
      return files.push(file);
    };
    onEnd = function() {

      for (var i = srcFiles.length -1, l = -1; i > l; i--){
        srcFiles[i] = srcFiles[i].replace(repl, "/").substr(process.cwd().length + 1);
        if (srcFiles[i] == '') {
          srcFiles.splice(i,1);
        }
      }

      //compare source and destination files and delete any missing in source at destination
      var deletedFiles = _.difference(destFiles, srcFiles);
      _.each(deletedFiles, function(item, index) {
        deletedFiles[index] = path.join(process.cwd(), dest,  deletedFiles[index]);
        del.sync(deletedFiles[index]);
      })

      return this.emit("end");
    };
    return through(onFile, onEnd);
  };

}).call(this);
