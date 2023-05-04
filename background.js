import { Client } from "./src/client.js";
import { CertificateCheck } from "./src/certificate_checks.js";
import { Test } from "./test/test.js";

var option = {
    hostname : "localhost" ,
    port : 3000 ,
    method : "POST",
    path : "/"
}

//Test function for verifying locally generated signatures for STHs, REVs, and POMs from monitor update
function verifyGeneratedSignatures(signers, sig, msg) {
  let gettingItem = browser.storage.local.get(["pubK"]);
  gettingItem.then(async (data) => {
    let keys = [] //public keys
    for (let s of signers) {
      let key = data.pubK[s].T
      keys.push(hexToUint8Array(key))
    }
    //console.log("PUBKEYS", keys)
    let aggKey = window.aggregatePublicKeys(keys)
    //console.log("aggpubkey", aggKey, sig, msg)
    let b = await window.verify(aggKey, sig, msg)
    return 1;
  }, (error) => {
    console.log(`Error: ${error}`);
  });
}

// Takes an array of signers, a msg(payload), and private key map
// creates a new signature by signing the payload(msg) with the signers private keys and returns it
async function generateSignature(signers, msg, privK) {
    // Returns a uint8 array that is the *aggregated* signature
      let sigs = []
      for (let s of signers) {
        let key = privK[s]
        console.log(key)
        let n = await window.sign(msg, key)
        sigs.push(n) //has to return uint8 signature
      }
      let newSig = window.aggregateSignatures(sigs) //has to be uint8
      //console.log("GENERATED AGGSIG: ", newSig)
      return newSig;
  }

// Takes a masterArray from checkUpdate (in cert_checks)
// changes old sig to new generated sig for every object
function signatureGeneration(masterArray) {
  for (let m of masterArray) {
    let newSig = generateSignature(m.signers, m.payload);
    m.sig = newSig;
  }
  return masterArray;
}

// Takes a hex string and converts it to Uint8 byte array
function hexToUint8Array(hex) {
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string length');
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }
  
// Takes a Uint8 byte array and converts to hex format
function bytesToHex(bytes) {
    return Array.from(
      bytes,
      byte => byte.toString(16).padStart(2, "0")
    ).join("");
}
  
// Takes a string and converts it to Uint8 format like [120, 80, ...]
function stringToUTF8Bytes(string) {
    return new TextEncoder().encode(string);
}

// Takes a string like "Hello" and converts it into hex form like "a5fb"
function stringToHex(inputString) {
    let hexString = '';
    for (let i = 0; i < inputString.length; i++) {
        let hexCode = inputString.charCodeAt(i).toString(16);
        hexString += hexCode;
    }
    return hexString;
}
  
// Laziness at its finest
var log = console.log.bind(console)

// https://developer.chrome.com/extensions/match_patterns for reference
var ALL_SITES = { urls: ['<all_urls>'] }

// SIGNATURE GENERATION LOGIC
function sigGenTest() {
  let gettingItem = browser.storage.local.get(["privK"]);
  gettingItem.then(async (data) => {
    var msg = "localhost:9000"
    msg = stringToHex(msg)
    let signers = ["localhost:8080", "localhost:8083"]
    let aggSig = await generateSignature(signers, msg, data.privK)
    let result = await verifyGeneratedSignatures(signers, aggSig, msg)
  }, (error) => {
  console.log(`Error: ${error}`);
  });
}

// Mozilla doesn't use tlsInfo in extraInfoSpec 
var extraInfoSpec = ['blocking', "responseHeaders"]; 

log("Certificate listener initialized.")   
browser.webRequest.onHeadersReceived.addListener(async function(details){
    var requestId = details.requestId
    var securityInfo = await browser.webRequest.getSecurityInfo(requestId, {
        certificateChain: true,
        rawDER: false
    });

    // PARSING CERT LOGIC. USED FOR TESTING
    //let cert = client.parseCertificate(securityInfo)
    // var request = http.request(option , function(resp){
    //     resp.on("data",function(chunck){
    //         console.log(chunck.toString());
    //     }) 
    //  })
    //  request.end();

}, ALL_SITES, extraInfoSpec) 

browser.storage.local.onChanged.addListener(client.logStorageUpdate)

