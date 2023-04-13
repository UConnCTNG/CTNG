import { Client } from "../src/client.js";

// var http = require('http');

var option = {
    hostname : "localhost" ,
    port : 3000 ,
    method : "POST",
    path : "/"
} 


var log = console.log.bind(console)
var github_sites = { urls: ["https://github.com/"]}

// https://developer.chrome.com/extensions/match_patterns
var ALL_SITES = { urls: ['<all_urls>'] }
var client = new Client(log)

// Mozilla doesn't use tlsInfo in extraInfoSpec 
var extraInfoSpec = ['blocking', "responseHeaders"]; 

log("Certificate listener initialized.")   

browser.webRequest.onHeadersReceived.addListener(async function(details){
    var requestId = details.requestId
    var securityInfo = await browser.webRequest.getSecurityInfo(requestId, {
        certificateChain: true,
        rawDER: false
    });
    //log(securityInfo);
    log("Got the cert!")
    // const privateKey = bls.utils.randomPrivateKey();
    // console.log('Private key:', privateKey);

    // const publicKey = bls.getPublicKey(privateKey);
    // console.log('Public key:', publicKey);

    let cert = client.parseCertificate(securityInfo)

    // var request = http.request(option , function(resp){
    //     resp.on("data",function(chunck){
    //         console.log(chunck.toString());
    //     }) 
    //  })
    //  request.end();

}, ALL_SITES, extraInfoSpec) 

browser.storage.local.onChanged.addListener(client.logStorageUpdate)


// if period=0
fetch('http://localhost:3000/?period=0')
  .then(response => response.text())
  .then(text => {
    // getting the payload as an Object 
    const data = JSON.parse(text);

    var sths0 = [] 
    var timestamps0 = [] 
    var revs0 = []
    var accs0 = []
    var cons0 = []

    for (var i = 0; i < Object.keys(data.STHs).length; i++) {
      sths0.push(data.STHs[i]);
      timestamps0.push(data.STHs[i].timestamp);   
    }

    for (var i = 0; i < Object.keys(data.REVs).length; i++) {
      revs0.push(data.REVs[i]);
    }

    if (!data.ACCs || (data.ACCs && data.ACCs.size == 0)) {
      accs0 = []
    } else {
      for (var i = 0; i < Object.keys(data.ACCs).length; i++) {
        accs0.push(data.ACCs[i])
      }
    }

    if (!data.CONs || (data.CONs && data.CONs.size == 0)) {
      cons0 = []
    } else {
      for (var i = 0; i < Object.keys(data.CONs).length; i++) {
        cons0.push(data.CONs[i])
      }
    }

    // store the period=0 sths and timestamps into local storage
    browser.storage.local.set({sths0 /*key name in local storage*/});
    browser.storage.local.set({timestamps0 /*key name in local storage*/})
    browser.storage.local.set({revs0})
    browser.storage.local.set({accs0})
    browser.storage.local.set({cons0})
    
    // checks
    console.log("The following is the CON(s) from period 0:")
    console.log(cons0)

    console.log("The following is the ACC(s) from period 0:")
    console.log(accs0)
  });

// if period=1
fetch('http://localhost:3000/?period=1')
  .then(response => response.text())
  .then(text => {
    // getting the payload as an Object 
    const data = JSON.parse(text);

    var sths1 = [] // store the sths from period=1 here
    var timestamps1 = [] // store the timestamp from period=1 
    var revs1 = []
    var accs1 = []
    var cons1 = []
    
    for (var i = 0; i < Object.keys(data.STHs).length; i++) {
        sths1.push(data.STHs[i]);
        timestamps1.push(data.STHs[i].timestamp);   
    }

    for (var i = 0; i < Object.keys(data.REVs).length; i++) {
      revs1.push(data.REVs[i]);
    }

    if (!data.ACCs || (data.ACCs && data.ACCs.size == 0)) {
      accs1 = []
    } else {
      for (var i = 0; i < Object.keys(data.ACCs).length; i++) {
        accs1.push(data.ACCs[i])
      }
    }

    if (!data.CONs || (data.CONs && data.CONs.size == 0)) {
      cons1 = []
    } else {
      for (var i = 0; i < Object.keys(data.CONs).length; i++) {
        cons1.push(data.CONs[i])
      }
    }

    // store the period=1 sths and timestamps into local storage
    browser.storage.local.set({sths1 /*key name in local storage*/});
    browser.storage.local.set({timestamps1 /*key name in local storage*/})
    browser.storage.local.set({revs1})
    browser.storage.local.set({accs1})
    browser.storage.local.set({cons1})

    // check sths
    console.log("The following is the ACC(s) from period 1:")
    console.log(accs1);

    console.log("The following is the CONs(s) from period 1:")
    console.log(cons1);
  });

