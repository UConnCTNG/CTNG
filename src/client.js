export default class Client {
  
  constructor(sites, log) {
    this.sites = sites; 
    this.log = console.log.bind(console)
  }

  async logStorageUpdate(changes) {
    const updatedItems = Object.keys(changes)
    for (const item of updatedItems) {
      console.log(`${item} has changed value from ${changes[item].oldValue}`)
    }
  }

  static getCertificateFromStorage(serialNumber) {
    // returns cert object
    try {
      return browser.storage.local.get(serialNumber)
    } 
    catch (error) {
      this.log(error)
      return 0
    }
  }

  parseCertificate(securityInfo) {
    var cert = securityInfo.certificates[0]
    var subjectString = cert.subject.split('=')
    //this.log(cert.subject) //"CN=github.com,O="GitHub, Inc.",L=San Francisco,ST=California,C=US"
    //this.log(subjectString) //[ "CN", "github.com,O", "\"GitHub, Inc.\",L", "San Francisco,ST", "California,C", "US" ]

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
    
    this.log(certInfo)

    try {
      this.storeCertificate(certInfo)
    } 
    catch (error) {
      this.log(error)
      return 0
    }
    return 1
  }

  async storeCertificate(data) {
    // returns status (1 if successfully stored)
    this.log("In store cert func")
    // currently storing as a serial number: certInfo pair
    // idk if this is final for the key
    if (! this.isCertificateStored(data.SerialNumber)) {
      browser.storage.local.set({[data.SerialNumber]: data}).then(this.log("Storage set!"))
      return 1
    }
    return 0
  }

  isCertificateStored(serialNumber) {
    try {
      browser.storage.local.get(serialNumber)
    }
    catch (error) {
      return false
    }
    return true
  }

  static deleteCertificateFromStorage() {
    // returns status
  }

}
