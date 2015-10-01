$j = jQuery.noConflict();

// the function that gets called when the "submit" button is clicked
function generateGraphicsSeq(divChosen,data) {
  var pg = new PfamGraphic();
  // start by getting hiding any previous error messages and then
  // delete the old canvas element. We could effectively blank the
  // old canvas by overwriting it with a big white rectangle, but
  // here we're just removing it and letting the domain graphics
  // library generate a new one
  if ( $j(divChosen).select("canvas").size() > 0 ) {
    $j(divChosen).select("canvas").first().remove();
  }
  
  // see if we can turn the contents of the text area into a valid
  // javascript data structure. If not, display an error message.
  try {
    sequence = data;
  } catch ( e ) {
    console.log(e.message);
    return;
  }
  
  // give the object the ID of the container that will hold the canvas.
  // We could have specified this when we instantiated the object instead.
  // We could also have supplied a reference to the element itself, rather
  // than its ID; the library doesn't care.
  pg.setParent(divChosen);
  
  // get the values of X-scale and Y-scale from the form and set them
  // on the object. These two values can be used to scale the domain
  // graphics. Set them large to see how the domain graphic looks in detail,
  // but ignore the drawing errors...
  pg.setImageParams( {
    xscale: 1.0,
    yscale: 1.0
  } );
  
  // hand the domain graphics description to the domain graphics object. It
  // will throw an exception (hopefully with a meaningful error message
  // embedded) if it can't parse the data structure or if there's a problem,
  // such as a start value that's greater than an end value. If there's an
  // error, show it in the error div.
  try {
    pg.setSequence( sequence );
    pg.render();
  } catch ( e ) {
    //console.log(e.message);
    return;
  }
  return pg;
};

function triggerCoordinates(start,end){
  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("AnnotsCoordinatesInfo",true,true,[start,end]);
  body.dispatchEvent(evt);
}

function clearPfam(){
  for(var pfamEl=0;pfamEl<pfamArray.length;pfamEl++){
    var miPfamEl = pfamArray[pfamEl];
    var tmpEl = document.getElementById(miPfamEl[1]);
    while(tmpEl.hasChildNodes()){
      tmpEl.removeChild(tmpEl.firstChild);
    }
    var tmpSeq = jQuery.extend(true,{}, miPfamEl[2]);
    miPfamEl[0].setSequence(tmpSeq);
    miPfamEl[0].render();
  }
}

function modifyPfam(start,end,length){
  var staticLength = 750;
  var proportion = staticLength/length;
  var propStart = Math.round(start*proportion);
  var propEnd = Math.round(end*proportion); 
  var newData = eval('({"type":"Nested","lineColour":"#ACFA58","colour":"#ACFA58","display":true,"v_align":"bottom","start":"'+propStart+'","end":"'+propEnd+'","href":""})');
  for(var pfamEl=0;pfamEl<pfamArray.length;pfamEl++){
    var miPfamEl = pfamArray[pfamEl];
    var tmpEl = document.getElementById(miPfamEl[1]);
    while(tmpEl.hasChildNodes()){
      tmpEl.removeChild(tmpEl.firstChild);
    }
    var tmpSeq = jQuery.extend(true,{}, miPfamEl[2]);
    if (tmpSeq.markups==null){
      tmpSeq.markups=[];
    }
    tmpSeq.markups.push(newData);
    miPfamEl[0].setSequence(tmpSeq);
    miPfamEl[0].render();
  }
}

function is_overlapping(x1,x2,y1,y2){
  return (Math.max(x1,y1) <= Math.min(x2,y2));
}

function modifyLinks(start,end){
  var classesAs = $j("a[class*='pos:']");
  var toRemove = document.getElementsByClassName("nostyle");
  for(var i=0;i<toRemove.length;i++){
    var el = toRemove[i];
    if($j(el).hasClass("selected")){
      el.classList.remove("selected");
    }
  }
  for(var i=0;i<classesAs.length;i++){
    var el = classesAs[i];
    var listCl = el.classList;
    for(var j=0;j<listCl.length;j++){
      var cl = listCl[j];
      if (cl.indexOf("pos:")!=-1){
        var miStart = cl.split(":")[1].split("-")[0];
        var miEnd = cl.split(":")[1].split("-")[1];
        if(is_overlapping(miStart,miEnd,start,end)){
          el.classList.add("selected");
          var elId = $j(el).attr('id');
          var firstParId = elId.split(":").slice(0,2).join(":");
          var secondParId = elId.split(":").slice(0,3).join(":");
          var fstId = document.getElementById(firstParId);
          var scndId = document.getElementById(secondParId);
          fstId.classList.add("selected");
          scndId.classList.add("selected");
        }
      }
    }
  }
}

/**$j(document).ready(function(){
x
});*/
