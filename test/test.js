import { Client } from "../src/client.js";
import { CertificateCheck } from "../src/certificate_checks.js";
import { certs } from "../src/config.js";
import { SignatureGeneration } from "../src/sig-gen.js";


class TestDriver {
  constructor() {
    this.currentCA = "CA1";
    this.client = null;
  }

  // Drives the verification check functions, testing the certificates of the current CA setting
  async verificationChecks(periodNum) {
    // Testing Step 1
    // calling checkSignatures() for step 1.1: signature check on the cert's sths
    // calling checkUpdate() for step 1.2: Signature Verification on monitor update
    console.log("Period: ", periodNum)
    console.log("Current CA: ", this.currentCA)

    let certs = browser.storage.local.get([`p${periodNum}`, "loggerPrivateKeyInfo"]);
    certs.then(async (data) => {
      let period = Object.keys(data)[0]
      let privKeys = Client.getLoggerPrivateKeys(data.loggerPrivateKeyInfo)
      //console.log(privKeys)
      

      for (const [key, value] of Object.entries(data[period][this.currentCA])) {
        var cert = window.getCert(value)
        var sth = window.getSTH(value) // gets one STH for now
        var issuer = window.getCertIssuer(value).array[0][0].value
        var newSig = await SignatureGeneration.generateRSASignature(sth.signer, sth.payload, privKeys[sth.signer])
        sth.signature = newSig;
        //Assuming we only have 1 STH per cert for now, have to convert to an array
        let sths = [sth]

        //Checks
        // Step 1.1: Check signatures of sths (RSA)
        let verified = await CertificateCheck.checkSignatures(sths)

        if (verified) {
          // Signature check failed, redirect user
          await this.redirect();
          return;
        }
        
        //console.log("CheckSigs verified?", verified)
        // Step 1.2: Check signatures of monitor update (BLS) 
        // Checked before we store the update

        // Step 2: Check if CA and Loggers are in CONs and ACCs PoM lists
        let verified2 = await CertificateCheck.checkPOMs(periodNum, issuer)
        //console.log("CheckPOMs verified?", verified2)

        // Step 3: Check POI of certificate
        //let verified3 = await CertificateCheck.checkPOI(periodNum, sth)
        break;
      }
    }, (error) => {
      console.log(`Error in verificationChecks: ${error}`);
    });
  }

  // Initializes the extension by prepping local storage and listening for a button press to run tests
  async init() {
    console.log("INITIALIZING TEST DRIVER.")
    
    // Initializes the client, clears local storage, and stores certs from config
    browser.storage.local.clear()
    this.client = new Client()
    for (const [key, value] of Object.entries(certs)) {
      this.client.store(key, value)
    }

    document.addEventListener('DOMContentLoaded', () => {
      const radioButtons = document.querySelectorAll('input[type="radio"]');
      radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
          for (const radioButton of radioButtons) {
            if (radioButton.checked) {
              this.currentCA = radioButton.value;
              break;
            }
          }
          // show the output:
          console.log(`${this.currentCA} selected.`)
        });
      });
    });

    let btn = document.getElementById("runTests")
    btn.addEventListener("click", () => {
      console.log("Running")
      document.querySelector('#runTests').disabled = true;
      const radioButtons = document.querySelectorAll('input[type="radio"]');
      radioButtons.forEach(radio => {
        radio.disabled = true
      })
      this.runTests()
    });
  }


  // Stores config.js objects and simulates getting monitor updates periodically while verifying certificates as well
  async runTests() {
    // Storing private and public key objects
    this.client.storeKeyObjects()
    
    //Get updates from Monitor in 60 second intervals, and do verification checks every period
    for (let periodNum = 0; periodNum < 4; periodNum++) {
      const store = await this.client.getMonitorUpdates(periodNum);
      await delay(5) //delay to ensure cons are stored before checkPOMs is ran
      this.verificationChecks(periodNum);
      await delay(60);      
    }
  }

  // Conducts a tab redirect if at any point verification fails
  async redirect() {
    if (window.history.length > 1) {
      // Display an alert with the reason for the redirect
      alert("The website you tried to access was flagged as potentially malicious and was redirected.");
      // Navigate back to the previous website
      window.history.back(-1);
    } else {
      // Display an alert with the reason for the redirect
      alert("This website you tried to access was flagged as potentially malicious.");
      // Functionality for getting the current tab and redirecting. Does google for now
      let query = browser.tabs.query({ currentWindow: true })
      query.then((data) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].active) {
            browser.tabs.update(
              data[i].id,
              { active: true, url: "https://google.com" }
            )
          }
        }
      })
    }
  }
}

var testDriver = new TestDriver()
testDriver.init()

// Helper that stops code execution for a period of time
async function delay(seconds) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

export { TestDriver };