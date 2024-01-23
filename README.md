# gulp-deleted

`gulp-deleted` allows you to remove files from the destination folder which do
not exist in the source stream. You can specify a globs with which to identify
destination files that are eligible for deletion, including exlusions.

## Remove any files from the destination that are no longer in source.

```javascript
function assets() {
  const src = 'src/assets/**/*';
  const dest = 'dest/';
  gulp.src(src)
    .pipe(deleted({ src, dest, patterns: [ '**/*' ] }))
    .pipe(gulp.dest(dest));
}
```

## Keep `index.html` in the destination even if it doesn’t exist in the source.

```javascript
function assets() {
  const src = 'src/assets/**/*';
  const dest = 'dest/';
  gulp.src(src)
    .pipe(deleted({
      src,
      dest,
      patterns: [
        '**/*',
        '!index.html',
      ],
    }))
    .pipe(gulp.dest(dest));
}
```

## Transform filenames between source and destination.

```javascript
function assets() {
  const src = 'src/assets/**/*';
  const dest = 'dest/';
  gulp.src(src)
    .pipe(deleted({
      src,
      dest,
      patterns: [
        '**/*',
      ],
      // Match `.scss` files in the source to `.css` files in the destination.
      transform: (filename) => filename.replace(/\.scss$/, '.css'),
    }))
    .pipe(gulp.dest(dest));
}
```
