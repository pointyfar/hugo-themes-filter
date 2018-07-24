var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var hash = require("gulp-hash");
var toml = require('toml');
var del = require("del");
var rename = require("gulp-rename");
var splashy = require('splashy')();
var spawn = require('child_process').spawn;

var themesPath = 'all-themes';
var themesImgPath = './static/theme-images';
var themesJsonPath = './data/themes.json';

var THEMEBUNDLE = {
  themes : []
};

var themePromises = [];

var exclude_dirs = [
  '_script',
  '.github',
  '.git',
  'html5' // theme.json instead of .toml

  
];

function getFolders(dir) {
    return fs.readdirSync(dir)
      .filter(function(file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      });
}

function getToml(str) {
  var regex = /min_version *= *(\d\S*)/g;
  var mv = str.replace(regex, 'min_version = "$1"');
  return toml.parse(mv)

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
  var counter = 0;
  var tasks = folders.map(function(folder) {
    if (folder.length === 0) {
      return done(); 
    }
    if ( checkIncluded(folder) ) {
      //console.log(folder);
      var themePath = themesPath + '/' + folder + '/theme.';
      var imgPath = themesPath + '/' + folder + '/images/tn.png';
      
      var themetoml, themejson;
      if (fs.existsSync(`${themePath}toml`)) {
        themetoml = fs.readFileSync( `${themePath}toml` , 'utf8');
        themejson = getToml(themetoml);
      } else if (fs.existsSync(`${themePath}json`)) {
        console.log('json')
        themejson = JSON.parse(fs.readFileSync( `${themePath}json` , 'utf8'));
      }
      
      themejson['path'] = folder;
      var color = []
      themejson['colors'] = []
        
      if (fs.existsSync(imgPath)) {
        themejson['hasimage'] = true;
        themePromises.push(getColor(imgPath, themejson));
      } else {
        themePromises.push(Promise.resolve(themejson))
      }
      // copyImage(imgPath, folder);
        
    }
  });

  done();
});

function getColor(imgPath, tj){
    return splashy.fromFile(imgPath)
                  .then(function(col) {
                    tj['colors'] = col;
                    return tj
                  });
}

gulp.task("site:styles", function(done){
  
  del(["static/css/**/*"]);
  gulp.src("src/**/*.scss")
      .pipe(sass({
          outputStyle : "compressed"
      }))
      .pipe(autoprefixer({
          browsers : ["last 20 versions"]
      }))
      .pipe(hash())
      .pipe(gulp.dest("static/css"))
      .pipe(hash.manifest("hash.json"))
      .pipe(gulp.dest("data"))
      ;
      
  done();
  
});

gulp.task("site:scripts", function(done){
  
  del(["static/js/**/*"])
  
  gulp.src("src/**/*.js")
      .pipe(hash())
      .pipe(gulp.dest("static/js"))
      .pipe(hash.manifest("hash.json"))
      .pipe(gulp.dest("data"))
      ;
      
  done();
})


gulp.task('themes:write', function(done){
  
  Promise.all(themePromises)
          .then( th => {
            THEMEBUNDLE.themes = th;
            // gutil.log('res', th)
            return JSON.stringify(THEMEBUNDLE, null, ' ');
          })
          .then( res => {
            fs.writeFile(themesJsonPath, res, 'utf8', function (err) {
              if (err) {
                return gutil.log(err)
              }
            })
          })
          .then( d => {done()});

});

gulp.task("themes:clean", function(done){
  CLEAN(themesJsonPath);
  CLEAN(themesImgPath);
  done();
});

gulp.task("themes", function(done){
  gutil.log('---------- BUILDING themes.json ----------');
  
  var theme_tasks = gulp.series(
    "themes:clean",
    "themes:assemble",
    "themes:write"

  );
  theme_tasks();
  done();
});

gulp.task("site", function(done){
  gutil.log('---------- BUILDING ----------');
  
  CLEAN("./public")
  
  var build_tasks = gulp.series(
    "site:scripts",
    "site:styles"
  );

  build_tasks();
  
  done();
})

gulp.task("watch", function(done){
  gulp.watch("src/**/*.js", gulp.series("site:scripts"));
  gulp.watch("src/**/*.scss", gulp.series("site:styles"));

})