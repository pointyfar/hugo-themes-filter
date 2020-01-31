var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
require('dotenv').config();
var console = require('gulp-util');
var autoprefixer = require("gulp-autoprefixer");
var toml = require('toml');
var del = require("del");
var rename = require("gulp-rename");
var spawn = require('child_process').spawn;
var request = require("request");
var minimist = require("minimist");

/*
gulp.task('retire', function(done) {

    var args = [
      '--outputpath', 'retx.json',
      '--outputformat','json',
      '--path','./all-themes/meghna-hugo'
    ]
    console.log("args: ", args)
    
    cp.spawn('./node_modules/.bin/retire', args, {cwd: process.cwd()})
    return done();
    
    
    

});*/


var themesPath = 'all-themes';
var themesImgPath = './static/theme-images';
var themesJsonPath = './data/themes.json';

var GH_STARS = process.env.GITHUB_TOKEN;

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


function retire(dir) {
  var args = [
    '--outputpath', `./retire/${dir}.json`,
    '--outputformat','jsonsimple',
    '--path',`./${themesPath}/${dir}`
  ]

  return spawn('./node_modules/.bin/retire', args, {cwd: process.cwd()})
}


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
  // console.log(fname, exclude_dirs.indexOf(fname));
  return exclude_dirs.indexOf(fname) >= 0 ? false : true ;
}

function CLEAN (target) {
  console.log('---------- CLEANING ' + target + ' ----------');
  return del.sync(target);
}

function copyImage(path, theme) {
  return gulp.src(path)
        .pipe(rename(theme+'.png'))
        .pipe(gulp.dest(themesImgPath))
}

gulp.task('themes:assemble', function(done) {
  console.log('assembling themes:')
  var folders = getFolders(themesPath);
  var counter = 0;
  var tasks = folders.map(function(folder) {
    if (folder.length === 0) {
      return done(); 
    }
    if ( checkIncluded(folder) /*&& counter < 20*/ ) {
      counter++;
      
      console.log(`${counter} ${folder}`);
      /*retire(folder);*/
      var themePath = themesPath + '/' + folder + '/theme.';
      var imgPath = themesPath + '/' + folder + '/images/tn.png';
      
      var themetoml, themejson;
      
      if (fs.existsSync(`${themePath}toml`)) {
        themetoml = fs.readFileSync( `${themePath}toml` , 'utf8');
        themejson = getToml(themetoml);
      } else if (fs.existsSync(`${themePath}json`)) {
        console.log('json')
        themejson = JSON.parse(fs.readFileSync( `${themePath}json` , 'utf8'));
      } else {
        console.log(`theme ${folder} has no theme.toml/json`)
        return 
      }
      
      themejson['path'] = folder;
      themePromises.push(getGHinit(themejson))
        
    }
  });

  done();
});

gulp.task('themes:retire', function(done) {
  console.log('checking themes deps:')
  var folders = getFolders(themesPath);
  var counter = 0;
  var retiredresults = {};
  var tasks = folders.map(function(folder) {
    if (folder.length === 0) {
      return done(); 
    }
    if ( checkIncluded(folder) /*&& counter < 95*/ ) {
      
      var retPath = './retire/' + folder;
      var retjson = [];

      retire(folder);
      
      counter++;
    }
  });
  
  writeretire(retiredresults)
  done();
});

gulp.task('retire:write', function(done) {
  var retiredresults = {};
  var p = "./retire"
  fs.readdir(p, (err, files) => {
    files.forEach(file => {
      var retjson = {};
        if(file.length >0 ) {
          if((fs.readFileSync( `${p}/${file}` , 'utf8'))) {
            retjson = JSON.parse(fs.readFileSync(`${p}/${file}`, 'utf8'));

            if(retjson.length > 0) {
              var trimmed = {};
              trimmed["theme"] = file.substr(0,(file.length - 5));
              trimmed["data"] = [];
              
              for(var i = 0; i < retjson.length; i++){
                var results = [];
                var resx = {};
                for(var j = 0; j < retjson[i]['results'].length; j++){
                  var rjc = {}; 
                  rjc["component"] = retjson[i]["results"][j]["component"]
                  rjc["version"] = retjson[i]["results"][j]["version"]
                  rjc["vulnerabilities"] = [];
                  for(var k = 0; k < retjson[i]['results'][j]["vulnerabilities"].length; k++){
                    var vuln = {};
                    vuln["info"] = retjson[i]['results'][j]["vulnerabilities"][k]["info"];
                    vuln["severity"] = retjson[i]['results'][j]["vulnerabilities"][k]["severity"];
                    rjc["vulnerabilities"].push(vuln)
                  }
                  results.push(rjc);
                  resx["results"] = rjc;
                  resx["file"] = (retjson[i]["file"]).substring(56);
                  trimmed["data"].push(resx)
                }
              }
              
              retiredresults[file.substring(0,(file.length-5))] = trimmed;
            }
          }
          
          
          
          
        }
      
    });
    writeretire(retiredresults)
  });
  done()
});

function writeretire(results){
  try {
    fs.writeFile('./data/retired.json', JSON.stringify(results, null, ' '), 'utf8', function (err) {
      if (err) {return console.log(err)}
    })
  } catch {
    console.log("Oops, error writing file...")
  }
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

  return urls

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
  console.log('writing themes:')
  Promise.all(themePromises)
          .then( th => {
            THEMEBUNDLE.themes = th;
            //console.log('res', th)
            return JSON.stringify(THEMEBUNDLE, null, ' ');
          })
          .then( res => {
            fs.writeFile(themesJsonPath, res, 'utf8', function (err) {
              if (err) {
                return console.log(err)
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
  console.log('---------- BUILDING themes.json ----------');
  
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

