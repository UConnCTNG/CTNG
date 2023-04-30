import { Client } from "../src/client.js";
import { CertificateCheck } from "../src/certificate_checks.js";


class TestDriver {
  constructor() {
  }

  async verificationChecks() {
    // Testing Step 1
    // calling checkSignatures() for step 1.1: signature check on the certificate
    // calling checkUpdate() for step 1.2: Signature Verification on monitor update
    
     const signatureCheckResult = CertificateCheck.checkSignatures();
    // if (!signatureCheckResult) {
    //   // Signature check failed, redirect user
    //   //await this.redirect();
    //   return;
    // }
  
    // Testing Step 2
    // calling checkPOMs() for step 2: Check if CA and Loggers are in CONs and ACCs PoM lists
    
    //let pomResult = CertificateCheck.checkPOMs()
  
    // Testing Step 3
    // calling verifyPOI() for step 3: POI verification. Check if a certificate is in the Tree head given the POI
    
    //let poiResult = CertificateCheck.verifyPOI(1);
  }

  async runTests() {
    var log = console.log.bind(console)
    log("INITIALIZING TEST DRIVER.")
  
    let client = new Client(log)
  
    // Testing storing cert and public key map
    client.storeCertObject()
  
    // Testing redirect function
    // redirect_tester_x = 1
    // if (redirect_tester_x < 5) { // redirect_tester_x < 5 with the condition where the certificate is invalid. 
    //  await this.redirect();
    //}
  
    // Testing getting updates from Monitor
    for (let p = 0; p < 4; p++) {
      const store = await client.getMonitorUpdates(p);
      this.verificationChecks();
      await delay60Seconds();      
    }
  
    this.verificationChecks()
  
    // inside storage function call out to connector function
    //functionSampleConnector();
  }

  //Front end development
  async redirect() {
   // if (window.history.length > 1) {
      // Navigate back to the previous website
      // window.history.back(-1);
      // Display an alert with the reason for the redirect
      alert("The website you tried to access was flagged as potentially malicious and was redirected.");
    //} else {
      // If there is no previous website, route to google
      // window.location.href = "https://www.google.com/";
      // Display an alert with the reason for the redirect
      // alert("This website you tried to access was flagged as potentially malicious.");
    //}
  }

}

var testDriver = new TestDriver()
testDriver.runTests()

function delay60Seconds() {
  return new Promise(resolve => {
    setTimeout(() => {
      let uselessPlaceholder = 5;
      resolve();
    }, 60000);
  });
}

export { TestDriver };