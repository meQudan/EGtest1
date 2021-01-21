const project_folder = './dist ';
const source_folder = './src';

const path = {
  build: {
    html: project_folder + '/',
    css: project_folder + '/css/',
    js: project_folder + '/js/',
    img: project_folder + '/img/',
    fonts: project_folder + '/fonts/',
  },
  src: {
    html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
    css: source_folder + '/scss/style.scss',
    js: source_folder + '/js/script.js',
    img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    fonts: source_folder + '/fonts/*.ttf',
  },
  watch: {
    html: source_folder + '/**/*.html',
    css: source_folder + '/**/*.scss',
    js: source_folder + '/**/*.js',
    img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
  },
  clean: './' + project_folder + '/',
};

const { src, dest, watch, parallel, series } = require('gulp'),
  browsersync = require('browser-sync').create(),
  fileinclude = require('gulp-file-include'),
  del = require('del'),
  scss = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  cleanCSS = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify-es').default,
  babel = require('gulp-babel'),
  webp = require('gulp-webp'),
  webphtml = require('gulp-webp-html'),
  webpcss = require('gulp-webpcss'),
  svgSprite = require('gulp-svg-sprite'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  fonter = require('gulp-fonter');

function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: './' + project_folder + '/',
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded',
      })
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true,
      })
    )
    .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(cleanCSS())
    .pipe(
      rename({
        extname: '.min.css',
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: '.min.js',
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.img)
    .pipe(dest(path.build.img))
    .pipe(
      webp({
        quality: 100,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}

function fonts(params) {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}

function watchFiles(params) {
  watch([path.watch.html], html);
  watch([path.watch.css], css);
  watch([path.watch.js], js);
  watch([path.watch.img], images);
}

function clean(params) {
  return del(path.clean);
}

const build = series(
  clean, 
  parallel(js, css, html, images, fonts)
);

// * tasks

function otf2ttfTask() {
  return src([source_folder + '/fonts/*.otf'])
    .pipe(fonter({ formats: ['ttf'] }))
    .pipe(dest(source_folder + '/fonts/'));
};

function svgSpriteTask() {
  return gulp
    .src([source_folder + '/iconsprite/*.svg'])
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../icons/icons.svg', //sprite file name
            example: true,
          },
        },
      })
    )
    .pipe(dest(path.build.img));
};

exports.otf2ttfTask = otf2ttfTask;
exports.svgSpriteTask = svgSpriteTask;
exports.default = parallel(build, watchFiles, browserSync);