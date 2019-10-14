var gulp            = require('gulp'), // Gulp
    concat          = require("gulp-concat"), // Concat multiple files
    gulpif          = require("gulp-if"), // If statements
    clean           = require("gulp-clean"), // Remove files and folders
    sourcemaps      = require('gulp-sourcemaps'), // Inline sourcemaps in dev mode
    sass            = require("gulp-sass"), // SCSS compiler
    autoprefixer    = require("gulp-autoprefixer"), // Add browser prefixes
    uglify          = require("gulp-uglify-es").default, // JS minify (ES6 Supported)
    browserSync     = require("browser-sync").create(); // Synchronised browser testing


// File Paths
var jsPaths         = "app/assets/js/",
    jsLibPaths      = "app/assets/js/lib/",
    scssPath        = "app/assets/scss/",
    cssPath         = "app/assets/css/",
    htmlPath        = "app/**/*.html",
    mapsPath        = "app/assets/**/*/*.map";

// JS Paths
var paths = {
    scriptsLib: [
        "node_modules/jquery/dist/jquery.min.js",
        /*jsLibPaths + 'xxxxxxxx.js',*/
    ],
    scripts: [
        jsPaths + "core.js"
    ],
    scss: [
        scssPath + "core.scss"
    ]
};


// Set env value
var env = process.env.NODE_ENV || "dev" ;


//------------------------------------------------------------
// = TASKS
//------------------------------------------------------------

// Clean
gulp.task("clean-map", function() {
    return gulp.src(mapsPath, {read: false})
        .pipe(clean());
});

// Scripts Lib
gulp.task("scriptsLib", function() {
    return gulp.src(paths.scriptsLib)
        .pipe(gulpif(env === "dev", sourcemaps.init({largeFile: true})))
        .pipe(gulpif(env === "prod", uglify()))
        .pipe(concat("lib.min.js"))
        .pipe(gulpif(env === "dev", sourcemaps.write("/")))
        .pipe(gulp.dest(jsPaths))
        .pipe(browserSync.stream());
});

// Scripts
gulp.task("scripts", function() {
    return gulp.src(paths.scripts)
        .pipe(gulpif(env === "dev", sourcemaps.init({largeFile: true})))
        .pipe(gulpif(env === "prod", uglify()))
        .pipe(concat("core.min.js"))
        .pipe(gulpif(env === "dev", sourcemaps.write("/")))
        .pipe(gulp.dest(jsPaths))
        .pipe(browserSync.stream());
});


// SCSS
gulp.task("scss", function() {
    return gulp.src(paths.scss)
        .pipe(gulpif(env === "dev", sourcemaps.init({largeFile: true})))
        .pipe(gulpif(env === "prod", sass({outputStyle: "compressed"}).on("error", sass.logError)))
        .pipe(gulpif(env === "dev", sass().on("error", sass.logError)))
        .pipe(autoprefixer())
        .pipe(gulpif(env === "dev", sourcemaps.write("/")))
        .pipe(gulp.dest(cssPath))
        .pipe(browserSync.stream());
});


//------------------------------------------------------------
// = RUN TASKS
//------------------------------------------------------------

gulp.task("serve", gulp.series("scriptsLib", "scripts", "scss", function() {

    browserSync.init({
        server: "app",
        port: 3000,
        notify: false/*,
        proxy: {
            target: "",
            ws: true
        }*/
    });

    gulp.watch(paths.scriptsLib, gulp.series("scriptsLib"));
    gulp.watch(paths.scripts, gulp.series("scripts"));
    gulp.watch(scssPath + "**/*.scss", gulp.series("scss"));
    gulp.watch(htmlPath).on("change", browserSync.reload);

}));


gulp.task("default", gulp.series("serve"));
gulp.task("prod", gulp.series("scriptsLib", "scripts", "scss", "clean-map"));






























