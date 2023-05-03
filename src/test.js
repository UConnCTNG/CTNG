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
    const signatureCheckResult = CertificateCheck.checkSignatures();
    if (!signatureCheckResult) {
      // Signature check failed, redirect user
      await this.redirect();
      return;
    }
  
    // Testing Step 2
    let pomResult = CertificateCheck.checkPOMs();
  
    // Testing Step 3
    let poiResult = CertificateCheck.verifyPOI(1);
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
    if (window.history.length > 1) {
      // Navigate back to the previous website
      window.history.back(-1);
      // Display an alert with the reason for the redirect
      alert("The website you tried to access was flagged as potentially malicious and was redirected.");
    } else {
      // If there is no previous website, route to google
      window.location.href = "https://www.google.com/";
      // Display an alert with the reason for the redirect
      alert("This website you tried to access was flagged as potentially malicious.");
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const radioButtons = document.querySelectorAll('input[type="radio"]');

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
