#! /usr/bin/env node
var UglifyJS = require('uglify-js');
var cheerio = require('cheerio');
var path = require('path');
var fs = require("fs");

var lib  = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');

var result = UglifyJS.minify(lib + '/cache_asset.js', {
	mangle: true,
	compress: {
		sequences: true,
		dead_code: true,
		conditionals: true,
		booleans: true,
		unused: true,
		if_return: true,
		join_vars: true,
		drop_console: true
	}
});

var workingDirectory = process.cwd();
var insertCode = result.code;

var userArgs = process.argv.slice(2);
var targetFilePath = path.join(workingDirectory, userArgs[0]);
var parseVersionNumberFunc = eval(userArgs[1]);

fs.readFile(targetFilePath, 'utf-8', function(err, data){
  if (err) {
    return console.log(err);
  }
  $ = cheerio.load(data);
  var items = [];

  $('link[rel="stylesheet"]').each(function(i, item){
    var src = $(item).attr('href');
    if(!src){
      return;
    }
    var version = parseVersionNumberFunc(src);
    var key = src.replace(version, '');
    items.push({
      downloadUrl: src,
      version: version,
      key: key
    });

    $(item).remove();
  });

  $('script').each(function(i, item){
    var src = $(item).attr('src');
    if(!src){
      return;
    }
    var version = parseVersionNumberFunc(src);
    var key = src.replace(version, '');
    items.push({
      downloadUrl: src,
      version: version,
      key: key
    });

    $(item).remove();
  });

  $('body').append('<script>' + insertCode + '</script>');
  var stringifyItems = JSON.stringify(items);
  var runningScript = 'cache_asset.init(' + stringifyItems + ');';
  $('body').append('<script>' + runningScript + '</script>');
  fs.writeFile(targetFilePath, $.html(), function(err) {
    if(err) {
        return console.log(err);
    }
  });
});
