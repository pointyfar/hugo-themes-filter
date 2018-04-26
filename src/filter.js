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
  addClassIfMissing(selectedBtn, 'active');
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
      delClassIfPresent(selectedBtn, 'active');
      
    } else { /* select tag */
      selectedTags.push(tag);
      addClassIfMissing(selectedBtn, 'active');
      
    }
    
  } else if( tagType === 'l-') {
    /**  
     * implies tagType = "license"
     */   
    if( selectedLicense.indexOf(tag) >= 0 ) { /* deselect tag */
      selectedLicense.splice( selectedLicense.indexOf(tag), 1 );
      delClassIfPresent(selectedBtn, 'active');
      
    } else { /* select tag */
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
      delClassIfPresent(licenseBtns[i], 'active')
    }
    for( var i = 0; i < tagBtns.length; i++ ) {
      delClassIfPresent(tagBtns[i], 'active')
    }
    document.getElementById('versionSelect').options[0].selected = true;
  }
  
  selectedThemeCount=0;
  
  for ( var i = 0; i < tiles.length; i++ ) {
      /* First remove "show" class */
      delClassIfPresent(tiles[i], 'show');
      delClassIfPresent(items[i], 'show-item');
      
      /* Then check if "show" class should be applied */
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
    document.getElementById("selectedTagsCount").textContent=` ${selectedTags.length} of `;
  } else {
    document.getElementById("selectedTagsCount").textContent=` `;
  }
  if(selectedLicense.length > 0) {
    document.getElementById("selectedLicCount").textContent=` ${selectedLicense.length} of `;
  } else {
    document.getElementById("selectedLicCount").textContent=` `;
  }

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
      if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
        delClassIfPresent(tagBtns[i], "hideBtn")
      } else {
        addClassIfMissing(tagBtns[i], "hideBtn")
      }
  }
}