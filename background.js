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

var log = console.log.bind(console)
// https://developer.chrome.com/extensions/match_patterns
var ALL_SITES = { urls: ['<all_urls>'] }

var tester = new Test()
tester.runTests()
var client = new Client(log)
CertificateCheck.checkPOMs()
var pub = "ce24da3e8351914787bbfb5d8f3366cc5d935b0844cece458cbe19df43eeda08d9631d76690794a35b5ee0bf22df013b826145940609e1a309c126ddf9c83b86"
//var sig = "4c1a4303b9b89bc875e500c4d4407ce8e389c7cfb5a363a8835d11c185698b92"
var sk = '67d53f170b908cabb9eb326c3c337762d59289a8fec79f7bc9254b584b73265c'
var wrongSk = '67d53f170b908cabb9eb326c3c337762d59289a8fec79f7bc9254b584b73225c'
var msg = "64726e3da8"

var n = 22563152875487429106689137614824193881384868606949072613876077246817826800656408428689569792626425751757103668905790874085904308994272577249393839901594638373026083729614957772225986980106530492907313646509054189167540885492731964740591279266611759417376789694996801929389724110452859432030423682537555131205369172007786755802263956544307456888475975019812997965673565517315450787068915058834733994299513295847005782966188263824821362702920674845139389611962806159634284684262824406319009282688892418677305894992319953420121246560164710149855635006516385593897453237579149710587187652820590321935200528151126709040649
var e = 65537
var rsaSig = "6a28a6947cf43ac670e6fe52cdc6c98dae9c585b8ba8e7df8965991c7ae9fbaa595cd39b551adc035fa8bad3465aae8fbaf824bec05d2d8c18b23833e35ee383aa91d6c6c67abe2a2a9ff9c7e2b2f0b84bcf15ff7bdd3ed89379b0b310b6566e4b2b50db4820a96e865258529ea41d017557cd5602a4aa095a521dafc0e0a43b1753b7ae8fde64e07e901679608246e3a9b691c3a072a222b4f31c2d6f091419c586e17661ce22306e392c4e03b7aff641aadc281b037cd232ad6a7cc58c4f9ccddff0df10276d6a1028a22734c449b433f7857f7e78782b77645a5c4df86758f3c85573dc7413af66b56240450b6fb37a6b5adac45e18a606c96a6cbd5e6e59"
//window.aggTest()
//window.verifyRSA(rsaSig, n, e)
//var sig = window.signTest(msg, sk) // async so it returns a Promise, UINT of size 96

// ************
// VERIFY SIGNATURE TESTS=
// var sig = window.sign(msg, sk)
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