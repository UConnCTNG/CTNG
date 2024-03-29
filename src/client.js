import { CertificateCheck } from "./certificate_checks.js";
import { pubK, certs, loggerPrivKeyInfo, blsPrivateKeys } from "./config.js"

//const {cert} = require("./config.js")
class Client {
  
  constructor(sites) {
    this.sites = sites; 
  }

  // Logs the changes made in storage to the user, primarily for testing purposes
  async logStorageUpdate(changes) {
    const updatedItems = Object.keys(changes)
    for (const item of updatedItems) {
      //console.log(`${item} has changed value from ${changes[item].oldValue}`)
    }
  }

  // Gets a certificate from local storage
  static getCertificateFromStorage(serialNumber) {
    // returns cert object
    try {
      return browser.storage.local.get(serialNumber)
    } 
    catch (error) {
      console.log(error)
      return 0
    }
  }

  // Parses information from a securityInfo object fetched from the browser to create and store a cert object
  parseCertificate(securityInfo) {
    var cert = securityInfo.certificates[0]
    var subjectString = cert.subject.split('=')
    var certInfo = {
      SerialNumber: cert.serialNumber,
      Subject: {
        Organization: subjectString[2].substring(1, subjectString[2].length - 3),
        CommonName: subjectString[1].substring(0, subjectString[1].length- 2),
        Country: subjectString[5]
      },
      Validity: { Start: new Date(cert.validity.start), End: new Date(cert.validity.end) },
      IsCA: true,
      KeyUsage: "",
      ExtKeyUsage: "",
      BasicConstraintsValid: true
    }

    console.log(certInfo)

    try {
      this.storeCertificate(certInfo)
    } 
    catch (error) {
      console.log(error)
      return 0
    }
    return certInfo
  }

  // Stores certificate data in storage and verifies it was stored
  async storeCertificate(data) {
    // returns status (1 if successfully stored)
    // currently storing as a serial number: certInfo pair
    // idk if this is final for the key
    if (! this.isCertificateStored(data.SerialNumber)) {
      browser.storage.local.set({[data.SerialNumber]: data}).then(console.log("Storage set!"))
      return 1
    }
    return 0
  }

  // Tests whether a cert was stored correctly
  isCertificateStored(serialNumber) {
    try {
      browser.storage.local.get(serialNumber)
    }
    catch (error) {
      return false
    }
    return true
  }

  // Deletes a cert from storage (this was in question of necessity)
  static deleteCertificateFromStorage() {
    // returns status
  }

  // Gets monitor updates for a given period through an HTTP request
  async getMonitorUpdates(period) {
    fetch(`http://localhost:3000/?period=${period}`)
    .then(response => response.text())
    .then(async (text) => {
    
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
  
      const check = await CertificateCheck.checkUpdate(period, sths, revs, accs, cons)

      console.log("STHS in client: ", sths)
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
    return period + 1;
  }

  // Generic function used to store a given object under a given name
  store(name, obj) {
    browser.storage.local.set({ [name]: obj });
  }

  // Creates an RSAKey object that is a private key
  static getPrivateKeyObject(r) {
    let n = BigInt(r.N).toString(16) //SignatureGeneration.stringToHex(r.N)
    let e = BigInt(r.E).toString(16) //SignatureGeneration.stringToHex(r.E)
    let d = BigInt(r.D).toString(16)
    let p = BigInt(r.Primes[0]).toString(16)
    let q = BigInt(r.Primes[1]).toString(16)
    let dp = BigInt(r.Precomputed["Dp"]).toString(16)
    let dq = BigInt(r.Precomputed["Dq"]).toString(16)
    let co = BigInt(r.Precomputed["Qinv"]).toString(16)
    var privK = window.createPrivateKeyRSA(n, e, d, p, q, dp, dq, co)
    return privK
  }

  // Creates an object that key-value pairs a logger address with its RSAKey private key object
  static getLoggerPrivateKeys(loggerPrivateKeyInfo) {
    var logRSAPrivs = {
      "localhost:9000": null,
      "localhost:9001": null,
      "localhost:9002": null,
    }
    
    for (const [key, value] of Object.entries(logRSAPrivs)) {
      logRSAPrivs[key] = this.getPrivateKeyObject(loggerPrivKeyInfo[key])
    }

    return logRSAPrivs
  }

  // Stores public and private key maps from config.js in local storage
  storeKeyObjects(cert) {
    
    browser.storage.local.set({ pubK });
    browser.storage.local.set({ loggerPrivKeyInfo });
    browser.storage.local.set({ blsPrivateKeys });
  }
}

export { Client };
