const gulp = require('gulp'), // Gulp
  concat = require('gulp-concat'), // Concat multiple files
  gulpif = require('gulp-if'), // If statements
  clean = require('gulp-clean'), // Remove files and folders
  sourcemaps = require('gulp-sourcemaps'), // Inline sourcemaps in dev mode
  sass = require('gulp-sass'), // SCSS compiler
  autoprefixer = require('gulp-autoprefixer'), // Add browser prefixes
  uglify = require('gulp-uglify-es').default, // JS minify (ES6 Supported)
  browserSync = require('browser-sync').create(); // Synchronised browser testing

// File Paths
const jsPaths = 'app/assets/js/',
  jsLibPaths = 'app/assets/js/lib/',
  scssPath = 'app/assets/scss/',
  cssPath = 'app/assets/css/',
  htmlPath = 'app/**/*.html',
  mapsPath = 'app/assets/**/*/*.map';

// JS Paths
const paths = {
  scriptsLib: ['node_modules/jquery/dist/jquery.min.js'],
  scripts: [jsPaths + 'core.js'],
  scss: [scssPath + 'core.scss']
};

// Set env value
var env = process.env.NODE_ENV || 'dev';

//------------------------------------------------------------
// = TASKS
//------------------------------------------------------------
// BrowserSync
function browserSyncInit(done) {
  browserSync.init({
    server: {
      baseDir: './app/'
    },
    port: 3000
  });
  done();
}

// BrowserSync Reload
function browserSyncReload() {
  browserSync.reload();
}

// Clean
function cleanMap(done) {
  gulp
    .src(mapsPath, {
      read: false
    })
    .pipe(clean());
  done();
}

// Scripts Lib
function scriptsLib(done) {
  gulp
    .src(paths.scriptsLib)
    .pipe(gulpif(env === 'dev', sourcemaps.init({ largeFile: true })))
    .pipe(gulpif(env === 'prod', uglify()))
    .pipe(concat('lib.min.js'))
    .pipe(gulpif(env === 'dev', sourcemaps.write('/')))
    .pipe(gulp.dest(jsPaths))
    .pipe(browserSync.stream());
  done();
}

// Scripts
function scripts(done) {
  gulp
    .src(paths.scripts)
    .pipe(gulpif(env === 'dev', sourcemaps.init({ largeFile: true })))
    .pipe(gulpif(env === 'prod', uglify()))
    .pipe(concat('core.min.js'))
    .pipe(gulpif(env === 'dev', sourcemaps.write('/')))
    .pipe(gulp.dest(jsPaths))
    .pipe(browserSync.stream());
  done();
}

// SCSS
function scss(done) {
  gulp
    .src(paths.scss)
    .pipe(gulpif(env === 'dev', sourcemaps.init({ largeFile: true })))
    .pipe(
      gulpif(
        env === 'prod',
        sass({ outputStyle: 'compressed' }).on('error', sass.logError)
      )
    )
    .pipe(gulpif(env === 'dev', sass().on('error', sass.logError)))
    .pipe(autoprefixer())
    .pipe(gulpif(env === 'dev', sourcemaps.write('/')))
    .pipe(gulp.dest(cssPath))
    .pipe(browserSync.stream());
  done();
}

//------------------------------------------------------------
// = RUN TASKS
//------------------------------------------------------------

function watchFiles(done) {
  gulp.watch(paths.scriptsLib, gulp.series(scriptsLib));
  gulp.watch(paths.scripts, gulp.series(scripts));
  gulp.watch(scssPath + '**/*.scss', gulp.series(scss));
  gulp.watch(htmlPath).on('change', browserSyncReload);
  done();
}

const watch = gulp.series(browserSyncInit, watchFiles);
const build = gulp.series(gulp.parallel(scriptsLib, scripts, scss), cleanMap);
const develop = gulp.series(gulp.parallel(scriptsLib, scripts, scss), watch);

exports.cleanmap = cleanMap;
exports.watch = watch;
exports.build = build;
exports.default = develop;
