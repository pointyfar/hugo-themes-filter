var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var autoprefixer = require("gulp-autoprefixer");
var toml = require('toml');
var del = require("del");
var rename = require("gulp-rename");
var splashy = require('splashy')();
var spawn = require('child_process').spawn;
var request = require("request");
var minimist = require("minimist");

var themesPath = 'all-themes';
var themesImgPath = './static/theme-images';
var themesJsonPath = './data/themes.json';

var getToken = function() {
  var gh_token = "";
  try {
    gh_token = fs.readFileSync("tokens/GH_STARS", "utf8")
  } catch(e) {
    console.log(e)
  }
  return gh_token
}

var GH_STARS = getToken();

var args = minimist(process.argv.slice(2),{
  string: 'token',
  default: {
    token: ''
  }
});

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

var exclude_stars = [
  "Shapez Theme"
]

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
    if ( checkIncluded(folder) /*&& counter < 20*/ ) {
      
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
        themePromises.push(getPromises(imgPath, themejson));
      } else {
        themePromises.push(Promise.resolve(themejson))
      }
      // copyImage(imgPath, folder);
        
    counter++;
    }
  });

  done();
});

function getPromises(imgPath, themejson) {
  return getColor(imgPath, themejson)
        .then(function(colres){
          return getGHinit(colres)
        })
}

function parseRepo(url){
  var nurl = url;
  if(url.indexOf('github.com:')>=0) {
    nurl = url.replace('git@','').replace('.com:','.com/').replace('.git','')
  } 
  
  var p = nurl.split('/')
  var ghidx = p.indexOf('github.com')
 
  var apiUrl = 'https://api.' 
      + p[ghidx] + '/repos/'
      + p[ghidx+1] + '/'
      + p[ghidx+2] ;
  var repo = 'https://' + p[ghidx] + '/' + p[ghidx+1] + '/' + p[ghidx+2];
  var urls = {
    api: apiUrl,
    gh: repo
  }
  if(url.indexOf('allegiant')>=0) {
    console.log(urls)
  }
  return urls

}

function getColor(imgPath, tj){
    return splashy.fromFile(imgPath)
                  .then(function(col) {
                    tj['colors'] = col;
                    return tj
                  });
}

function getGHinit(themejson) {
  var use_lic = false;
  var use_home = false;
  var use_sr = false;
  var repo_urls = {};
  
  if(exclude_stars.indexOf(themejson['name']) < 0 ) {
    if(themejson['licenselink']) {
      if( themejson['licenselink'].indexOf('github.com') > -1 ) {
        use_lic = true;
      }
      if( themejson['licenselink'].indexOf('yourname/yourtheme') > -1 ) {
        use_lic = false;
      }
    }
    
    if (themejson['homepage']) {
      if (themejson['homepage'].indexOf('github.com') > -1 ) {
        use_home = true;
      }
    }
    
    if (themejson['source_repo']) {
      if (themejson['source_repo'].indexOf('github.com') > -1 ) {
        use_sr = true;
      }
    }
    

    if(use_lic) {
      repo_urls = parseRepo(themejson['licenselink']);
      return getGHinfo(themejson, repo_urls)
    } else if(use_home) {
      repo_urls = parseRepo(themejson['homepage']);
      return getGHinfo(themejson, repo_urls)
    } else if(use_sr) {
      repo_urls = parseRepo(themejson['source_repo']);
      return getGHinfo(themejson, repo_urls)
    } else {
      return themejson
    }
  } else {
    return themejson
    
  }
}

function getGHinfo(themejson, urls) {
  var t = args['token'] ? args['token'] : 
          (GH_STARS ? GH_STARS : '' );

  return getData(urls.api, t)
      .then(function(result){
        let jres = JSON.parse(result)
        themejson['repo_stars'] = jres.stargazers_count;
        themejson['repo_updated'] = jres.pushed_at;
        themejson['repo_gh'] = urls.gh;
        
        return themejson;
      }).catch(function(e) {
        console.log('Error on', themejson['name'], e)
      })
        
}

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


function getData(url, token) {
    var options = {
        url: url,
        headers: {
            'User-Agent': 'nodejs'
        }
    };
    
    if(token) {
      options['headers']['Authorization'] = 'token ' + token;
    }
    
    return new Promise(function(resolve, reject) {
        request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        })
    })
}

