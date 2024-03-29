const difference = require("lodash.difference");
const del = require("del");
const glob = require("glob-all");
const path = require("path");
const through = require("through");

module.exports = function({
  src,
  dest,
  patterns,
  // If no transforms array is provided, create a default array with one
  // transform that returns the filename as-is.
  transforms = [ (filename) => filename ],
}) {
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
  const destFiles = glob.sync(patterns, {
    cwd: path.join(process.cwd(), dest),
    // Mark appends `/` to directories, which we use to filter them out.
    mark: true,
  }).filter(f => !/\/$/.test(f));

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
    // Create array of paths to files found in destination but not in source,
    // applying transform to each source file.
    const deletedFiles = difference(
      destFiles,
      srcFiles.reduce((newArray, filename) => {
        transforms.forEach(transform => newArray.push(transform(filename)));
        return newArray;
      }, []),
    );

    // For each path: make it absolute and pass it to del.sync().
    deletedFiles.map(item => path.join(process.cwd(), dest, item))
      .forEach(item => del.sync(item));

    return this.emit("end");
  }

  return through(onFile, onEnd);
}
