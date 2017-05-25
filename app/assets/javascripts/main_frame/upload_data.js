
function display_upload_form(){
  $j('#upRightBottomFrame').css('visibility','hidden');
  $j('body').append("<div id=\"upload_form\"><input type=\"file\" id=\"upload_file\" ><br/><br/><button id =\"parse_file\" type=\"button\">UPLOAD</button><div class=\"close\">CLOSE</div></div>");

  $j('div#upload_form div.close').click(function(){
    clear_upload_form();
  });

  $j('div#upload_form button#parse_file').click(function(){
    parse_data_file();
  });
} 

function clear_upload_form(){
  $j('#upRightBottomFrame').css('visibility','visible');
  $j("#upload_form").remove();
}

function parse_data_file(){
  upload_flag = true;
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    alert('The File APIs are not fully supported in this browser.');
    return;
  }   
  var input = document.getElementById('upload_file');
  if (!input) {
    alert("Um, couldn't find the fileinput element.");
  }else if (!input.files) {
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  }else if (!input.files[0]) {
    alert("Please select a file before clicking 'UPLOAD'");               
  }else {
    var file = input.files[0];
    var fr = new FileReader();
    fr.onload = function(){
      file_read(fr);
    };
    fr.readAsText(file);
  }
}

function file_read(fr){
  var custom_annotations = eval( '('+fr.result+')' );
  if( custom_annotations.forEach ){
    custom_annotations.forEach(function(track){
      parse_track(track);
    });
  }else{
    parse_track(custom_annotations);
  }
  reload_annotations_frame();
}

function parse_track(track){
  var key;
  var id;
  var track_name;
  var visualization_type;
  var translate_flag = false;
  if( track.chain ){
      translate_flag  = true;
      key = 'PDBchain';
    if( track.pdb ){
      id = track.pdb+":"+track.chain;
    }else{
      id = global_infoAlignment.pdb+":"+track.chain;
    }
  }else {
    key = 'acc';
    if( track.uniprot ){
      id = track.uniprot;
    }else{
      id = global_infoAlignment.uniprot;
    }
  }
  if(track.track_name){
    track_name = track.track_name;
  }else{
    track_name = "User data";
  }
  if(track.visualization_type){
    visualization_type = track.visualization_type;
  }else{
    visualization_type = 'basic';
  }
  if( !$UPLOADED_DATA[key][id] ){
    $UPLOADED_DATA[key][id] = {};
  }
  if( !$UPLOADED_DATA[key][id][track_name] ){
    $UPLOADED_DATA[key][id][track_name] = {  visualization_type:visualization_type,  data:[] };
  }
  if(track.data.forEach){
    track.data.forEach(function(x){
      var y = x;
      if(translate_flag) y = translate_to_uniprot(x,id);
      $UPLOADED_DATA[key][id][track_name]['data'].push(x);
    });
  }
}

function translate_to_uniprot(ann,PDBchain){
  var out = ann;
  var X = PDBchain.split(":");
  var pdb = X[0];
  var chain = X[1];
  var keys = Object.keys( $ALIGNMENTS[pdb][chain] );
  var acc = keys[0];
  out.begin = $ALIGNMENTS[pdb][chain][acc]["inverse"][ ann.begin ];
  out.end = $ALIGNMENTS[pdb][chain][acc]["inverse"][ ann.end ];
  return out;
}

function reload_annotations_frame(){
  var evtHide = document.createEvent("Event");
  evtHide.initEvent("HideInfo",true,true);
  document.getElementById("upRightBottomFrame").contentWindow.dispatchEvent(evtHide);

  var annot_iframe = 'iframe#upRightBottomFrame';

  clear_upload_form();
  document.getElementById("upRightBottomFrame").contentWindow.location.reload();
}

