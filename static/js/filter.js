var selectAllBtn = document.querySelector('#selectAllBtn');
var tagButtons = document.getElementsByClassName('tag-button');

var tiles = document.getElementsByClassName('filterDiv');
var items = document.getElementsByClassName('item');


var licenseBtns = document.getElementsByClassName('license-btn')
var tagBtns  = document.getElementsByClassName('tag-btn')
var versionSelector  = document.getElementById("versionSelect")

var selectedThemeCount = 0;
var selectedTags = [];
var selectedLicense = [];
var selectedVersions = [];

var totalLicenses = document.getElementsByClassName('license-btn').length;
var totalTags  = document.getElementsByClassName('tag-btn').length;
var totalVersions  = document.getElementById("versionSelect").options.length;

showAll();

function showAll(){
  var selectedBtn = document.querySelector('#selectAllTags');

  selectedTags = [];
  selectedLicense = [];
  showCheck();
  addClassIfMissing(selectedBtn, 'active');
}

function tagsCheck(tag, tagType) {
  var selectedBtn = document.querySelector(`#${tagType}${tag}`);
  
  if( tagType === 't-') {
    if( selectedTags.indexOf(tag) >= 0 ) { // deselect tag
      selectedTags.splice( selectedTags.indexOf(tag), 1 );
      delClassIfPresent(selectedBtn, 'active');
      
    } else { // select tag
      selectedTags.push(tag);
      addClassIfMissing(selectedBtn, 'active');
      
    }
    
  } else if( tagType === 'l-') {
    if( selectedLicense.indexOf(tag) >= 0 ) { // deselect tag
      selectedLicense.splice( selectedLicense.indexOf(tag), 1 );
      delClassIfPresent(selectedBtn, 'active');
      
    } else { // select tag
      selectedLicense.push(tag);
      addClassIfMissing(selectedBtn, 'active');
      
    }
    
  }

  delClassIfPresent(selectAllLicenses, 'active')
  delClassIfPresent(selectAllTags, 'active')

  
  showCheck();

}

function licenseCheck(license) {
  
  if( selectedLicense[0] === license ) {
    selectedLicense = [];
  } else {
    selectedLicense[0] = license;
  }
  
  for ( var i = 0; i < licenseBtns.length; i++ ) {
    if(licenseBtns[i].id === `l-${license}`) {
      addClassIfMissing(licenseBtns[i], 'active')
    } else {
      delClassIfPresent(licenseBtns[i], 'active')
    }
  }
  showCheck();
}

function addClassIfMissing(el, cn) {
  if(!el.classList.contains(cn)) {
    el.classList.add(cn);
  } 
}

function delClassIfPresent(el, cn) {
  if(el.classList.contains(cn)) {
    el.classList.remove(cn)
  } 
}

function toggleClass(el, cn) {
  if(el.classList.contains(cn)) {
    el.classList.remove(cn)
  } else {
    el.classList.add(cn)
  }
}

function showCheck(showAll) {
  
  if( (selectedTags.length === 0 || selectedTags.length === totalTags) && 
      (selectedLicense.length === 0 || selectedLicense.length === totalLicenses) &&
      (selectedVersions.length === 0 || selectedVersions.length === totalVersions)
  ) {
    
    for( var i = 0; i < licenseBtns.length; i++ ) {
      delClassIfPresent(licenseBtns[i], 'active')
    }
    for( var i = 0; i < tagBtns.length; i++ ) {
      delClassIfPresent(tagBtns[i], 'active')
    }
    document.getElementById('versionSelect').options[0].selected = true;
    
  }
  
  selectedThemeCount=0;
  
  for ( var i = 0; i < tiles.length; i++ ) {
    
      delClassIfPresent(tiles[i], 'show');
      delClassIfPresent(items[i], 'show-item');
      
      if (checkVisibility(selectedTags, tiles[i].getAttribute('data-tags')) &&
          checkVisibility(selectedLicense, tiles[i].getAttribute('data-license')) &&
          checkVisibility(selectedVersions, tiles[i].getAttribute('data-minver')) 
      ) {
        if( !tiles[i].classList.contains("show") ){
          selectedThemeCount++;
          addClassIfMissing(tiles[i], 'show');
          addClassIfMissing(items[i], 'show-item');
          
        }
      }
       
    
    
  }
  
  document.getElementById("selectedThemeCount").textContent=`${selectedThemeCount}`;
  if(selectedTags.length > 0) {
    document.getElementById("selectedTagsCount").textContent=`Selected ${selectedTags.length} of `;
  } else {
    document.getElementById("selectedTagsCount").textContent=`Selected `;
    
  }
  if(selectedLicense.length > 0) {
    document.getElementById("selectedLicCount").textContent=`Selected ${selectedLicense.length} of `;
  } else {
    document.getElementById("selectedLicCount").textContent=`Selected `;
    
  }

}

function checkVisibility(list, dataAttr) {
  
  if (list.length > 0) {
    for(var v = 0; v < list.length; v++){
      if(dataAttr.indexOf(list[v]) >=0 ) {
        return true
      }
    }
    return false
  } else {
    return true 
  }
}

function getDataVersions() {
  for ( var i = 0; i < tiles.length; i++ ) {
    var ver = calcVersion(tiles[i].getAttribute('data-minver').split("."));
    tiles[i].setAttribute('data-version', ver)
  }
}

// TODO: find/write semver parser

function calcVersion(str) {
  var ver = 0;
  for( var j=0; j < str.length; j++ ){
    ver += str[j] * (Math.pow(10,(j*-3)))
  }
  return ver 
}

function versionSelected(){
  selectedVersions = [];
  
  var vs = versionSelector;
  var selectedVer = 0; 
  if(vs.value === 'Select All') {
    selectedVer = 0;
  } else {
    selectedVer = calcVersion(String(vs.value).split("."));
  }
  
  var versionMatch = document.getElementsByName("versionMatch");
  var matcher = "e";
  for(var i=0; i<versionMatch.length; i++){
    if(versionMatch[i].checked) {
      matcher = versionMatch[i].value;
    }
  }

  for (var i = 0; i < vs.options.length; i++){
    var optVal = calcVersion(String(vs.options[i].text).split("."));
    
    if( versionMatcher(matcher, optVal, selectedVer) ) {
      selectedVersions.push(vs.options[i].text)
    }
  }
  showCheck();

}

function versionMatcher(m, opt, sel){
  if(m==='e') {
    return opt === sel;
  } else if(m==='lte') {
    return opt <= sel
  } else if(m==='gte') {
    return opt >= sel
  }
}