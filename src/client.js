import { cert } from "./config.js"

//const {cert} = require("./config.js")
class Client {
  
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
    return certInfo
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

  storeCertObject() {
    var cert = {
      "Issuer": "localhost:9100",
      "Serial Number": "fe:a8:5e:a5:cc:5d:84:7c:99:e6:77:b2:9d:80:a7:81",
      "Signature Algorithm": "sha256WithRSAEncryption",
      "Validity": {
        "Not Before": "Mar 13 21:59:29 2023 GMT",
        "Not After": "Mar 12 21:59:29 2024 GMT"
      },
      "Subject": "CN = Testing Dummy 0",
      "STH": {
        "application": "CTng",
        "period": "0",
        "type": "http://ctng.uconn.edu/101",
        "signer": "localhost:9000",
        "signers": null,
        "signature": [
          "{\"sig\":\"6a28a6947cf43ac670e6fe52cdc6c98dae9c585b8ba8e7df8965991c7ae9fbaa595cd39b551adc035fa8bad3465aae8fbaf824bec05d2d8c18b23833e35ee383aa91d6c6c67abe2a2a9ff9c7e2b2f0b84bcf15ff7bdd3ed89379b0b310b6566e4b2b50db4820a96e865258529ea41d017557cd5602a4aa095a521dafc0e0a43b1753b7ae8fde64e07e901679608246e3a9b691c3a072a222b4f31c2d6f091419c586e17661ce22306e392c4e03b7aff641aadc281b037cd232ad6a7cc58c4f9ccddff0df10276d6a1028a22734c449b433f7857f7e78782b77645a5c4df86758f3c85573dc7413af66b56240450b6fb37a6b5adac45e18a606c96a6cbd5e6e59\",\"id\":\"localhost:9000\"}",
          ""
        ],
        "timestamp": "2023-03-13T21:59:31Z",
        "crypto_scheme": "RSA",
        "payload": [
          "localhost:9000",
          "{\"Signer\":\"localhost:9000\",\"Timestamp\":\"2023-03-13T21:59:31Z\",\"RootHash\":\"\\ufffd\\ufffd\\u0010\\ufffd'@Gj\\ufffd*\\ufffdqy...\\ufffdb\\u0013\\ufffd\\n\\ufffd\\ufffd?\\ufffd\\ufffd\\ufffd\\ufffd7\\ufffd\\u001d\\ufffd\",\"TreeSize\":12}",
          ""
        ]
      },
      "POI": {
        "SiblingHashes": [
          "Z7iPVPvZQRYWQuDiaPx5bX3crrwOIk9DpVBk6+2gTvw=",
          "a3JZsStg1xHaXfl6PT7QJZ34IIu7dAXjxr9gMO6TNao=",
          "vqAdBXLKvmVVxOaa+GAYlIuTouUTdi+mR/7Ahi96rGA=",
          "CuSdi9Auz5Uc9d42sl6A+trdIqOQzsH0emfED4q6aqs="
        ],
        "NeighborHash": "6gkaYIt1zM4paSWBI34pJdtIWCoCKyYACEODqkuSyCM="
      }
    }
    browser.storage.local.set({cert});
  }

}

export { Client };
