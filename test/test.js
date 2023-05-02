import { Client } from "../src/client.js";
import { CertificateCheck } from "../src/certificate_checks.js";
import { certs } from "../src/config.js";


class TestDriver {
  constructor() {
    this.currentCA = null;
    this.client = null;
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

  async init() {
    // Create and store a large JSON object that maps the test urls to the STHs
    this.client = new Client()
    for (const [key, value] of Object.entries(certs)) {
      //console.log(key, window.getSTH(value))
      this.client.store(key, value)
    }
  }

  async runTests() {
    console.log("INITIALIZING TEST DRIVER.")
  
    this.init()

  
    // Storing cert given a selected CA setting (and public key map)
    this.client.storeCertObject()
  
    // Testing redirect function
    // redirect_tester_x = 1
    // if (redirect_tester_x < 5) { // redirect_tester_x < 5 with the condition where the certificate is invalid. 
    //  await this.redirect();
    //}
  
    // Testing getting updates from Monitor
    for (let p = 0; p < 4; p++) {
      const store = await this.client.getMonitorUpdates(p);
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

document.addEventListener('DOMContentLoaded', () => {
  const radioButtons = document.querySelectorAll('input[type="radio"]');

  // // Load stored checkbox states from storage
  // radioButtons.forEach(radio => {
  //   const key = radio.id;
  //   browser.storage.local.get(key, data => {
  //     radio.checked = !!data[key];
  //     console.log(radio.checked)
  //   });
  // });

  // // Save checkbox state changes to storage
  radioButtons.forEach(radio => {
    radio.addEventListener('change', () => {
      for (const radioButton of radioButtons) {
          if (radioButton.checked) {
              this.currentCA = radioButton.value;
              break;
          }
      }
      // show the output:
      console.log(`${currentCA} selected.`)
    });
  });
});

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