// if period=2
fetch('http://localhost:3000/?period=2')
  .then(response => response.text())
  .then(text => {
    // getting the payload as an Object 
    const data = JSON.parse(text);

    var sths2 = []; // store the sths from period=0 here
    var timestamps2 = []; // store the timestamp from period=2 
    var revs2 = [];
    var accs2 = [];
    var cons2 = [];
    
    for (var i = 0; i < Object.keys(data.STHs).length; i++) {
      sths2.push(data.STHs[i]);
      timestamps2.push(data.STHs[i].timestamp);   
    }

    for (var i = 0; i < Object.keys(data.REVs).length; i++) {
      revs2.push(data.REVs[i]);
    }

    if (!data.ACCs || (data.ACCs && data.ACCs.size == 0)) {
      accs2 = []
    } else {
      for (var i = 0; i < Object.keys(data.ACCs).length; i++) {
        accs2.push(data.ACCs[i])
      }
    }

    if (!data.CONs || (data.CONs && data.CONs.size == 0)) {
        cons2 = []
    } else {
      for (var i = 0; i < Object.keys(data.CONs).length; i++) {
        cons2.push(data.CONs[i])
      }
    }

    // store the period=2 sths and timestamps into local storage
    browser.storage.local.set({sths2 /*key name in local storage*/});
    browser.storage.local.set({timestamps2 /*key name in local storage*/});
    browser.storage.local.set({revs2});
    browser.storage.local.set({accs2});
    browser.storage.local.set({cons2});

    // check 
    console.log("The following is the ACC(s) from period 2:");
    console.log(accs2);

    console.log("The following is the CON(s) from period 2:");
    console.log(cons2);
});

// if period=3
fetch('http://localhost:3000/?period=3')
  .then(response => response.text())
  .then(text => {
    // getting the payload as an Object 
    const data = JSON.parse(text);

    var sths3 = []; // store the sths from period=0 here
    var timestamps3 = []; // store the timestamp from period=3
    var revs3 = [];
    var accs3 = [];
    var cons3 = [];
    for (var i = 0; i < Object.keys(data.STHs).length; i++) {
        sths3.push(data.STHs[i]);
        timestamps3.push(data.STHs[i].timestamp);
        revs3.push(data.REVs[i]);
    }

    if (!data.ACCs || (data.ACCs && data.ACCs.size == 0)) {
      accs3 = []
    } else {
      for (var i = 0; i < Object.keys(data.ACCs).length; i++) {
        accs3.push(data.ACCs[i])
      }
    }

    if (!data.CONs || (data.CONs && data.CONs.size == 0)) {
      cons3 = []
    } else {
      for (var i = 0; i < Object.keys(data.CONs).length; i++) {
        cons3.push(data.CONs[i])
      }
    }

    // store the period=3 sths and timestamps into local storage
    browser.storage.local.set({sths3 /*key name in local storage*/});
    browser.storage.local.set({timestamps3 /*key name in local storage*/});
    browser.storage.local.set({revs3});
    browser.storage.local.set({accs3});
    browser.storage.local.set({cons3});

    // check sths
    console.log("The following is the con(s) from period 3:");
    console.log(cons3);

    console.log("The following is the ACCs(s) from period 3:");
    console.log(accs3);
  });

function onGot(data) {
  var certCA = data.cert.issuer
  loggers = ["localhost:9000","localhost:9001", "localhost:9002"]

  var conLoggerCount = 0
  var accLoggerCount = 0

  var conPOMs = []
  for (var i = 0; i < data.cons1.length; i++) {
    conPOMs.push(data.cons1[i].payload[0])
    if (loggers.includes(data.cons1[i].payload[0])) {
      conLoggerCount += 1;
    }
  }
  
  var accPOMs = []
  for (var i = 0; i < data.accs1.length; i++) {
    accPOMs.push(data.accs1[i].payload[0])
    if (loggers.includes(data.accs1[i].payload[0])) {
      accLoggerCount += 1;
    }
  }

  var loggerCountCheck = (conLoggerCount == 0 && accLoggerCount == 0)

  if (conPOMs.length == 0 && accPOMs.length == 0) {
      //return 1; //success
      console.log("Pass.")
  }
  else if ((!conPOMs.includes(certCA) && !accPOMs.includes(certCA)) && loggerCountCheck) {
      //return 1; //success
      console.log("Pass.")
  }
  else if ((conPOMs.includes(certCA) || accPOMs.includes(certCA)) && loggerCountCheck) {
      //return 0; //fail
      console.log("Fail.")
  }
  else {
    console.log("Fail.")
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
}
  
function checkPOM() {
  let gettingItem = browser.storage.local.get(["cons1", "accs1", "cert"]);
  gettingItem.then(onGot, onError);
}

checkPOM();

