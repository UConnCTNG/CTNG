import { Client } from "./src/client.js";
import { CertificateCheck } from "./src/certificate_checks.js";
import { Test } from "./test/test.js";
//import { type } from "os";

// var http = require('http');

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
  

var log = console.log.bind(console)
// https://developer.chrome.com/extensions/match_patterns
var ALL_SITES = { urls: ['<all_urls>'] }

// var tester = new Test()
// await tester.runTests()
// var client = new Client(log)
// CertificateCheck.checkPOMs()

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

//sigGenTest()

// END OF SIGNATURE GENERATION LOGIC

// We have one signer for now
// localhost 8080
var pub = '8f539bbefe0f6d4a362bee38367731e065b0c0dea004fa070e485ba36a5c306538e62a1e4e73c2e511749f7ccff9245f'
var sigTest = '8d630775a6ef65fee1cf3c25a5a47d728d2c1b5c11a25f0aa119b5751779afaf389c6530a9880d5db426178ce58278510f24e0bf7ab1f22a4d0ffcb7803288e090c923ecde030a294f9932625e44c46de21de98cb4ee80e0e00cefeac663be4c'
var sk = '58e40533351d5e023133a1f355bbeaed1ef7f437faf9625169a2b37c9c977f38'
var payload = "{\"Signer\":\"localhost:9000\",\"Timestamp\":\"2023-03-13T21:59:31Z\",\"RootHash\":\"\\ufffd\\ufffd\\u0010\\ufffd'@Gj\\ufffd*\\ufffdqy...\\ufffdb\\u0013\\ufffd\\n\\ufffd\\ufffd?\\ufffd\\ufffd\\ufffd\\ufffd7\\ufffd\\u001d\\ufffd\",\"TreeSize\":12}"
let sig = ""

// let sigFunc = window.sign(msg, sk).then(function(result) {
//     //return uint8ArrayToHex(result)
//     sig = bytesToHex(result)
// })

// localhost 8081
var pub2 = '8d7893edcda6d9051aa9591a9e694c2d50660033b5c00476ab2dfa916735bf6dd76222bf1e7d471f6cabe4a4802645e0'
var sk2 = '1074b2fe01cf4b94297d649825841d402c8e8e41268718cf57673dc488bd503f'
let sig2 = ""
// let sigFunc2 = window.sign(msg, sk2).then(function(result) {
//     //return uint8ArrayToHex(result)
//     sig2 = bytesToHex(result)
//     //console.log(sig2)
// })

// async function signMessageHelper(msg, sk1, sk2) {
//     try {
//         const result = await window.sign(msg, sk1);
//         const result2 = await window.sign(msg, sk2);
//         sig1 = bytesToHex(result);
//         sig2 = bytesToHex(result2)
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

//window.aggTest()
// log("SIG1 and 2: ", sig, sig2)

// var aggSig = await window.aggregateSignatures([sig, sig2])
// log("AGGSIG: ", aggSig)

// log("PK1, SIG1", { pub, sig })
// log("PK2, SIG2", { pub2, sig2 })

//payload = payload.replace(/"/g, '\\"')
//log(payload)

// var n = 22563152875487429106689137614824193881384868606949072613876077246817826800656408428689569792626425751757103668905790874085904308994272577249393839901594638373026083729614957772225986980106530492907313646509054189167540885492731964740591279266611759417376789694996801929389724110452859432030423682537555131205369172007786755802263956544307456888475975019812997965673565517315450787068915058834733994299513295847005782966188263824821362702920674845139389611962806159634284684262824406319009282688892418677305894992319953420121246560164710149855635006516385593897453237579149710587187652820590321935200528151126709040649
// var e = 65537
// var rsaSig = "6a28a6947cf43ac670e6fe52cdc6c98dae9c585b8ba8e7df8965991c7ae9fbaa595cd39b551adc035fa8bad3465aae8fbaf824bec05d2d8c18b23833e35ee383aa91d6c6c67abe2a2a9ff9c7e2b2f0b84bcf15ff7bdd3ed89379b0b310b6566e4b2b50db4820a96e865258529ea41d017557cd5602a4aa095a521dafc0e0a43b1753b7ae8fde64e07e901679608246e3a9b691c3a072a222b4f31c2d6f091419c586e17661ce22306e392c4e03b7aff641aadc281b037cd232ad6a7cc58c4f9ccddff0df10276d6a1028a22734c449b433f7857f7e78782b77645a5c4df86758f3c85573dc7413af66b56240450b6fb37a6b5adac45e18a606c96a6cbd5e6e59"
//window.aggTest()
//window.verifyRSA(rsaSig, n, e)
//var sig = window.signTest(msg, sk) // async so it returns a Promise, UINT of size 96

// let msg = '64726e3da8'.repeat(22)
// let utf8Encode = new TextEncoder();
// let encode = utf8Encode.encode(pub);
//var rootHash = encode.join('') // byte array
// payload = stringToHex(payload)
// log("Str to Hex: ", stringToHex(payload))
// log("Payload hex: ", payloadHex)

//console.log("VERIFIED?: ", window.verify(pub, sig, payload)) // should be True
// ************
// VERIFY SIGNATURE TESTS=
// var pk = window.getPublicKey(sk)
// log("PK: ", pk)
// var sig = window.sign(payload, sk).then(function(result) {
//   console.log("SIG: ", uint8ArrayToHex(result))

// })
// log("SIG: ", sig)
// //console.log(sig)
// var wrongSig = window.sign(msg, wrongSk)
// let signature = sig.then(function(result) { // grabs the value of the Promise
//   var publicKey = window.getPublicKey(sk)
//   console.log(window.verify(publicKey, result, msg)) // should be True
// })

// let wrongSignature = wrongSig.then((result) => {
//   try {
//     let bool = window.verify(sk, result, msg)
//     var bool1 = bool.then((result) => {
//       console.log("RESULT: ", result.isValid)
//       return result
//     }) // should be false
//     console.log(bool1)
//   }
//   catch (error) {
//     console.log("Can't verify")
//   }
// })
// ************

// Mozilla doesn't use tlsInfo in extraInfoSpec 
var extraInfoSpec = ['blocking', "responseHeaders"]; 

log("Certificate listener initialized.")   
browser.webRequest.onHeadersReceived.addListener(async function(details){
    var requestId = details.requestId
    var securityInfo = await browser.webRequest.getSecurityInfo(requestId, {
        certificateChain: true,
        rawDER: false
    });

    //let cert = client.parseCertificate(securityInfo)
    // var request = http.request(option , function(resp){
    //     resp.on("data",function(chunck){
    //         console.log(chunck.toString());
    //     }) 
    //  })
    //  request.end();

}, ALL_SITES, extraInfoSpec) 

browser.storage.local.onChanged.addListener(client.logStorageUpdate)

//browser.storage.local.clear();
