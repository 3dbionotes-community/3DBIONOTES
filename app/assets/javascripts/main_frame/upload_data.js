
function display_upload_form(){
  remove_all_panel_menu(); 
  $j('#upRightBottomFrame').css('visibility','hidden');

  $j('body').append("<div id=\"upload_form\"></div>");
  $j('#upload_form').append("<div class=\"upload_text\">UPLOAD YOUR ANNOTAITONS IN JSON FORMAT</div><br/>");
  $j('#upload_form').append("<input type=\"file\" id=\"upload_file\" ><br/><br/>");
  $j('#upload_form').append("<button id =\"parse_file\" type=\"button\">UPLOAD</button><br/><br/><br/>");
  $j('#upload_form').append("<div class=\"upload_text\">OR</div><br/><br/>");
  $j('#upload_form').append("<div class=\"upload_text\">ADD YOUR ANNOTATIONS MANUALLY</div><br/>");
  $j('#upload_form').append("<table id=\"input_labels\"></table>");
  $j('#upload_form table#input_labels').append("<tr><td>TRACK NAME</td><td><input type=\"text\" id=\"input_tarck_name\" value=\"Manually annotated\"></td></tr>");
  $j('#upload_form table#input_labels').append("<tr><td>TYPE</td><td><input type=\"text\" id=\"input_type\" value=\"region\"></td></tr>");
  $j('#upload_form table#input_labels').append("<tr><td>DESCRIPTION</td><td><input type=\"text\" id=\"input_description\" value=\"Manually annotated region\"></td></tr>");
  $j('#upload_form table#input_labels').append("<tr><td>COLOR</td><td><input type=\"text\" id=\"input_color\"></td></tr>");
  $j('#upload_form').append("<br/>");
  $j('#upload_form').append("<table id=\"input_coordinates\"></table>");
  $j('#upload_form table#input_coordinates').append("<tr></tr>");
  $j('#upload_form table#input_coordinates tr').append("<td>INDEX</td>");
  $j('#upload_form table#input_coordinates tr').append("<td><select id=\"input_index\"><option value=\"structure\">STRUCTURE</option><option value=\"sequence\">SEQUENCE</option></select></td>");
  $j('#upload_form table#input_coordinates tr').append("<td>BEGIN</td><td><input class=\"short\" type=\"text\" id=\"input_begin\"></td>");
  $j('#upload_form table#input_coordinates tr').append("<td>END</td><td><input class=\"short\" type=\"text\" id=\"input_end\"></td>");
  $j('#upload_form').append("<br/>");
  $j('#upload_form').append("<button id=\"add_annotation\" type=\"button\">ADD</button>");
  $j('#upload_form').append("<div class=\"close\">CLOSE</div>");

  $j('div#upload_form div.close').click(function(){
    clear_upload_form();
  });

  $j('div#upload_form button#parse_file').click(function(){
    parse_data_file();
  });

  $j('div#upload_form button#add_annotation').click(function(){
    add_annotation();
  });
} 

function clear_upload_form(){
  $j('#upRightBottomFrame').css('visibility','visible');
  remove_all_panel_menu();
}

function add_annotation(){
  var track_name = $j("#input_tarck_name").val();
  if(!track_name) track_name = "Custom annotations";
  track_name = track_name.replace(" ","_").toUpperCase();

  var type = $j("#input_type").val();
  if(!type) type = "region";

  var description = $j("#input_description").val();
  var color = $j("#input_color").val();

  var index = $j("#input_index").val();
  var begin = $j("#input_begin").val();
  if(!begin){
    alert("MISSING BEGIN INFORMATION, PLEASE FILL BEGIN  FIELD");
    return;
  }
  var end = $j("#input_end").val();
  if(!end) end = begin;

  var id = global_infoAlignment.pdb+":"+global_infoAlignment.chain; 
  var key = "PDBchain";

  var y = {begin:begin, end:end};
  if( index == "structure") y = translate_to_uniprot(y,id);
  y.type = type;
  if(color)y.color = color;
  if(description)y.description = description;

  if( !$UPLOADED_DATA[key][id] ){
    $UPLOADED_DATA[key][id] = {};
  }
  if( !$UPLOADED_DATA[key][id][track_name] ){
    $UPLOADED_DATA[key][id][track_name] = { data:[] };
  }
  $UPLOADED_DATA[key][id][track_name]['data'].push(y);
  if(!$CUSTOM_TRACKS[ track_name ])$CUSTOM_TRACKS[ track_name ]={};
  $CUSTOM_TRACKS[ track_name ][ y.type ] = true;
  upload_flag = true;
  reload_annotations_frame();
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
    track_name = "Uploaded data";
  }
  if(track.visualization_type){
    visualization_type = track.visualization_type;
  }else{
    visualization_type = 'basic';
  }
  if( !$UPLOADED_DATA[key][id] ){
    $UPLOADED_DATA[key][id] = {};
  }
  if( !$UPLOADED_DATA[key][id][track_name] || visualization_type == "continuous" ){
    $UPLOADED_DATA[key][id][track_name] = {  visualization_type:visualization_type,  data:[] };
    $CUSTOM_TRACKS[ track_name ] = {};
  }else if( $UPLOADED_DATA[key][id][track_name] && $UPLOADED_DATA[key][id][track_name]['visualization_type'] == "continuous" ){
    $UPLOADED_DATA[key][id][track_name] = { visualization_type:visualization_type,  data:[] };
  }
  if(track.data.forEach){
    track.data.forEach(function(x){
      var y = x;
      if(translate_flag) y = translate_to_uniprot(x,id);
      $UPLOADED_DATA[key][id][track_name]['data'].push(x);

      if(!$CUSTOM_TRACKS[ track_name ])$CUSTOM_TRACKS[ track_name ]={};
      $CUSTOM_TRACKS[ track_name ][ x.type ] = true;
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

