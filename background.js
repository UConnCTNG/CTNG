import Client from "./src/client.js";

var log = console.log.bind(console)
var github_sites = { urls: ["https://github.com/"]}

// https://developer.chrome.com/extensions/match_patterns
var ALL_SITES = { urls: ['<all_urls>'] }
var client = new Client(log)

// Mozilla doesn't use tlsInfo in extraInfoSpec 
var extraInfoSpec = ['blocking', "responseHeaders"]; 

log("Certificate listener initialized.")   
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/webRequest/onHeadersReceived
browser.webRequest.onHeadersReceived.addListener(async function(details){
    //log(`\n\nGot a request for ${details.url} with ID ${details.requestId}`)

    // Yeah this is a String, even though the content is a Number
    var requestId = details.requestId

    var securityInfo = await browser.webRequest.getSecurityInfo(requestId, {
        certificateChain: true,
        rawDER: false
    });

    client.parseCertificate(securityInfo)

}, ALL_SITES, extraInfoSpec) 
