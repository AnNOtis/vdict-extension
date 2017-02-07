const gulp = require('gulp')
const babel = require('gulp-babel')
const sass = require('gulp-sass')
const del = require('del')
const browserify = require('gulp-browserify')

const paths = {
  scripts: 'src/*.js',
  sass: 'src/*.sass',
  images: 'src/images/*',
  vendors: 'src/vendors/*',
  manifest: 'src/manifest.json'
}

gulp.task('scripts', function () {
  gulp.src(paths.scripts)
    .pipe(babel())
    .pipe(browserify())
    .pipe(gulp.dest('dist'))
})

gulp.task('sass', function () {
  gulp.src(paths.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist'))
})

gulp.task('copy', function () {
  gulp.src(paths.manifest)
    .pipe(gulp.dest('dist'))
  gulp.src(paths.vendors)
    .pipe(gulp.dest('dist/vendors'))
  gulp.src(paths.images)
    .pipe(gulp.dest('dist/images'))
})

gulp.task('watch', function () {
  gulp.watch(paths.scripts, ['scripts'])
  gulp.watch(paths.images, ['images'])
  gulp.watch(paths.sass, ['sass'])
})

gulp.task('clean', function () {
  del.sync('dist/')
})

gulp.task('build', ['scripts', 'sass', 'copy'])

gulp.task('default', ['clean', 'build', 'watch'])
