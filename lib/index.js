const difference = require("lodash.difference");
const del = require("del");
const glob = require("glob-all");
const path = require("path");
const through = require("through");

module.exports = function({src, dest, patterns}) {
  // If no pattern is provided, just pass through.
  if (!patterns) {
    return through(function write(data) {
      this.emit('data', data)
    }, function end () {
      this.emit('end')
    });
  }

  const files = [];
  const srcFiles = [];
  const destFiles = glob.sync( patterns, {cwd: path.join(process.cwd(), dest) } );

  function onFile(file) {
    // Get file path relative to source.
    const relativePath = file.path.replace(/\\/g, '/')
      .substr(path.join(process.cwd(), src).length + 1);

    // Store relative file path if it exists (i.e. it’s not the source root).
    if (relativePath) {
      srcFiles.push(relativePath);
    }

    // Add file to stream.
    this.push(file);
    return files.push(file);
  }

  function onEnd() {
    // Create array of paths to files found in destination but not in source.
    const deletedFiles = difference(destFiles, srcFiles);

    // For each path: make it absolute and pass it to del.sync().
    deletedFiles.map(item => path.join(process.cwd(), dest, item)).forEach(del.sync);

    return this.emit("end");
  }

  return through(onFile, onEnd);
}
