export default class Client {
  
  constructor(sites, log) {
    // https://developer.chrome.com/extensions/match_patterns
    this.sites = sites; 
    this.log = console.log.bind(console)
  }

  static getCertificateFromStorage() {
    // returns cert object
  }

  parseCertificate(securityInfo) {
    var cert = securityInfo.certificates[0]
    var subjectString = cert.subject
    var certInfo = {
      SerialNumber: cert.serialNumber,
      Subject: { // need to parse this string, "CN=*.nr-data.net,O=\"New Relic, Inc.\",L=San Francisco,ST=California,C=US"
        Organization: "",
        CommonName: "",
        Country: ""
      },
      Validity: { Start: new Date(cert.validity.start), End: new Date(cert.validity.end) },
      IsCA: true,
      KeyUsage: "",
      ExtKeyUsage: "",
      BasicConstraintsValid: true
    }

    this.log(certInfo)

    // storeCertificate(certInfo)
  }

  static storeCertificate() {
    // returns status (1 if successfully stored)
  }

  static isCertificateStored() {
    // returns bool
  }

  static deleteCertificateFromStorage() {
    // returns status
  }

}
