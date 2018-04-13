var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var toml = require('toml');
var del = require("del");
var rename = require("gulp-rename");


var themesPath = 'all-hugo-themes';
var themesImgPath = './static/theme-images';
var themesJsonPath = './data/themes.json';

var THEMEBUNDLE = {
  themes : []
};

var exclude_dirs = [
  '_script',
  '.git',
  'cocoa-eh-hugo-theme', // min_version value
  'html5', // theme.json instead of .toml
  'osprey', // min_version value
  'robust' // min_version value
  
];

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

function getToml(str) {
  return toml.parse(str)
}

function checkIncluded(fname) {
  // gutil.log(fname, exclude_dirs.indexOf(fname));
  return exclude_dirs.indexOf(fname) >= 0 ? false : true ;
}

function CLEAN (target) {
  gutil.log('---------- CLEANING ' + target + ' ----------');
  return del.sync(target);
}

function copyImage(path, theme) {
  return gulp.src(path)
        .pipe(rename(theme+'.png'))
        .pipe(gulp.dest(themesImgPath))
}

gulp.task('themes:assemble', function(done) {
  var folders = getFolders(themesPath);
  var tasks = folders.map(function(folder) {
    if (folder.length === 0) {
      return done(); 
    }
    if ( checkIncluded(folder) ) {
      var themePath = themesPath + '/' + folder + '/theme.toml';
      var imgPath = themesPath + '/' + folder + '/images/tn.png';
      
      var themetoml = fs.readFileSync( themePath , 'utf8');
      var themejson = getToml(themetoml);
      themejson['path'] = folder;
      
      if (fs.existsSync(imgPath)) {
        themejson['hasimage'] = true;
        // copyImage(imgPath, folder);
      } 
      
      THEMEBUNDLE.themes.push(themejson);
    }
  });

  done();
});

gulp.task('themes:write', function(done){
  var content = JSON.stringify(THEMEBUNDLE);
  fs.writeFile(themesJsonPath, content, 'utf8', function (err) {
    if (err) {
        return gutil.log(err)
    }
  })

  done();
});

gulp.task("themes:clean", function(done){
  CLEAN(themesJsonPath);
  CLEAN(themesImgPath);
  done();
});

gulp.task("themes", function(done){
  gutil.log('---------- BUILDING themes.json ----------');
  
  var site_tasks = gulp.series(
    "themes:clean",
    "themes:assemble",
    "themes:write"

  );
  site_tasks();
  done();
});