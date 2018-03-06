/*
*   Task Automation to make my life easier.
*   Author: Jean-Pierre Sierens
*   ===========================================================================
*/
 
// declarations, dependencies
// ----------------------------------------------------------------------------
var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var babelify = require('babelify');
var log = require('fancy-log');
var browserifyCss = require('browserify-css');
var urify = require('urify/transform');
 
// External dependencies you do not want to rebundle while developing,
// but include in your application deployment
var dependencies = [
    'react',
    'react-dom'
];
// keep a count of the times a task refires
var scriptsCount = 0;
 
// Gulp tasks
// ----------------------------------------------------------------------------
gulp.task('scripts', function () {
    bundleApp(false);
});
 
gulp.task('deploy', function (){
   return bundleApp(true);
});
 
gulp.task('watch', function () {
    return gulp.watch(['./src/*.js'], ['scripts']);
});
 
// When running 'gulp' on the terminal this task will fire.
// It will start watching for changes in every .js file.
// If there's a change, the task 'scripts' defined above will fire.
gulp.task('default', ['scripts','watch']);
 
// Private Functions
// ----------------------------------------------------------------------------
function bundleApp(isProduction) {
    scriptsCount++;
    // Browserify will bundle all our js files together in to one and will let
    // us use modules in the front end.
    var appBundler = browserify({
        entries: './src/index.js',
        debug: true
    })
 
    // If it's not for production, a separate vendors.js file will be created
    // the first time gulp is run so that we don't have to rebundle things like
    // react everytime there's a change in the js file
    if (!isProduction && scriptsCount === 1){
        // create vendors.js for dev environment.
        browserify({
            require: dependencies,
            debug: true
        })
            .bundle()
            .on('error', log)
            .pipe(source('vendors.js'))
            .pipe(gulp.dest('./gulp_build/'));
    }
    if (!isProduction){
        // make the dependencies external so they dont get bundled by the 
        // app bundler. Dependencies are already bundled in vendor.js for
        // development environments.
        dependencies.forEach(function(dep){
            appBundler.external(dep);
        })
    }
 
    return appBundler
        // transform ES6 and JSX to ES5 with babelify
        .transform("babelify", {presets: ["env", "react", "stage-0"]})
        .transform(browserifyCss, {
            global: true
        })
        .bundle()
        .on('error', log)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./gulp_build/'));
}
