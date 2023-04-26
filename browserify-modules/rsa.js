// window.verifyRSA = function(sigValueHex, rawCert, msg) {
//   var rs = require('jsrsasign');
//   var rsu = require('jsrsasign-util');

//   // initialize
//   var sig = new KJUR.crypto.Signature({"alg": "SHA256withRSA"});
//   // initialize for signature validation
//   sig.init("-----BEGIN CERTIFICATE-----(snip)"); // signer's certificate
//   // update data
//   sig.updateString('aaa')
//   // verify signature
//   var isValid = sig.verify(sigValueHex)

//   // init the cert object
//   // var c = new rs.X509();
//   // c.readCertPEM(rawCert);
//   // // get the public key from the object
//   // var pubKey = rs.KEYUTIL.getKey(rawCert);
//   // var sig = new rs.KJUR.crypto.Signature({"alg": "SHA256withRSA"});
//   // console.log("PKKK: ", pubKey)
//   // sig.init(pubKey); // signer's certificate
//   // sig.updateString(msg)
//   // console.log(c.getParam())
//   // var isValid = sig.verify(c.getSignatureValueHex()) 
//   // return isValid
// }

window.verifyRSA = function(sigValueHex, rsaPublicKey) {
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  // initialize
  var sig = new rs.KJUR.crypto.Signature({"alg": "SHA256withRSA"});
  // initialize for signature validation
  sig.init(rsaPublicKey); // signer's certificate
  // update data
  sig.updateString('aaa')
  // verify signature
  var isValid = sig.verify(sigValueHex)
  console.log('Verified msg? ', isValid)
  return isValid
}

window.signRSA = function() {
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  var sig = new rs.KJUR.crypto.Signature({ "alg": "SHA256withRSA" });
  var rsaKeypair = rs.KEYUTIL.generateKeypair("RSA", 2048);
  console.log(rsaKeypair)
  let rsaPrivateKey = rsaKeypair.prvKeyObj //RSA Object
  let rsaPublicKey = rsaKeypair.pubKeyObj //RSA Object

  console.log(rsaPrivateKey)

  sig.init(rsaPrivateKey);   // rsaPrivateKey of RSAKey object
  sig.updateString('aaa')
  // // calculate signature
  var sigValueHex = sig.sign()
  console.log("SIGVALUEHEX: ", sigValueHex)
  return { sigValueHex, rsaPublicKey }
}

window.testRSA = function(rawCert) {
  var rs = require('jsrsasign');
  var c = new rs.X509();
  c.readCertPEM(rawCert);
  console.log("CC: ", c.getPublicKey())
  console.log(c.getSignatureAlgorithmField())
  var pubKey = rs.KEYUTIL.getKey(rawCert); //c.getPublicKey();
  console.log("pk: ", pubKey)
  var sig = c.getSignatureValueHex();
  console.log(c.verifySignature(pubKey))

  console.log("PubKey, Sig, ", {pubKey, sig})
}

window.convertRSASignature = function(signature) {
  const hexSignature = signature.replace(/:/g, '');
  const buffer = Buffer.from(hexSignature, 'hex').toString('base64');
  return buffer
}
