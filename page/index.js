'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var fs = require('fs');
var chalk = require('chalk');

var PageGenerator = yeoman.generators.NamedBase.extend({

  detectCodeLanguage: function() {
    this.usesTypeScript = fs.existsSync('src/app/startup.ts');
    this.codeFileExtension = this.usesTypeScript ? '.ts' : '.js';
  },

  init: function () {
    var codeLanguage = this.usesTypeScript ? 'TypeScript' : 'JavaScript';
    console.log('Creating page \'' + this.name + '-page\' (' + codeLanguage + ')...');
    this.componentName = this.name;
    this.dirname = 'scripts/app/pages/' + this._.dasherize(this.name+'-page') + '/';
    this.filename = this._.dasherize(this.name+'-page');
    this.viewModelClassName = this._.classify(this.name+'-page');
    this.labelName = this._.capitalize(this.name);
  },

  template: function () {
    var codeExtension = this.usesTypeScript ? '.ts' : '.js';
    this.copy('_view.html', this.dirname + this.filename + '.html');
    this.copy('_viewmodel' + this.codeFileExtension, this.dirname + this.filename + this.codeFileExtension);
  },

  addPageRegistration: function() {
    var startupFile = 'scripts/app/startup' + this.codeFileExtension;
    readIfFileExists.call(this, startupFile, function(existingContents) {
        var existingRegistrationRegex = new RegExp('\\bko\\.components\\.register\\(\s*[\'"]' + this.filename + '[\'"]');
        if (existingRegistrationRegex.exec(existingContents)) {
            this.log(chalk.white(this.filename) + chalk.cyan(' is already registered in ') + chalk.white(startupFile));
            return;
        }

        var token = '// [Scaffolded page registrations will be inserted here. To retain this feature, don\'t remove this comment.]',
            regex = new RegExp('^(\\s*)(' + token.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + ')', 'm'),
            modulePath = 'pages/' + this.filename + '/' + this.filename,
            lineToAdd = 'ko.components.register(\'' + this.filename + '\', { require: \'' + modulePath + '\' });',
            newContents = existingContents.replace(regex, '$1' + lineToAdd + '\n$&');
        fs.writeFile(startupFile, newContents);
        this.log(chalk.green('   registered ') + chalk.white(this.filename) + chalk.green(' in ') + chalk.white(startupFile));

        if (fs.existsSync('gulpfile.js')) {
            this.log(chalk.magenta('To include in build output, reference ') + chalk.white('\'' + modulePath + '\'') + chalk.magenta(' in ') + chalk.white('gulpfile.js'));
        }
    });
  },

  addRouteRegistration: function() {
    var routerFile = 'scripts/app/router' + this.codeFileExtension;
    readIfFileExists.call(this, routerFile, function(existingContents) {
        var existingRegistrationRegex = new RegExp("\{\s+url:\s+'"+ this.name +"',\s+params:\s+\{\s+page:\s+'"+ this.name +"-page'\s+\}\s+}");
        if (existingRegistrationRegex.exec(existingContents)) {
            this.log(chalk.white(this.filename) + chalk.cyan(' is already registered in ') + chalk.white(routerFile));
            return;
        }

        var token = '// [Scaffolded route registrations will be inserted here. To retain this feature, don\'t remove this comment.]',
            regex = new RegExp('^(\\s*)(' + token.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + ')', 'm'),
            modulePath = 'components/' + this.filename + '/' + this.filename,
            lineToAdd = ',{ url: "'+  this.name +'", label: "'+ this.name +'", params: { page: "'+  this.name +'-page" }}',
            newContents = existingContents.replace(regex, '$1' + lineToAdd + '\n$&');
        fs.writeFile(routerFile, newContents);
        this.log(chalk.green('   registered ') + chalk.white(this.filename) + chalk.green(' in ') + chalk.white(routerFile));

        if (fs.existsSync('gulpfile.js')) {
            this.log(chalk.magenta('To include in build output, reference ') + chalk.white('\'' + modulePath + '\'') + chalk.magenta(' in ') + chalk.white('gulpfile.js'));
        }
    });
  }

});

function readIfFileExists(path, callback) {
    if (fs.existsSync(path)) {
        callback.call(this, this.readFileAsString(path));
    }
}

module.exports = PageGenerator;
