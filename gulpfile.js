var gulp        = require('gulp'),         //Include Gulp
    sass        = require('gulp-sass'),    //Include SASS to CSS compiler
    browserSync = require('browser-sync'), //Include automatic sever with refreshment
    concat      = require('gulp-concat'),  // Include libraries concatenation
    uglify      = require('gulp-uglifyjs'), // Include libraries compression
    cssnano     = require('gulp-cssnano'), //Include CSS libraries minification
    rename      = require('gulp-rename'),
    del         = require('del'),          //Include cleaning utility
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    cache       = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function() {
  return gulp.src('app/sass/**/*.sass')   //Taking all .sass files
             .pipe(sass())                //SASS to CSS compilation
             .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade:true}))
             .pipe(gulp.dest('app/css'))  //Upload to CSS folder
             .pipe(browserSync.reload({stream: true}))
});

gulp.task('css-libs', ['sass'], function() {
  return gulp.src('app/css/libs.css') //Taking library files
             .pipe(cssnano()) //Compressing them
             .pipe(rename({suffix: '.min'})) //Adding MIN suffix
             .pipe(gulp.dest('app/css')); //Uploading to CSS folder
});

gulp.task('scripts', function() {
  return gulp.src([ //Libraries to be compressed
                    'app/libs/jquery/dist/jquery.min.js'
                  ])
             .pipe(concat('libs.min.js')) //Collect all librarie to one file
             .pipe(uglify())              //Compress JS files
             .pipe(gulp.dest('app/js'))   //Uploading to JS folder

});

gulp.task('browser-sync', function() {
  browserSync({
    server: {        //Server parameters declaration
      baseDir: 'app' //Server directory
    },
    notify: false   //Disable notifications
  });
});

gulp.task('watch', ['browser-sync', 'css-libs', 'sass', 'scripts'], function() {
    gulp.watch('app/sass/**/*.sass', ['sass']);       //Checking for changes in files
    gulp.watch('app/*.html', browserSync.reload);     //Checking for changes in files
    gulp.watch('app/js/**/*.js', browserSync.reload); //Checking for changes in files
});

gulp.task('clean', function() {
  return del.sync('dist'); //Delete dist folder before production
});

gulp.task('img', function() {
  return gulp.src('app/img/**/*')
             .pipe(cache(imagemin({       //Image comperssion
                   interlaced: true,
                   progressive: true,
                   svgoPlugins: [{removeViewBox: false}],
                   use: [pngquant()]
             })))
             .pipe(gulp.dest('dist/img'));
});

//Production task
gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function(){
  //Moving styles
  var buildCss = gulp.src([
                            'app/css/main.css',
                            'app/css/libs.min.css'
                          ])
                     .pipe(gulp.dest('dist/css'))
  //Moving fonts
  var buildFonts = gulp.src('app/fonts/**/*')
                     .pipe(gulp.dest('dist/fonts'))
  //Moving styles
  var buildJS = gulp.src('app/js/**/*')
                     .pipe(gulp.dest('dist/js'))

  //Moving HTML
  var buildHTML = gulp.src('app/*.html')
                    .pipe(gulp.dest('dist'))
});

gulp.task('clear', function() {
  return cache.clearAll();
});

gulp.task('default', ['watch']);
