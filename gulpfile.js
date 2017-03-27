var gulp         = require('gulp');
var sass         = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps   = require('gulp-sourcemaps');
var browser_sync = require('browser-sync');
var uglify       = require('gulp-uglify');
var concat       = require('gulp-concat');
var rename       = require('gulp-rename');
var run_sequence = require('run-sequence');
var del          = require('del');

/**
 * App specs
 */
var app = {
    dist_path: './dist',
    src_path:  './src',
    main_css_file_name: 'main.min.css',
    main_js_file_name:  'main.min.js',
    open_browser_on_server_start: true
};

/**
 * Commonly used dist paths
 */
var dist_path = {
    root:  app.dist_path,
    css:   app.dist_path+'/assets/css',
    js:    app.dist_path+'/assets/js',
    fonts: app.dist_path+'/assets/fonts',
    images:app.dist_path+'/images'
};

/**
 * Commonly used src paths
 */
var src_path = {
    root:   app.src_path,
    sass:   app.src_path+'/scss',
    js:     app.src_path+'/js',
    images: app.src_path+'/images',
    vendor: app.src_path+'/bower_components',
    bootstrap: {
        root:  app.src_path+'/bower_components/bootstrap-sass/assets',
        js:    app.src_path+'/bower_components/bootstrap-sass/assets/javascripts/bootstrap',
        fonts: app.src_path+'/bower_components/bootstrap-sass/assets/fonts'
    }
};

/**
 * .js files to compile
 */
var js_files = [
    src_path.vendor+'/jquery/dist/jquery.min.js',
    //src_path.bootstrap.root+'/javascripts/bootstrap.min.js',
    src_path.bootstrap.js+'/affix.js',
    src_path.bootstrap.js+'/alert.js',
    src_path.bootstrap.js+'/button.js',
    src_path.bootstrap.js+'/carousel.js',
    src_path.bootstrap.js+'/collapse.js',
    src_path.bootstrap.js+'/dropdown.js',
    src_path.bootstrap.js+'/tab.js',
    src_path.bootstrap.js+'/transition.js',
    src_path.bootstrap.js+'/scrollspy.js',
    src_path.bootstrap.js+'/modal.js',
    src_path.bootstrap.js+'/tooltip.js',
    src_path.bootstrap.js+'/popover.js',
    //general JS files
    src_path.js+'/**/*.js'
];

/**
 * Compile .scss files into dist
 * Use autoprefixer
 * Write sourcemaps
 * Reload browser
 */
gulp.task('sass', function() {
    return gulp.src(src_path.sass+'/**/*.scss')
        .pipe(sourcemaps.init())
            .pipe(sass({
                outputStyle: 'compressed',
                onError: browser_sync.notify
            })
                .on('error', sass.logError))
            .pipe(autoprefixer({
                browsers: ['ie 8', 'ie 9', 'last 2 versions']
            }))
        .pipe(rename(app.main_css_file_name))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dist_path.css))
        // make browser_sync inject only .css files with 'match'
        .pipe(browser_sync.stream({match: '**/*.css'}));
});

// To be implemented
// gulp.task('sass:dev', function() {
//     return gulp.src(src_path.sass+'/**/*.scss')
//         .pipe(sourcemaps.init())
//             .pipe(sass({
//                 outputStyle: 'nested',
//                 onError: browser_sync.notify
//             })
//                 .on('error', sass.logError))
//             .pipe(autoprefixer({
//                 browsers: ['ie 8', 'ie 9', 'last 2 versions']
//             }))
//         .pipe(rename(app.main_css_file_name))
//         .pipe(sourcemaps.write('.'))
//         .pipe(gulp.dest(dist_path.css))
//         // make browser_sync inject only .css files with 'match'
//         .pipe(browser_sync.stream({match: '**/*.css'}));
// });

/**
 * Move .html/.php files into dist
 * Reload browser
 */
gulp.task('html', function() {
    return gulp.src(src_path.root+'/**/*.html')
        .pipe(gulp.dest(dist_path.root))
        .pipe(browser_sync.stream());
});

gulp.task('php', function() {
    return gulp.src(src_path.root+'/**/*.php')
        .pipe(gulp.dest(dist_path.root))
        .pipe(browser_sync.stream());
});

/**
 * Compress .js into dist
 */
gulp.task('js', function() {
    return gulp.src(js_files)
        .pipe(sourcemaps.init())
            .pipe(concat(app.main_js_file_name))
            .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dist_path.js))
        .pipe(browser_sync.stream());
});

// To be implemented
// gulp.task('js:dev', function() {
//     return gulp.src(js_files)
//         .pipe(sourcemaps.write('.'))
//         .pipe(gulp.dest(dist_path.js))
//         .pipe(browser_sync.stream());
// });

/**
 * Move Bootstrap fonts into dist
 */
gulp.task('bootstrap:fonts', function() {
    return gulp.src(src_path.bootstrap.fonts+'/**/*')
        .pipe(gulp.dest(dist_path.fonts));
});

/**
 * Move imgs into dist
 */
gulp.task('images', function() {
    return gulp.src(src_path.root+'/images/**/*.{jpeg,jpg,png}')
        .pipe(gulp.dest(dist_path.images))
});

/**
 * Setup browser-sync server with dist folder as root
 * Wait for build task to be finished
 */
gulp.task('browser-sync-server', ['build'], function() {
    browser_sync({
        open: app.open_browser_on_server_start,
        //browser: 'google chrome',
        proxy: '127.0.0.1:8000',
        port: 3000,
        notify: true
    })
});

/**
 * Watch files and run task when they change
 */
gulp.task('watch', function() {
    gulp.watch(src_path.sass+'/**/*.+(scss|sass)', ['sass']);
    gulp.watch(src_path.root+'/**/*.html', ['html']);
    gulp.watch(src_path.root+'/**/*.php', ['php']);
    gulp.watch(src_path.root+'/js/**/*.js', ['js']);
    gulp.watch(src_path.root+'/images/**/*.{jpeg,jpg,png}', ['images']);
});

/**
 * Delete dist
 */
gulp.task('clean', function(cb) {
    del([
        dist_path.root
    ], cb);
});

/**
 * Build dist
 */
gulp.task('build', ['sass', 'html', 'php', 'js', 'bootstrap', 'images']);

/**
 * Build Bootstrap
 */
gulp.task('bootstrap', ['bootstrap:fonts']);

/**
 * Default
 */
gulp.task('default', function(callback) {
    run_sequence(
        ['clean', 'watch'],
        ['build'],
        ['browser-sync-server'],
        callback
    );
});