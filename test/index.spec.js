const chai = require('chai');
const sinon = require('sinon');
chai.use(require('sinon-chai'));
const expect = chai.expect;

const File = require('vinyl');
const through = require('through');
const proxyquire = require('proxyquire');
const push = sinon.spy();

const stubs = {
  del: {
    sync: sinon.spy(),
  },
};

const deleted = proxyquire('../lib', stubs);

describe('gulp-deleted', () => {
  let file, nestedFile, transformedFile, options;
  beforeEach(() => {
    // Instantiate fresh dummy file and options objects for every test.
    file = new File({
      cwd: process.cwd(),
      base: '/test/source/',
      path: `${process.cwd()}/test/source/file.jpg`,
    });
    nestedFile = new File({
      cwd: process.cwd(),
      base: '/test/source/',
      path: `${process.cwd()}/test/source/directory/file.jpg`,
    });
    transformedFile = new File({
      cwd: process.cwd(),
      base: '/test/source/',
      path: `${process.cwd()}/test/source/file.scss`,
    });
    options = {
      src: 'test/source',
      dest: 'test/destination',
      patterns: [ '**/*' ],
    };
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
      expect(stubs.del.sync).to.be.calledWith(`${process.cwd()}/test/destination/deletedFile.jpg`);
      done();
    });
    plugin.write(file);
    plugin.write(nestedFile);
    plugin.end();
  });

  it('should delete files nested within directories inside destination', done => {
    const plugin = deleted(options);
    plugin.once('end', () => {
      expect(stubs.del.sync).to.be.calledWith(`${process.cwd()}/test/destination/directory/deletedFile.jpg`);
      done();
    });
    plugin.write(file);
    plugin.write(nestedFile);
    plugin.end();
  });

  it('should not delete files that match after filename transformation', done => {
    const optionsWithFilenameTransform = {
      ...options,
      transform: (filename) => filename.replace(/\.scss$/, '.css'),
    };
    const plugin = deleted(optionsWithFilenameTransform);
    plugin.once('end', () => {
      expect(stubs.del.sync).to.not.be.calledWith(`${process.cwd()}/test/destination/file.css`);
      expect(stubs.del.sync).to.be.calledWith(`${process.cwd()}/test/destination/directory/file.css`);
      done();
    });
    plugin.write(transformedFile);
    plugin.end();
  });

  it('should not delete ignored files', done => {
    options.patterns.push('!directory/deletedFile.jpg');
    const plugin = deleted(options);
    plugin.once('end', () => {
      expect(stubs.del.sync).to.be.calledOnce;
      expect(stubs.del.sync).to.be.calledWith(`${process.cwd()}/test/destination/deletedFile.jpg`);
      done();
    });
    plugin.write(file);
    plugin.write(nestedFile);
    plugin.end();
  });

  it('should not delete any files if not required', done => {
    // Require deleted w/stubbed `glob-all` dependency, so mock destination
    // directory structure where there are no excess files.
    const deleted2 = proxyquire('../lib', Object.assign({}, stubs, {
      'glob-all': {
        sync: () => {
          return [
            'file.jpg',
            'directory/file.jpg',
          ];
        }
      },
    }));
    const plugin = deleted2(options);
    plugin.once('end', () => {
      expect(stubs.del.sync).to.not.be.called;
      done();
    });
    plugin.write(file);
    plugin.write(nestedFile);
    plugin.end();
  });
});
