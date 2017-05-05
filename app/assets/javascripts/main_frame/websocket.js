var debug_mode = '';
var get_params = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}();

if( 'debug_id' in get_params ){
  debug_mode = "debug_id="+get_params['debug_id']+"&";
  var ws = new WebSocket("ws://3dbionotes.cnb.csic.es:8001/debug/"+get_params['debug_id']);
  ws.onopen = function(){
     // Web Socket is connected, send data using send()
     console.log("Websocket connected ...");
  };
  ws.onmessage = function (evt) 
  { 
     var received_msg = evt.data;
     console.log(received_msg);
  };
  ws.onclose = function()
  { 
     // websocket is closed.
     console.log("Connection is closed!"); 
  };
}
