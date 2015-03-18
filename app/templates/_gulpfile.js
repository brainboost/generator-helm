// Node modules
var fs = require('fs'), vm = require('vm'), merge = require('deeply'), chalk = require('chalk'), es = require('event-stream');

// Gulp and plugins
var gulp = require('gulp'), rjs = require('gulp-requirejs-bundler'), concat = require('gulp-concat'), clean = require('gulp-clean'),
    replace = require('gulp-replace'), uglify = require('gulp-uglify'), htmlreplace = require('gulp-html-replace')<% if(usesTypeScript) { %>, typescript = require('gulp-tsc')<% } %>;

// Config
var requireJsRuntimeConfig = vm.runInNewContext(fs.readFileSync('src/app/require.config.js') + '; require;');
    requireJsOptimizerConfig = merge(requireJsRuntimeConfig, {
        out: 'scripts.js',
        baseUrl: './src',
        name: 'app/startup',
        paths: {
            requireLib: 'bower_modules/requirejs/require'
        },
        include: [
            'requireLib',
            'components/nav-bar/nav-bar',
            'components/home-page/home',
            'text!components/about-page/about.html'
        ],
        insertRequire: ['app/startup'],
        bundles: {
            // If you want parts of the site to load on demand, remove them from the 'include' list
            // above, and group them into bundles here.
            // 'bundle-name': [ 'some/module', 'another/module' ],
            // 'another-bundle-name': [ 'yet-another-module' ]
        }
    });
<% if (usesTypeScript) { %>
// Compile all .ts files, producing .js and source map files alongside them
gulp.task('ts', function() {
    return gulp.src(['**/*.ts'])
        .pipe(typescript({
            module: 'amd',
            sourcemap: true,
            outDir: './'
        }))
        .pipe(gulp.dest('./'));
});
<% } %>
// Discovers all AMD dependencies, concatenates together all required .js files, minifies them
gulp.task('js', <% if (usesTypeScript) { %>['ts'], <% } %>function () {
    return rjs(requireJsOptimizerConfig)
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(gulp.dest('./dist/'));
});

// Concatenates CSS files, rewrites relative paths to Bootstrap fonts, copies Bootstrap fonts
gulp.task('css', function () {
    var bowerCss = gulp.src('src/bower_modules/components-bootstrap/css/bootstrap.min.css')
            .pipe(replace(/url\((')?\.\.\/fonts\//g, 'url($1fonts/')),
        appCss = gulp.src('src/css/*.css'),
        combinedCss = es.concat(bowerCss, appCss).pipe(concat('css.css')),
        fontFiles = gulp.src('./src/bower_modules/components-bootstrap/fonts/*', { base: './src/bower_modules/components-bootstrap/' });
    return es.concat(combinedCss, fontFiles)
        .pipe(gulp.dest('./dist/'));
});

// Copies index.html, replacing <script> and <link> tags to reference production URLs
gulp.task('html', function() {
    return gulp.src('./src/index.html')
        .pipe(htmlreplace({
            'css': 'css.css',
            'js': 'scripts.js'
        }))
        .pipe(gulp.dest('./dist/'));
});
<% if (!usesTypeScript) { %>
// Removes all files from ./dist/
gulp.task('clean', function() {
    return gulp.src('./dist/**/*', { read: false })
        .pipe(clean());
});
<% } else { %>
// Removes all files from ./dist/, and the .js/.js.map files compiled from .ts
gulp.task('clean', function() {
    var distContents = gulp.src('./dist/**/*', { read: false }),
        generatedJs = gulp.src(['src/**/*.js', 'src/**/*.js.map'<% if(includeTests) { %>, 'test/**/*.js', 'test/**/*.js.map'<% } %>], { read: false })
            .pipe(es.mapSync(function(data) {
                // Include only the .js/.js.map files that correspond to a .ts file
                return fs.existsSync(data.path.replace(/\.js(\.map)?$/, '.ts')) ? data : undefined;
            }));
    return es.merge(distContents, generatedJs).pipe(clean());
});
<% } %>

gulp.task('default', ['html', 'js', 'css'], function(callback) {
    callback();
    console.log('\nPlaced optimized files in ' + chalk.magenta('dist/\n'));
});

gulp.task('build', ['default'], function(){
    console.log('\nStarting node-webkit app compilation using files from ' + chalk.magenta('dist/\n'));
    var fs = require('fs');
    var getPackageJson = function () {
        return JSON.parse(fs.readFileSync('./src/package.json', 'utf8'));
    };
    var getCurrentVersion = function () {
      return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
    };
    var setPackageJson = function (config) {
      return fs.writeFileSync('./dist/package.json', JSON.stringify(config), 'utf8');
    };

    //gulp.src('./src/package.json').pipe(gulp.dest('./dist/'));
    var pkg = getPackageJson()
    pkg.version = getCurrentVersion()
    setPackageJson(pkg)

    var NwBuilder = require('node-webkit-builder');
    var nw = new NwBuilder({
        files: './dist/**/**', // use the glob format
        //platforms: ['win32', 'win64', 'osx32', 'osx64', 'linux32', 'linux64']
        platforms: ['win64'],
        buildDir: './build'
    });

    //Log stuff you want

    nw.on('log',  console.log);

    // Build returns a promise
    nw.build().then(function () {
        console.log('\nPlaced build files in ' + chalk.cyan('build/\n'));
        console.log(chalk.lime('all done!'));
    }).catch(function (error) {
        console.error(chalk.red(error));
    });
});