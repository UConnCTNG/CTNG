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
 
 // test http get request from local host, send period 0 on start
 queryMonitor(0, "http://localhost:3000/ClientUpdateTest")