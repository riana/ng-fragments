/**
 * Created by riana on 12/01/15.
 */

/*global require*/
/*global process*/


var appName = 'ngFragments';
var buildDir = 'build';



var gulp = require('gulp');
var flatten = require('gulp-flatten');
var typescript = require('gulp-tsc');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rimraf = require('gulp-rimraf');

var runSequence = require('run-sequence');
var eventStream = require('event-stream');


gulp.task('build-all', function (callback) {
    runSequence('build', 'build-demo',
        callback);
});


gulp.task('clean', function() {
    return gulp.src(['build'], {
        read: false
    })
        .pipe(rimraf({
            force: true
        }));
});

gulp.task('build', function (callback) {
    runSequence('build-sass', 'build-ts', 'clean-ts-build',
        callback);
});

gulp.task('build-demo', function (callback) {
    runSequence('build-demo-sass', 'build-ts-demo', 'clean-ts-build',
        callback);
});



gulp.task('build-sass', function () {
    return gulp.src('./styles/*.scss', '!./styles/scss/_*.')
        .pipe(sass())
        .pipe(gulp.dest( buildDir + '/css'));
});

gulp.task('build-ts', function (callback) {
    runSequence('ts2js', 'main-ts',
        callback);
});

gulp.task('main-ts', function () {
    return gulp.src([buildDir + '/tsbuild/**/*.js'])
        .pipe(concat(appName+'.js'))
        .pipe(gulp.dest('build/js'));
});


gulp.task('ts2js', function(){
    var tsResult = gulp.src(['./scripts/*.ts'])
        .pipe(typescript({
            declaration: true,
            noExternalResolve: false,
            externals: false
        }))
        .pipe(gulp.dest(buildDir + '/tsbuild'));
    return tsResult;
});

gulp.task('clean-ts-build', function() {
    return gulp.src([buildDir + '/tsbuild', buildDir + '/tsbuild-demo'], {
        read: false
    })
        .pipe(rimraf({
            force: true
        }));
});


gulp.task('build-demo-sass', function () {
    return gulp.src('./demo/*.scss', '!./demo/_*.')
        .pipe(sass())
        .pipe(gulp.dest( buildDir + '/css'));
});

gulp.task('build-ts-demo', function (callback) {
    runSequence('ts2js-demo', 'main-ts-demo',
        callback);
});


gulp.task('main-ts-demo', function () {
    return gulp.src([buildDir + '/tsbuild-demo/**/*.js'])
        .pipe(concat('demo.js'))
        .pipe(gulp.dest('build/js'));
});

gulp.task('ts2js-demo', function(){
    var tsResult = gulp.src(['./demo/*.ts'])
        .pipe(typescript({
            declaration: true,
            noExternalResolve: false,
            externals: false
        }))
        .pipe(gulp.dest(buildDir + '/tsbuild-demo'));
    return tsResult;
});





