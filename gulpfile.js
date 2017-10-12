"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var server = require("browser-sync").create();
var cleanCSS = require("gulp-clean-css");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var run = require("run-sequence");
var del = require("del");
var cwebp = require("gulp-cwebp");
var rollup = require('gulp-better-rollup');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var babel = require('rollup-plugin-babel');
var nodeResolve = require('rollup-plugin-node-resolve');
var commonJS = require('rollup-plugin-commonjs');
var polyfill = require('babel-polyfill');

gulp.task("clean", function() {
  return del("build");
});

gulp.task("copy", function() {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "*.html"
  ], {
    base: "."
  })
  .pipe(gulp.dest("build"));
});

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths
    }))
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(cleanCSS())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task('scripts', function () {
  return gulp.src('js/**/script.js')
  .pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(rollup(
    {
      plugins: [
        nodeResolve(),
        commonJS(),
        babel({
          babelrc: false,
          exclude: 'node_modules/**',
          presets: [
            ['env', {modules: false}]
          ],
          plugins: [
            'external-helpers'
          ]
        })
      ]
    }, 'iife'))
  .pipe(uglify())
  .pipe(rename("script.min.js"))
	.pipe(sourcemaps.write(''))
  .pipe(gulp.dest('build/js/'));
});

gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("cwebp", function () {
  gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(cwebp())
    .pipe(gulp.dest("build/img"));
});

gulp.task("symbols", function() {
  return gulp.src("build/img/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img"));
  });

gulp.task('copy-html', function () {
  return gulp.src('*.html')
    .pipe(gulp.dest('build'))
    .pipe(server.stream());
});

gulp.task('js-watch', ['scripts'], function (done) {
  server.reload();
  done();
});

gulp.task("build", function(fn) {
    run(
      "clean",
      "copy",
      "style",
      "scripts",
      "images",
      "cwebp",
      "symbols",
      fn
    );
  });

gulp.task("serve", ["style"], function() {
  server.init({
    server: "./build",
    notify: false,
    open: true,
    port: 3502,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("js/**/*.js", ["scripts"]);
  gulp.watch("*.html").on("change", (e) => {
    if (e.type !== 'deleted') {
      gulp.start('copy-html');
    }
  });
});
