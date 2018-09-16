var selectAllBtn = document.querySelector('#selectAllBtn');
var tagButtons = document.getElementsByClassName('tag-button');

var tiles = document.getElementsByClassName('filterDiv');
/*var items = document.getElementsByClassName('item');*/


var licenseBtns = document.getElementsByClassName('license-btn')
var tagBtns  = document.getElementsByClassName('tag-btn')
var versionSelector  = document.getElementById("versionSelect")

var starIntervals = [
  {pre: 0, post: 10, count: 0},
  {pre: 11, post: 20, count: 0},
  {pre: 21, post: 30, count: 0},
  {pre: 31, post: 40, count: 0},
  {pre: 41, post: 50, count: 0},
  {pre: 51, post: 100, count: 0},
  {pre: 101, post: 200, count: 0},
  {pre: 201, post: 300, count: 0},
  {pre: 301, count: 0}
];
var allStars = [];

var selectedThemeCount = 0;
var selectedTags = [];
var selectedLicense = [];
var selectedVersions = [];
var selectedStars = [];

var totalLicenses = document.getElementsByClassName('license-btn').length;
var totalTags  = document.getElementsByClassName('tag-btn').length;
var totalVersions  = document.getElementById("versionSelect").options.length;

var activeClass = "is-active";
/* Initially, show all*/
showAll();


/**
 * showAll - Selects all tags
 *  
 */ 
function showAll(){
  var selectedBtn = document.querySelector('#selectAllTags');

  selectedTags = [];
  selectedLicense = [];
  showCheck();
  addClassIfMissing(selectedBtn, activeClass);
}

/**
 * tagsCheck - Triggered by tag-button click.
 *  
 * @param  {type} tag     specific tag to de-/select 
 * @param  {type} tagType may be tag, license, etc 
 */ 
function tagsCheck(tag, tagType) {
  
  /**  
   * Selects clicked button.  
   */   
  var selectedBtn = document.querySelector(`#${tagType}${tag}`);
  
  
  if( tagType === 't-') {
    /**  
    * implies tagType = "tag"
    */   
    if( selectedTags.indexOf(tag) >= 0 ) { /* deselect tag */
      selectedTags.splice( selectedTags.indexOf(tag), 1 );
      delClassIfPresent(selectedBtn, activeClass);
      
    } else { /* select tag */
      selectedTags.push(tag);
      addClassIfMissing(selectedBtn, activeClass);
      
    }
    
  } else if( tagType === 'l-') {
    /**  
     * implies tagType = "license"
     */   
    if( selectedLicense.indexOf(tag) >= 0 ) { /* deselect tag */
      selectedLicense.splice( selectedLicense.indexOf(tag), 1 );
      delClassIfPresent(selectedBtn, activeClass);
      
    } else { /* select tag */
      selectedLicense.push(tag);
      addClassIfMissing(selectedBtn, activeClass);
    }
  }

  delClassIfPresent(selectAllLicenses, activeClass)
  delClassIfPresent(selectAllTags, activeClass)

  
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
      addClassIfMissing(licenseBtns[i], activeClass)
    } else {
      delClassIfPresent(licenseBtns[i], activeClass)
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


/**
 * showCheck - Applies "show" class to items containing selected tags
 *  
 */ 
function showCheck() {
  
  /**  
   * If no tags/licenses selected, or all tags selected, SHOW ALL and DESELECT ALL BUTTONS.
   */   
  if( (selectedTags.length === 0 || selectedTags.length === totalTags) && 
      (selectedLicense.length === 0 || selectedLicense.length === totalLicenses) &&
      (selectedVersions.length === 0 || selectedVersions.length === totalVersions)
  ) {
    
    for( var i = 0; i < licenseBtns.length; i++ ) {
      delClassIfPresent(licenseBtns[i], activeClass)
    }
    for( var i = 0; i < tagBtns.length; i++ ) {
      delClassIfPresent(tagBtns[i], activeClass)
    }
    document.getElementById('versionSelect').options[0].selected = true;
  }
  
  selectedThemeCount=0;
  
  for ( var i = 0; i < tiles.length; i++ ) {
      /* First remove "show" class */
      delClassIfPresent(tiles[i], 'show');
      /*delClassIfPresent(items[i], 'show-item');*/
      
      /* Then check if "show" class should be applied */
      if (checkVisibility(selectedTags, tiles[i].getAttribute('data-tags')) &&
          checkVisibility(selectedLicense, tiles[i].getAttribute('data-license')) &&
          checkVisibility(selectedVersions, tiles[i].getAttribute('data-minver')) &&
          checkVisibility(selectedStars, tiles[i].getAttribute('data-starinterval')) 
          
      ) {
        if( !tiles[i].classList.contains("show") ){
          selectedThemeCount++;
          addClassIfMissing(tiles[i], 'show');
          /*addClassIfMissing(items[i], 'show-item');*/
          
        }
      }
  }
  
  document.getElementById("selectedThemeCount").textContent=`${selectedThemeCount}`;

  if(selectedTags.length > 0) {
    document.getElementById("selectedTagsCount").textContent=` ${selectedTags.length} of `;
  } else {
    document.getElementById("selectedTagsCount").textContent=` `;
  }
  if(selectedLicense.length > 0) {
    document.getElementById("selectedLicCount").textContent=` ${selectedLicense.length} of `;
  } else {
    document.getElementById("selectedLicCount").textContent=` `;
  }

  document.getElementById("mainSearch").value= '';

}

/**
 * checkVisibility - Tests if attribute is included in list.
 *  
 * @param  {type} list     
 * @param  {type} dataAttr to check 
 * @return {boolean}          description 
 */ 
function checkVisibility(list, dataAttr) {
  
  /**  
   * Returns TRUE if list is empty or attribute is in list
   */   
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


//// TODO: check if superfluous
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


/**
 * versionSelected - Triggered by selecting a version. 
 *  
 * @return {type}  description 
 */ 
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
    
    if( versionMatcher(matcher, optVal, selectedVer) && selectedVer > 0 ) {
      selectedVersions.push(vs.options[i].text)
    }
  }
  
  if(selectedVersions.length > 0) {
    var mtext = "==";
    if(matcher==='lte') {
      mtext = "<="
    } else if(matcher==='gte') {
      mtext = ">="
    }
    document.getElementById("selectedVerStatus").textContent=`${mtext} ${vs.value}  `;
  } else {
    document.getElementById("selectedVerStatus").textContent=`All`;
  }

  showCheck();

}


