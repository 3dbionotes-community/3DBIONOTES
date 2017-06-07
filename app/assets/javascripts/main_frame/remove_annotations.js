var select_to_remove = { tracks:{}, types:{} };

function display_remove_tree(){
  remove_all_panel_menu(); 
  select_to_remove = { tracks:{}, types:{} };

  $j('#upRightBottomFrame').css('visibility','hidden');
  $j('body').append("<div id=\"remove_annotations\"></div>");
  $j('#remove_annotations').append("<div class=\"remove_annotations_text\">DELETE CUSTOM ANNOTATIONS FROM THE VIEWER</div>");
  $j('#remove_annotations').append("<div class=\"remove_annotations_explanation_text\"></div>");
  $j('.remove_annotations_explanation_text').append("Bottom tree displays the uploaded and/or imported annotation types. Select those nodes to  be removed from the annotation  pannel and press the 'REMOVE' button.");

  $j('#remove_annotations').append("<div class=\"close\">CLOSE</div>");
  $j('div#remove_annotations div.close').click(function(){
    clear_remove_tree();
  });

  $j.each($CUSTOM_TRACKS , function(track_name, types){
    $j('#remove_annotations').append("<div class=\"tree_track\" id=\""+track_name+"\"><span class=\"tree_track_span\">"+track_name.replace(/_/g," ").toUpperCase()+"</span></div>");
    $j.each(types , function(type_name, none){
      if(type_name!="undefined") $j('#'+track_name).append("<div class=\"tree_type\" id=\""+type_name+"\"><span class=\"tree_type_span\">"+type_name.replace(/_/g," ").toUpperCase()+"</span></div>");
    });
  });
  $j(".tree_track_span").click(function(){
    select_track(this);
  });
  $j(".tree_type_span").click(function(){
    select_type(this);
  });
  $j('#remove_annotations').append("<br/><button type=\"button\" id=\"remove_selected\">REMOVE</button>");
  $j("#remove_selected").click(function(){
    remove_selected();
  }); 
}

function remove_selected(){
  var id = global_infoAlignment.pdb+":"+global_infoAlignment.chain; 
  var acc = global_infoAlignment.uniprot;
  var index = {PDBchain:id, acc:acc};
  $j.each(index, function(key, id){
    $j.each(select_to_remove.tracks, function(track_name,none){
      if( $UPLOADED_DATA[key][id] && $UPLOADED_DATA[key][id][track_name] ){
        delete $UPLOADED_DATA[key][id][track_name];
        delete $CUSTOM_TRACKS[track_name];
      }
    });
    $j.each(select_to_remove.types, function(track_name,types){
      $j.each(types, function(type_name,none){
        if( $UPLOADED_DATA[key][id] && $UPLOADED_DATA[key][id][track_name] ){
          var data = $UPLOADED_DATA[key][id][track_name]['data'];
          var new_data = [];
          $j.each(data,function(i,d){
            if( d.type != type_name) new_data.push(d);
          });
          if( new_data.length == 0){
            delete $UPLOADED_DATA[key][id][track_name];
            delete $CUSTOM_TRACKS[track_name];
          }else{
            $UPLOADED_DATA[key][id][track_name]['data'] = new_data;
            delete $CUSTOM_TRACKS[track_name][type_name];
          }
        }
      });
    });
  });
  reload_annotations_frame(); 
}

function select_type(e){
  var track_id = $j(e).parent().parent().attr("id");
  var type_id = $j(e).parent().attr("id");
  if( select_to_remove.tracks[track_id] )return;

  if( select_to_remove.types[track_id] && select_to_remove.types[track_id][type_id]){
    delete select_to_remove.types[track_id][type_id];
    $j(e).css("color","");
  }else if( select_to_remove.types[track_id] && !select_to_remove.types[track_id][type_id]){
    select_to_remove.types[track_id][type_id]=true;
    $j(e).css("color","red");
  }else{
    select_to_remove.types[track_id]={};
    select_to_remove.types[track_id][type_id]=true;
    $j(e).css("color","red");
  }
}

function select_track(e){
  var track_id = $j(e).parent().attr("id");
  if( select_to_remove.tracks[track_id] ){
    delete select_to_remove.tracks[track_id];
    $j(e).parent().css("color","");
  }else{
    select_to_remove.tracks[track_id] = true;
    $j(e).parent().css("color","red");
    $j(e).parent().children("div").children("span").css("color","");
    if(select_to_remove.types[track_id])delete select_to_remove.types[track_id];
  }
}

function clear_remove_tree(){
  $j('#upRightBottomFrame').css('visibility','visible');
  remove_all_panel_menu();
}

function reload_annotations_frame(){
  var evtHide = document.createEvent("Event");
  evtHide.initEvent("HideInfo",true,true);
  document.getElementById("upRightBottomFrame").contentWindow.dispatchEvent(evtHide);

  var annot_iframe = 'iframe#upRightBottomFrame';

  clear_upload_form();
  document.getElementById("upRightBottomFrame").contentWindow.location.reload();
}

