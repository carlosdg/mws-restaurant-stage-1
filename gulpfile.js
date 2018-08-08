const gulp = require('gulp');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const imagemin = require('gulp-imagemin');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const browserSync = require('browser-sync').create();

const browsers = 'last 10 versions';

gulp.task('default', ['public'], function() {
  browserSync.init({
    server: {
      baseDir: 'public',
    },
    open: false
  });

  gulp.watch('src/**/*.html', ['public-html', browserSync.reload]);
  gulp.watch('src/css/**/*.css', ['public-styles', browserSync.reload]);
  gulp.watch('src/**/*.js', ['public-scripts', browserSync.reload]);
  gulp.watch('src/**/*.json', ['copy-json', browserSync.reload]);
  gulp.watch('src/img/**/*', ['copy-images', browserSync.reload]);
});

/**
 * Creates the public folder with all assets ready for production
 */
gulp.task('public', [
  'copy-images',
  'copy-json',
  'public-html',
  'public-scripts',
  'public-styles'
]);

/**
 * Copies images
 */
gulp.task('copy-images', function() {
  gulp.src('src/img/**/*').pipe(gulp.dest('public/img'));
});

/**
 * Copies JSON (manifest.json is the only one at the moment)
 */
gulp.task('copy-json', function() {
  gulp.src('src/**/*.json').pipe(gulp.dest('public'));
});

/**
 * Minify HTML files
 */
gulp.task('public-html', function() {
  return gulp
    .src(['src/**/*.html'])
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest('./public'));
});

/**
 * Transpiles, bundles and minifies scripts
 */
gulp.task('public-scripts', function() {
  const webpackConfig = require('./webpack.config');

  gulp.src(['src/js/**/*'])
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest('public'))
});

/**
 * Autoprefixes and minifies CSS
 */
gulp.task('public-styles', function() {
  gulp
    .src('src/css/**/*.css')
    .pipe(autoprefixer({ browsers: [browsers], cascade: false }))
    .pipe(cssnano({ zindex: false }))
    .pipe(gulp.dest('public/css'));
});

/**
 * Reduces the size of all images to the minimum possible
 */
gulp.task('optimize_images', () =>
  // Supposing that every file in img is an image
  gulp
    .src('src/img/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('src/img'))
);
