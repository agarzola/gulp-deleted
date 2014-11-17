# gulp-deleted


The gulp plugin `gulp-deleted` allows you to remove files from the destination folder which do no exist in the stream.
  
Best used in conjunction with [gulp-collate](https://www.npmjs.org/package/gulp-collate) and [gulp-changed](https://www.npmjs.org/package/gulp-changed)  

```  
var destPath = "/path/dest"
var srcPaths = ["/path/src/**/assets/**/*"];
gulp.src( srcPaths )
	.pipe( collate("assets") )
	.pipe( deleted(, [
			"/path/dest/**/*",
			"!/path/dest/index.html",
			"!/path/dest/css/**/*",
			"!/path/dest/css/**",
			"!/path/dest/css",
			"!/path/dest/js/**/*",
			"!/path/dest/js/**",
			"!/path/dest/js"
		]))
	.pipe( changed(destPath) )
	.pipe( gulp.dest( destPath ) );
```
