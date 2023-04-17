import { Client } from "./src/client.js";
import { CertificateCheck } from "./src/certificate_checks.js";
//import { type } from "os";

// var http = require('http');

var option = {
    hostname : "localhost" ,
    port : 3000 ,
    method : "POST",
    path : "/"
} 

var log = console.log.bind(console)
// https://developer.chrome.com/extensions/match_patterns
var ALL_SITES = { urls: ['<all_urls>'] }
var client = new Client(log)
CertificateCheck.checkPOMs()
var pub = "ce24da3e8351914787bbfb5d8f3366cc5d935b0844cece458cbe19df43eeda08d9631d76690794a35b5ee0bf22df013b826145940609e1a309c126ddf9c83b86"
//var sig = "4c1a4303b9b89bc875e500c4d4407ce8e389c7cfb5a363a8835d11c185698b92"
var sk = '67d53f170b908cabb9eb326c3c337762d59289a8fec79f7bc9254b584b73265c'
var wrongSk = '67d53f170b908cabb9eb326c3c337762d59289a8fec79f7bc9254b584b73225c'
var msg = "64726e3da8"

window.aggTest()

//var sig = window.signTest(msg, sk) // async so it returns a Promise, UINT of size 96
var sig = window.sign(msg, sk)
console.log(sig)
var wrongSig = window.sign(msg, wrongSk)

let signature = sig.then(function(result) { // grabs the value of the Promise
  
  // let utf8Encode = new TextEncoder();
  // let encode = utf8Encode.encode(wr);
  // result = encode.join('') // byte array
  var publicKey = window.getPublicKey(sk)
  console.log(window.verify(publicKey, result, msg)) // should be True

})

let wrongSignature = wrongSig.then((result) => {
  try {
    let bool = window.verify(sk, result, msg)
    
    var bool1 = bool.then((result) => {
      console.log("RESULT: ", result.isValid)
      return result
    }) // should be false
    console.log(bool1)
  }
  catch (error) {
    console.log("Can't verify")
  }
})


// Mozilla doesn't use tlsInfo in extraInfoSpec 
var extraInfoSpec = ['blocking', "responseHeaders"]; 

log("Certificate listener initialized.")   
browser.webRequest.onHeadersReceived.addListener(async function(details){
    var requestId = details.requestId
    var securityInfo = await browser.webRequest.getSecurityInfo(requestId, {
        certificateChain: true,
        rawDER: false
    });

    let cert = client.parseCertificate(securityInfo)
    // var request = http.request(option , function(resp){
    //     resp.on("data",function(chunck){
    //         console.log(chunck.toString());
    //     }) 
    //  })
    //  request.end();

}, ALL_SITES, extraInfoSpec) 

browser.storage.local.onChanged.addListener(client.logStorageUpdate)

//browser.storage.local.clear();

for (let period = 0; period < 4; period++) {
  fetch(`http://localhost:3000/?period=${period}`)
  .then(response => response.text())
  .then(text => {
 
    const data = JSON.parse(text);

    var sths = [] 
    var timestamps = [] 
    var revs = []
    var accs = []
    var cons = []

    for (var i = 0; i < Object.keys(data.STHs).length; i++) {
      sths.push(data.STHs[i]);
      timestamps.push(data.STHs[i].timestamp);   
    }

    for (var i = 0; i < Object.keys(data.REVs).length; i++) {
      revs.push(data.REVs[i]);
    }

    if (!data.ACCs || (data.ACCs && data.ACCs.size == 0)) {
      accs = []
    } else {
      for (var i = 0; i < Object.keys(data.ACCs).length; i++) {
        accs.push(data.ACCs[i])
      }
    }

    if (!data.CONs || (data.CONs && data.CONs.size == 0)) {
      cons = []
    } else {
      for (var i = 0; i < Object.keys(data.CONs).length; i++) {
        cons.push(data.CONs[i])
      }
    }

    //client.checkUpdate(period, sths, revs, accs, cons)

    let sthName = `sths${period}`
    browser.storage.local.set({ [sthName]:sths })
    let timestampName = `timestamps${period}`
    browser.storage.local.set({ [timestampName]: timestamps })
    let revName = `revs${period}`
    browser.storage.local.set({ [revName]: revs })
    let accName = `accs${period}`
    browser.storage.local.set({ [accName]: accs })
    let conName = `cons${period}`
    browser.storage.local.set({ [conName]: cons })
  });
}