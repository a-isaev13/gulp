const { src, dest, watch, parallel, series } = require("gulp");

//Styles
const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const autoprefixer = require("gulp-autoprefixer");

function styles() {
  return src("./app/scss/style.scss")
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 version"],
      })
    )
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest("./app/css"))
    .pipe(browserSync.stream());
}
exports.styles = styles;

//JS
const uglify = require("gulp-uglify-es").default;

function scripts() {
  return src(["./app/js/*.js", "!app/js/main.min.js"])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("./app/js"))
    .pipe(browserSync.stream());
}
exports.scripts = scripts;

//Images
const avif = require("gulp-avif");
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");

function images() {
  return src(["./app/images/src/*.*", "!app/images/src/*.svg"])
    .pipe(newer("./app/images/"))
    .pipe(
      avif({
        quality: 50,
      })
    )
    .pipe(src("./app/images/src/*.*"))
    .pipe(newer("./app/images/"))
    .pipe(webp())
    .pipe(src("./app/images/src/*.*"))
    .pipe(newer("./app/images/"))
    .pipe(
      imagemin([
        imagemin.mozjpeg({ quality: 50, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
      ])
    )
    .pipe(dest("./app/images/"));
}
exports.images = images;

//SVG
const svgSprite = require("gulp-svg-sprite");

function sprite() {
  return src("./app/images/*.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "./../sprite.svg",
            example: true,
          },
        },
      })
    )
    .pipe(dest("./app/images/"));
}
exports.sprite = sprite;

//Include
const include = require("gulp-include");

function pages() {
  return src("./app/pages/*.html")
    .pipe(
      include({
        includePaths: "./app/components/**/",
      })
    )
    .pipe(dest("./app/"))
    .pipe(browserSync.stream());
}
exports.pages = pages;

//Watching
const browserSync = require("browser-sync").create();

function watching() {
  browserSync.init({
    server: {
      baseDir: "./app/",
    },
  });
  watch(["./app/scss/style.scss", "./app/components/**/*.scss"], styles);
  watch(["./app/images/src"], images);
  watch(["./app/js/main.js"], scripts);
  watch(["./app/pages/*", "./app/components/**/*"], pages);
  watch(["./app/*.html"]).on("change", browserSync.reload);
}
exports.watching = watching;

//Clean
const clean = require("gulp-clean");

function cleanDist() {
  return src("dist").pipe(clean());
}

//Build
function buildDist() {
  return src(
    [
      "./app/css/style.min.css",
      "./app/images/*.*",
      "./app/fonts/*.*",
      "!app/images/*.svg",
      "./app/images/sprite.svg",
      "./app/js/main.min.js",
      "./app/**/*.html",
    ],
    { base: "app" }
  ).pipe(dest("dist"));
}
exports.buildDist = buildDist;

exports.build = series(cleanDist, buildDist);
exports.default = parallel(styles, images, scripts, pages, watching);
