function getQueryParams(){
  try{
    url = window.location.href;
    query_str = url.substr(url.indexOf('?')+1, url.length-1);
    r_params = query_str.split('&');
    params = {}
    for( i in r_params){
      param = r_params[i].split('=');
      params[ param[0] ] = param[1];
    }
    return params;
  }
  catch(e){
  return {};
  }
}

$j = jQuery.noConflict();

function toggleClass(obj){
  var el = document.getElementById(obj);
  if (el.className== 'show'){
    el.className = el.className.replace(/(?:^|\s)show(?!\S)/g , 'hide');
  }
  else if (el.className=='hide'){
    el.className = el.className.replace(/(?:^|\s)hide(?!\S)/g , 'show');
  }
}

function toggleVisibility(obj){
  var el = document.getElementById(obj);
  if ( el.className == 'hideContent' ) {
    el.className = el.className.replace(/(?:^|\s)hideContent(?!\S)/g , 'showContent');
    el.style.display = '';
  }
  else if(el.className == 'showContent') {
    el.className = el.className.replace(/(?:^|\s)showContent(?!\S)/g , 'hideContent');
    el.style.display = 'none';
  }
}

$j(document).ready(function(){
  
});
