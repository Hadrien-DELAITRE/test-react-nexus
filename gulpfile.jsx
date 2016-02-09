import fs from 'fs';
import path from 'path';
import Promise from 'bluebird';
import csswring from 'csswring';
import gulp from 'gulp';
import changed from 'gulp-changed';
import babel from 'gulp-babel';
import copy from 'gulp-copy';
import concat from 'gulp-concat';
import eslint from 'gulp-eslint';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import gutil from 'gulp-util';
import should from 'should/as-function';
import webpack from 'webpack';
import gwebpack from 'webpack-stream';
import rimraf from 'rimraf';
import babelConfig from './config/babel/node';
import webpackConfig from './webpackConfig';


const readFileAsync = Promise.promisify(fs.readFile);

function clean(dir) {
  return (done) => {
    rimraf(dir, done);
  };
}

function lint(glob) {
  return () => gulp.src(glob)
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format());
}

function copyNonJSX(glob, { dest, prefix = 1 }) {
  return () => gulp.src(glob)
    .pipe(copy(dest, { prefix }));
}

function buildJSX(glob, { dest, babelConfig }) {
  return () => gulp.src(glob, { base: '.' })
    .pipe(changed('dist', { extension: '.js', hasChanged: changed.compareSha1Digest }))
    .pipe(sourcemaps.init())
    .pipe(babel(babelConfig))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest));
}



function buildCSS({ shouldUglify, filename, dest }) {
  return () => gulp.src('node_modules/normalize.css/normalize.css')
    .pipe(plumber())
    .pipe(shouldUglify ? gutil.noop() : sourcemaps.init())
    .pipe(shouldUglify ? postcss([csswring]) : gutil.noop())
    .pipe(concat(filename))
    .pipe(shouldUglify ? gutil.noop() : sourcemaps.write())
    .pipe(gulp.dest(dest))
  ;
}

function buildJS({ shouldUglify, filename, dest, webpackConfig }) {
  return () => gulp.src('src/client.jsx')
    .pipe(plumber())
    .pipe(shouldUglify ? gutil.noop() : sourcemaps.init())
    .pipe(gwebpack(webpackConfig, webpack))
    .pipe(rename(filename))
    .pipe(shouldUglify ? uglify({
      mangle: { except: ['GeneratorFunction'] },
    }) : gutil.noop())
    .pipe(shouldUglify ? gutil.noop() : sourcemaps.write())
    .pipe(gulp.dest(dest))
  ;
}

function checkClientCanary(path) {
  // sanity check: the client canary is not included in the bundle
  return () => readFileAsync(path, { encoding: 'utf8' })
  .then((clientCode) =>
    should(clientCode.includes('CLIENT_CANARY')).not.be.ok()
  );
}



const shouldUglify = false;
const staticAssets = {
  css: path.join('static', 'c.css'),
  js: path.join('static', 'c.js'),
};

const JSX_FILES = ['src/**/*.jsx', 'config/**/*.jsx'];
const NON_JSX_FILES = ['package.json', 'static/**/**'];

const buildTask = buildJSX(JSX_FILES, { babelConfig, dest: 'dist/www' });
const copyTask = copyNonJSX(NON_JSX_FILES, { dest: 'dist' });

// Removes "dist" directory
gulp.task('clean', clean('./dist'));

// Runs eslint on all JSX files
gulp.task('lint', lint(JSX_FILES.concat(['gulpfile.jsx'])));

// Copy non JSX files to "dist" directory
gulp.task('copyNonJSX', ['clean'], copyTask);

// Compiles share JSX files
gulp.task('buildServer', ['clean', 'lint', 'copyNonJSX'], buildTask);

// Collects css and dumps then in a single file
gulp.task('buildClientCSS', ['clean', 'lint'], buildCSS({
  filename: staticAssets.css,
  dest: 'dist',
  shouldUglify,
}));

// Compiles client.jsx with webpack
gulp.task('buildClientJS', ['clean', 'lint'], buildJS({
  filename: staticAssets.js,
  dest: 'dist',
  shouldUglify,
  webpackConfig,
}));

// Builds client-side app (css + js)
gulp.task('buildClient', ['buildClientCSS', 'buildClientJS']);

// Copies statics and package.json files
gulp.task('build', ['copyNonJSX', 'buildServer', 'buildClient']);

// Checks that we did not bundle the server config in the client-side app
gulp.task('checkClientCanary', ['build'], checkClientCanary('dist/static/c.js'));

// Runs default task
gulp.task('default', ['build']);
