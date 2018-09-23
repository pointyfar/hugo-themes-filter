var sortBtns = document.getElementsByClassName("sort-button");

function initSort() {
  for( var i = 0; i < sortBtns.length; i++) {
    sortBtns[i].addEventListener("click",sortEl)
  }
}

initSort()

function sortEl() {
  var attribute = this.getAttribute('data-attr');
  var direction = this.getAttribute('data-direction');
  
  var items = document.getElementsByClassName("filterDiv");
  var parent = document.getElementById('themes-container');
  
  // getElementsByClassName returns object. make it a array to use sort function
  var itemsArr = [];
  for (var i in items) {
    if (items[i].nodeType == 1) { // consider elements only
      itemsArr.push(items[i]);
    }
  }

  var sorted = itemsArr.sort(function (a, b) {
    var c = a;
    if(direction == "desc") {
      a = b;
      b = c;
    }
    a = a.getAttribute(`data-${attribute}`);
    b = b.getAttribute(`data-${attribute}`);
    
    if(isNaN(a) || isNaN(b)) {
      return a.localeCompare(b);
    } else {
      return a-b;
    }
  });

  for (i = 0; i < sorted.length; ++i) {
    parent.appendChild(sorted[i]);
  }
  
  
  for( var i = 0; i < sortBtns.length; i++) {
    if(sortBtns[i].classList.contains("is-dark")) {
      sortBtns[i].classList.remove("is-dark")
    }
  }
  if(!this.classList.contains("is-dark")) {
    this.classList.add("is-dark")
  }
  
  
}