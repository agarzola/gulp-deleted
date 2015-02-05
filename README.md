# gulp-deleted

The gulp plugin `gulp-deleted` allows you to remove files from the destination folder which do no exist in the source stream (with exclusions);
  
Best used in conjunction with [gulp-collate](https://www.npmjs.org/package/gulp-collate) and [gulp-changed](https://www.npmjs.org/package/gulp-changed)  

``` 
var srcPaths = [ "src/**/assets/**/*" ]
var destPath = "dest/"
gulp.src( srcPaths )
	.pipe( collate("assets") )
	.pipe( deleted( destPath , [
			"**/*",
			"!index.html"
		]))
	.pipe( changed(destPath) )
	.pipe( gulp.dest( destPath ) );
```