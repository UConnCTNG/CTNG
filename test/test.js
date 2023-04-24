import { Client } from "../src/client.js";
import { CertificateCheck } from "../src/certificate_checks.js";


class Test {
  constructor() {
  }

  async verificationChecks() {
    // Testing Step 1
    // calling checkSignatures() for step 1.1: signature check on the certificate
    // calling checkUpdate() for step 1.2: Signature Verification on monitor update
    
    //client.storeCertObject()



    // Testing Step 2
    // calling checkPOMs() for step 2: Check if CA and Loggers are in CONs and ACCs PoM lists
    


    // Testing Step 3
    // calling verifyPOI() for step 3: POI verification. Check if a certificate is in the Tree head given the POI
  }


  async runTests() {
    const delay = ms => new Promise(res => setTimeout(res, ms)); //used for waiting 60 seconds

    var log = console.log.bind(console)
    log("INITIALIZING TEST DRIVER.")

    let client = new Client(log)
    // Testing storing cert and public key map
    client.storeCertObject()
    
    // Testing getting updates from Monitor
    /*
    for (let p = 0; p < 4; p++) {
      const store = await client.getMonitorUpdates(p);
      this.verificationChecks();
      delay(60000);
    }
    */
    for (let p = 0; p < 4; p++) {
      const store = await client.getMonitorUpdates(p);
      this.verificationChecks();
      await(60000);
    }

    // inside storage function call out to connector function
    //functionSampleConnector();
    

  }

  //Front end development
  async redirect() {
    if (window.history.length > 1) {
      // Navigate back to the previous website
      window.history.back();
      // Display an alert with the reason for the redirect
      alert("The website you tried to access was flagged as potentially malicious and was redirected.");
    } else {
      // If there is no previous website, route to google
      window.location.href = "https://www.google.com/";
      // Display an alert with the reason for the redirect
      alert("The website you tried to access was flagged as potentially malicious and was redirected.");
    }
  }


}


function delay60Seconds(){
  setTimeout(function(){

  }, 60000);
}

export { Test };