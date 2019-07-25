const chai = require('chai');
const sinon = require('sinon');
chai.use(require('sinon-chai'));
const expect = chai.expect;

const File = require('vinyl');
const through = require('through');
const proxyquire = require('proxyquire');
const push = sinon.spy();
let destinationFiles;

const stubs = {
  del: {
    sync: sinon.spy(),
  },
  'glob-all': {
    sync: (patterns, options) => {
      return destinationFiles;
    }
  },
};

const deleted = proxyquire('../lib', stubs);

describe('gulp-deleted', () => {
  let file, nestedFile, options;
  beforeEach(() => {
    // Instantiate fresh dummy file and options objects for every test.
    file = new File({
      cwd: process.cwd(),
      base: '/source/',
      path: `${process.cwd()}/source/file.jpg`,
    });
    nestedFile = new File({
      cwd: process.cwd(),
      base: '/source/',
      path: `${process.cwd()}/source/directory/file.jpg`,
    });
    options = {
      src: 'source',
      dest: 'destination',
      patterns: [ '**/*' ],
    };
    destinationFiles = [
      'file.jpg',
      'directory/file.jpg',
      'deletedFile.jpg',
      'directory/deletedFile.jpg',
    ];
    stubs.del.sync.resetHistory();
  });

  it('should pass intact files through the stream', done => {
    // Instantiate plugin.
    const plugin = deleted(options);
    // Register a listener that compares the streamed file with the original.
    plugin.once('data', pipedFile => {
      expect(pipedFile).to.equal(file);
      done();
    });
    plugin.write(file);
  });

  it('should pass through when no patterns are passed', () => {
    // Instantiate plugin w/o a patterns option.
    const plugin = deleted({});
    // Write file to the stream.
    plugin.write(file);

    expect(stubs.del.sync).to.not.be.called;
  });

  it('should delete files at the root of destination', done => {
    const plugin = deleted(options);
    plugin.once('end', () => {
      expect(stubs.del.sync).to.be.calledWith(`${process.cwd()}/destination/deletedFile.jpg`);
      done();
    });
    plugin.write(file);
    plugin.write(nestedFile);
    plugin.end();
  });

  it('should delete files nested within directories inside destination', done => {
    const plugin = deleted(options);
    plugin.once('end', () => {
      expect(stubs.del.sync).to.be.calledWith(`${process.cwd()}/destination/directory/deletedFile.jpg`);
      done();
    });
    plugin.write(file);
    plugin.write(nestedFile);
    plugin.end();
  });

  it('should not delete any files if not required', done => {
    const plugin = deleted(options);
    destinationFiles.splice(2);
    plugin.once('end', () => {
      expect(stubs.del.sync).to.not.be.called;
      done();
    });
    plugin.write(file);
    plugin.write(nestedFile);
    plugin.end();
  });
});
