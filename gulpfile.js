const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
 
/**
 * Reduces the size of all images to the minimum possible
 */
gulp.task('optimize_images', () =>
    // Supposing that every file in img is an image
    gulp.src('img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('img'))
);