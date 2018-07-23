const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const cssnano = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const browserSync = require('browser-sync').create();

const browsers = 'last 10 versions';

gulp.task('dist', [
  'copy-images',
  'copy-json',
  'dist-html',
  'dist-scripts',
  'dist-styles'
]);

/**
 *
 */

gulp.task('default', ['dist'], function() {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  });

  gulp.watch('src/**/*.html', ['dist-html', browserSync.reload]);
  gulp.watch('src/css/**/*.css', ['dist-styles', browserSync.reload]);
  gulp.watch('src/**/*.js', ['dist-scripts', browserSync.reload]);
  gulp.watch('src/**/*.json', ['copy-json', browserSync.reload]);
  gulp.watch('src/img/**/*', ['copy-images', browserSync.reload]);
});

/**
 * Copies images
 */
gulp.task('copy-images', function() {
  gulp.src('src/img/**/*').pipe(gulp.dest('dist/img'));
});

/**
 * Copies JSON (manifest.json is the only one at the moment)
 */
gulp.task('copy-json', function() {
  gulp.src('src/**/*.json').pipe(gulp.dest('dist'));
});

/**
 * Minify HTML files
 */
gulp.task('dist-html', function() {
  return gulp
    .src(['src/**/*.html'])
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true
      })
    )
    .pipe(gulp.dest('./dist'));
});

/**
 * Transpiles, and minifies scripts
 */
gulp.task('dist-scripts', function() {
  gulp
    .src('src/**/*.js')
    .pipe(
      babel({
        presets: [
          [
            'env',
            {
              targets: {
                browsers: [browsers]
              }
            }
          ]
        ]
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

/**
 * Autoprefixes and minifies CSS
 */
gulp.task('dist-styles', function() {
  gulp
    .src('src/css/**/*.css')
    .pipe(
      autoprefixer({
        browsers: [browsers],
        cascade: false
      })
    )
    .pipe(cssnano())
    .pipe(gulp.dest('dist/css'));
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
