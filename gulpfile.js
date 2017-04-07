var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var exorcist = require('exorcist');
var sass = require('gulp-sass');
var scsslint = require('gulp-scss-lint');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var jshint = require('gulp-jshint');
var src = {
    scss: './scss/**/*.scss',
    css: './css',
    html: './*.html'
};
var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
};

function bundle(bundler) {
    return bundler
        .bundle()
        .on('error', function (e) {
            gutil.log(e);
        })
        .pipe(exorcist('./js/dist/app.js.map'))
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./js/dist'))
        .pipe(browserSync.stream());
}

gulp.task('watch', function () {
    watchify.args.debug = true;

    var watcher = watchify(browserify('./js/app.js', watchify.args));

    bundle(watcher);

    watcher.on('update', function () {
        bundle(watcher);
    })

    watcher.on('log', gutil.log);

    gulp.watch(src.scss, ['sass']).on('change', function(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });

    gulp.watch(src.html).on('change', reload);

    browserSync.init({
        server: "./",
        logFileChanges: false
    });
})

gulp.task('js', function () {
    return bundle(browserify('./js/app.js'));
});

gulp.task('sass', function () {
    return gulp
        .src(src.scss)
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer())
        .pipe(gulp.dest(src.css))
        .pipe(browserSync.stream());
});

gulp.task('scss-lint', function() {
    return gulp.src(src.scss)
        .pipe(scsslint({
            'config': '.scss-lint.yml'
        }));
});

gulp.task('fonts', function() {
    return gulp.src(['./node_modules/font-awesome/fonts/fontawesome-webfont.*'])
        .pipe(gulp.dest('./fonts/'));
});

gulp.task('externalcss', function() {
    return gulp.src(['./node_modules/normalize.css/*.css'])
        .pipe(gulp.dest('./css/libs/'));
});

gulp.task('jshint', function () {
    return gulp.src('./js/src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
})

gulp.task('default', ['fonts', 'js', 'externalcss', 'sass', 'scss-lint']);
