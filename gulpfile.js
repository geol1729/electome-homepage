var gulp = require( 'gulp' );
var browserify = require( 'browserify' );
var source = require( 'vinyl-source-stream' );
var underscorify = require( 'node-underscorify' );
var sass = require( 'gulp-sass' );
var nodemon = require( 'gulp-nodemon' );

gulp.task( 'default', [ 'start' ] );

gulp.task( 'browserify', function () {
	return browserify( './src/js/app.js', { paths: ['./node_modules','./src/'] } )
		.transform( underscorify.transform() )
		.bundle()
		.pipe( source( 'bundle.js' ) )
		.pipe( gulp.dest( './public/js/' ) );
} );

gulp.task( 'sass', function () {
	return gulp.src( './src/css/*.scss' )
		.pipe( sass().on( 'error', sass.logError ) )
		.pipe( gulp.dest( './public/css/' ) );
} );

gulp.task( 'start', function () {
	nodemon( {
		// script: 'server.js',
		ext: 'js scss html',
		ignore: [ 'public/' ],
		tasks: [ 'browserify', 'sass' ]
	} );
});