/**
 * versionMatcher - returns if opt ( = / > / < ) sel
 *  
 * @param  {type} m   operator 
 * @param  {type} opt  left side operand
 * @param  {type} sel right side operand
 * @return {type}     m (opt , sel)
 */ 
function versionMatcher(m, opt, sel){
  if(m==='e') {
    return opt === sel;
  } else if(m==='lte') {
    return opt <= sel
  } else if(m==='gte') {
    return opt >= sel
  }
}

function searchFilter(filter, inputId) {

  var input, filter, btnSpan;
  input = document.getElementById(inputId);
  filter = input.value.toUpperCase();

  for (var i = 0; i < tagBtns.length; i++) {
      btnSpan = tagBtns[i].getElementsByTagName("span")[0];
      if (btnSpan.innerHTML.toUpperCase().indexOf(filter) > -1) {
        delClassIfPresent(tagBtns[i], "hideBtn")
      } else {
        addClassIfMissing(tagBtns[i], "hideBtn")
      }
  }
}

function searchTermFilter(searchTermInput, target, innerEl, hideClass ) {
  var searchTerm = document.getElementById(searchTermInput).value;

  var searchElements = document.getElementsByClassName(target);
  var count = 0;
  for( var i = 0; i <searchElements.length; i++ ) {
    
    var textContainer = searchElements[i].getElementsByTagName(innerEl)[0];
    var s = textContainer.textContent.toUpperCase();

    if((textContainer.textContent.toUpperCase()).indexOf(searchTerm.toUpperCase()) > -1) {
      count++;
      delClassIfPresent(searchElements[i], hideClass)
    } else {
      addClassIfMissing(searchElements[i], hideClass)
    }
  }
  document.getElementById("selectedThemeCount").textContent=`${count}`;
  

}

assignStarIntervals()
getStarButtons()
function getStarButtons() {
  var steps = starIntervals.length;
  var sc = document.getElementById("starsContainer");
  for ( var i = 0; i < steps; i++ ){
    var pre = starIntervals[i]['pre'];
    var post = starIntervals[i]['post'] ? " - " + starIntervals[i]['post'] : " + ";
    var count = starIntervals[i]['count'];
    var btn = document.createElement("BUTTON");
    var btnLabel = document.createTextNode(`${pre}${post} (${count})`);
    btn.className = "button is-fullwidth is-small star-button";
    btn.setAttribute('data-target', pre);
    btn.appendChild(btnLabel);
    sc.appendChild(btn);
  }
  
  var sb = document.getElementsByClassName("star-button");
  for(var i=0; i <sb.length; i++) {
    sb[i].addEventListener("click", selectStar)
  }
}

function selectStar() {
  var target = this.getAttribute('data-target');
  if(selectedStars.indexOf(target)>=0) {
    var idx = selectedStars.indexOf(target);
    selectedStars.splice(idx, 1);
  } else {
    selectedStars.push(target);
  }

  toggleClass(this,activeClass);
  showCheck()
}

function assignStarIntervals() {
  for ( var i = 0; i < tiles.length; i++ ) {
    var interval = 0;
    var stars = parseInt(tiles[i].getAttribute('data-stars'));
    for( var j=0; j< starIntervals.length; j++){
      var post = starIntervals[j]['post'] ? starIntervals[j]['post'] : 100000;
      if( stars >= starIntervals[j]['pre'] && stars <= post ) {
        interval = starIntervals[j]['pre'];
        starIntervals[j]['count']++;
      }
    }
    tiles[i].setAttribute('data-starinterval', interval)
  }
}

