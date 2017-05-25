"use strict";

var add_highlight = function(d){
	var __fake= ['__fake',[{
				'begin':1,
				'end':1,
				'internalId':'fake_0',
				'type': 'region'
		}]];
	d.push(__fake);
};

var setup_highlight  =  function(fv){
        fv.ready_flag = true;

	fv.__highlight = function(e){
		var fake_click = new MouseEvent("click");
		if (fv.selectedFeature && fv.selectedFeature.internalId == "fake_0"){
			if( document.getElementsByName("fake_0").lentgh>0){
				document.getElementsByName("fake_0")[0].dispatchEvent(fake_click);
			}else if( jQuery("[name=fake_0]").get(0) ){
				jQuery("[name=fake_0]").get(0).dispatchEvent(fake_click);
			}
		}
		fv.data.forEach(function(i){
			if(i[0]=="__fake"){
				i[1][0]['begin']=e['begin'];
				i[1][0]['end']=e['end'];
			}
		});
		if( document.getElementsByName("fake_0").lentgh>0){
			document.getElementsByName("fake_0")[0].dispatchEvent(fake_click);
                        document.getElementsByName("fake_0")[0].style.fill = e['color'];
		}else if( jQuery("[name=fake_0]").get(0) ){
                        $j("[name=fake_0]").css("fill",e['color']);
			$j("[name=fake_0]").get(0).dispatchEvent(fake_click);
		}

	}

	fv.getDispatcher().on("ready", function(o) {
		__hide_fake();
		__add_tooltip_yoverflow();
                $j(".up_pftv_icon-reset").click(function(){
                  trigger_aa_cleared();
                });
                fv.data.forEach(function(i){
                  if(i[0]=="INTERACTING_RESIDUES"){
                    IRD = i[1];
                  }else if(i[0]=="RESIDUE_ASA"){
                    ASA = i[1];
                  }
                });
                $j('#loading').css('display','none');
                variant_menu();
                if(fv.n_source == 4 && fv.ready_flag){
                  fv.ready_flag = false;
		  setTimeout(function(){ check_global_selection(); }, 300);
                }
	});
};

function __hide_fake(){
	var aTags = document.getElementsByTagName("a");
	var searchText = "__fake";
	var found;
	for (var i=0;i<aTags.length;i++) {
  		if (aTags[i].title == searchText) {
    			found = aTags[i];
    			break;
  		}
	}
	if( found != undefined ) found.parentNode.style.display = "none";
	var classDOM = document.getElementsByClassName("up_pftv_buttons");
	var observer = new MutationObserver(__hide_eye);
	observer.observe(classDOM[0],{childList:true});
}

function __hide_eye(a,b,c) {
	var aTags = a[0]['target'].getElementsByTagName("label");
	var searchText = "__fake";
	var found;
	for (var i=0;i<aTags.length;i++) {
  		if (aTags[i].innerHTML == searchText) {
    			found = aTags[i];
    			break;
  		}
	}
	if( found != undefined ) found.parentNode.style.display = "none";
}

function __add_tooltip_yoverflow(){
	var classDOM = document.getElementsByClassName("up_pftv_category-viewer");
	var observer = new MutationObserver(__tooltip_yoverflow);
	for(var i=0;i<classDOM.length;i++){
		observer.observe(classDOM[i],{childList:true});
	}
	var classDOM = document.getElementsByClassName("up_pftv_track");
	var observer = new MutationObserver(__tooltip_yoverflow);
	for(var i=0;i<classDOM.length;i++){
		observer.observe(classDOM[i],{childList:true});
	}
}

function __tooltip_yoverflow(){
	var __e = document.getElementsByClassName("up_pftv_tooltip-container");
	if( __e && __e[0]){
		var __left = parseInt(__e[0].style.left.substring(0, __e[0].style.left.length - 2));
		if(__left > 300)__e[0].style.left = 300;
	}
        var h = $j(".up_pftv_tooltip-container").css('top');
        if(typeof h == "undefined")return;
        h = parseInt(h.substring(0, h.length - 2));
        var x = h;
        h += $j(".up_pftv_tooltip-container").parent().offset().top;
        h += $j(".up_pftv_tooltip-container").height();
        var  d = h - $j(window).scrollTop() - $j(window).height() +150;
        if(d>0){
          d += 10;
          x -= d;
          $j(".up_pftv_tooltip-container").css('top',x.toString()+'px');
        }
}

module.exports = {add_highlight:add_highlight, setup_highlight:setup_highlight};
