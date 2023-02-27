// JavaScript source code

function queryMonitor(period, theUrl) {

    var XMLHttpRequest = require('xhr2');
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl); // access objects
    xmlHttp.send(); // send request to server
    xmlHttp.responseType = "json"; // data will be returned in json format
 
    // listen to GET response using onload event listener
    xmlHttp.onload = () => {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
         console.log('ClientUpdate: ', xmlHttp.response); // log data to console
        }
        else {
          console.log(`Error: ${xmlHttp.status}`); // log error to console
        }
    };
 
    return xmlHttp.responseText; // returns ClientUpdate json payload (not parsed)
 
    // TODO: update the function to send request for every missing period
 }

 /*
update = {
    "ClientUpdateTest":
      {
          "STHs": "test_sth",
          "REVs": "test_rev",
          "PoMs": "test_pom",
          "MonitorId": "test_id",
          "Period": 0,
          "PoMsig": "test_sig"
      }
  }
*/
function parseUpdate(update) {

    parsedUpdate = JSON.parse(update)
    var num_signs = 0
    for (var i = 0; i < parsedUpdate.length(); i++) {
        num_signs += Object.keys(parsedUpdate[i]).length
    }


    return num_signs
}

 // test http get request from local host, send period 0 on start
var update = queryMonitor(0, "http://localhost:3000/ClientUpdateTest")

var j = parseUpdate(update);


//run test on json files and link with riana's code to verify check and receive
