var gulp = require('gulp');
var del = require('del');
var less = require('gulp-less');
var merge = require('merge-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var babel = require('gulp-babel');

gulp.task('clean', function (cb) {
  del(['public/css', 'public/javascript', 'public/fonts'], cb);
});

gulp.task('less', function () {
  return gulp.src('public/less/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('public/css'));
});

gulp.task('fonts', function () {
  return gulp.src('node_modules/bootstrap/fonts/**')
    .pipe(gulp.dest('public/fonts'));
});

gulp.task('build:css', gulp.series(gulp.parallel('less', 'fonts'), function () {
  return gulp.src('public/css/**/*.css')
    .pipe(concat('style.css'))
    .pipe(gulp.dest('public/css'));
}));

gulp.task('build:js', function() {
  var compiledJsx = gulp.src('./public/jsx/**.jsx')
    .pipe(babel({
      presets: ['react']
    }));
  var libs = gulp.src(['bower_components/react-bootstrap/react-bootstrap.js']);
  return merge(libs, compiledJsx)
    .pipe(sourcemaps.init())
    .pipe(concat('script.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/javascript'));
});

gulp.task('default', gulp.series('clean', gulp.parallel('build:css', 'build:js')));
