/*global -$ */
'use strict';

// GULP CONFIG
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var awspublish = require('gulp-awspublish');
var fs = require("fs");

// Load project config file
var appConfig = require('./gulp-config.json');


// *



gulp.task('setup', function () {
	return gulp.src('./source/repos/modernizr/modernizr.js')
		.pipe(gulp.dest('./app/js'))		
		.pipe($.notify("Modernizr copied"));
});

gulp.task('fonts', function () {
	return gulp.src('./source/fonts/*')
		.pipe(gulp.dest('./app/fonts'))		
		.pipe($.notify("Fonts copied"));
});

// HTML
gulp.task('html', function () {
	return gulp.src('./source/html/*.html')
		.pipe(gulp.dest('./app'))		
		.pipe($.notify("HTML processing complete"));
});


// CSS
gulp.task('css', function () {
	return gulp.src('source/scss/app.scss')
		// .pipe($.watch('./source/scss/**/*.scss'))
		.pipe($.sourcemaps.init())
		.pipe($.sass({
			outputStyle: 'nested', // libsass doesn't support expanded yet
			precision: 10,
			includePaths: ['.'],
			onError: console.error.bind(console, 'Sass error:')
		}))
		.pipe($.postcss([
			require('autoprefixer-core')({browsers: ['last 2 version']})
		]))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('./app/css'))
		.pipe(browserSync.reload({stream:true}))
		.pipe($.notify("CSS compile complete"));
});


// JS
gulp.task('js', function () {
	return gulp.src('source/js/**/*.js')
		.pipe(reload({stream: true, once: true}))
		.pipe($.jshint())
		.pipe($.jshint.reporter('jshint-stylish'))
		.pipe($.if(!browserSync.active, $.jshint.reporter('fail')))
		.pipe($.concat('app.js'))
		.pipe(gulp.dest('./app/js'))
		.pipe(browserSync.reload({stream:true}))
		.pipe($.notify("JS compile complete"));

});


// Images
gulp.task('images', function () {
	return gulp.src('source/images/**/*')
		.pipe($.cache($.imagemin({
			progressive: true,
			interlaced: true,
			// don't remove IDs from SVGs, they are often used
			// as hooks for embedding and styling
			svgoPlugins: [{cleanupIDs: false}]
		})))
		.pipe(gulp.dest('app/images'))
		.pipe(browserSync.reload({stream:true}))
		.pipe($.notify("Image processing complete"));
});


// *


// BUILD TASKS
// Clean task
gulp.task('clean', require('del').bind(null, ['app']));


// Build task
gulp.task('build', gulp.series('html', 'css', 'js', 'images'), function () {
	
});


// Clean & build
gulp.task('default', function () {
	gulp.start('build');
});


// *


// DEVELOPMENT TASKS
// Browser-Sync task
gulp.task('browser-sync', function () {
	var files = [
		'./app/index.html'
	];

	browserSync.init(files, {
		server: {
			 baseDir: './app'
		}
	});
});


// Watch task
gulp.task('watch', function() {
	gulp.watch('source/html/**/*.*', gulp.parallel('html'));
	gulp.watch('source/scss/**/*.*', gulp.parallel('css'));
	gulp.watch('source/js/**/*', gulp.parallel('js'));
	gulp.watch('source/images/**/*.*', gulp.parallel('images'));
});


// Localhost server & build
gulp.task('dev', gulp.parallel('build', 'watch', 'browser-sync'), function () {
	
});


// *


// PUBLISH TASKS
// Publish the app to S3
gulp.task('publish-app', function() {
	// create a new publisher 
	var publisher = awspublish.create({
		"key": "AKIAIIKJNP62MPJVE2TQ",
		"secret": "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",
		"bucket": "thinkdifferently.digital",
		"region": "eu-central-1"
  	});
 
	return gulp.src('./app/**/*.*')
		.pipe(publisher.publish())
		.pipe(publisher.cache())
		.pipe($.awspublish.reporter());
});


// *


// PARKED TASKS
// // Inject bower components
// gulp.task('wiredep', function () {
// 	var wiredep = require('wiredep').stream;

// 	gulp.src('source/scss/*.scss')
// 		.pipe(wiredep({
// 			ignorePath: /^(\.\.\/)+/
// 		}))
// 		.pipe(gulp.dest('app/css'));

// 	gulp.src('source/html/**/*.html')
// 		.pipe(wiredep({
// 			exclude: ['bootstrap-sass-official'],
// 			ignorePath: /^(\.\.\/)*\.\./
// 		}))
// 		.pipe(gulp.dest('app'));
// });
