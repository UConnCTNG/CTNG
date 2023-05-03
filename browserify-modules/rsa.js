function stringToUTF8Bytes(string) {
  return new TextEncoder().encode(string);
}

// function bytesToHex(byteArray) {
//   return Array.from(byteArray, function(byte) {
//     return ('0' + (byte & 0xFF).toString(16)).slice(-2);
//   }).join('')
// }

function bytesToHex(bytes) {
  return Array.from(
  bytes,
  byte => byte.toString(16).padStart(2, "0")
  ).join("");
}

window.getSTH = function(certPEM) {
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  //Step 1: Parse cert
  var certNew = new rs.X509();
  certNew.readCertPEM(certPEM);
  //Step 2: Parse CTng extension
  var ctngExt = certNew.getExtCRLDistributionPoints().array[1].dpname.full[0].uri
  ctngExt = JSON.parse(ctngExt)
  return ctngExt.STH
}

window.getSTHTest = function(certPEM) {
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  //Step 1: Parse cert
  var certNew = new rs.X509();
  certNew.readCertPEM(certPEM);
  //Step 2: Parse CTng extension
  for (var i = 0; i < certNew.getExtCRLDistributionPoints().array[1].dpname.full.length; i++) {
    console.log(certNew.getExtCRLDistributionPoints().array[1].dpname.full[i].uri)
  }
}

window.getCert = function(certPEM) {
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  //Step 1: Parse cert
  var certNew = new rs.X509();
  certNew.readCertPEM(certPEM);
  return certNew.getParam()
  //Step 2: Parse CTng extension
  // var ctngExt = certNew.getExtCRLDistributionPoints().array[1].dpname.full[0].uri
  // ctngExt = JSON.parse(ctngExt)
  // return ctngExt
}

window.getCertIssuer = function(certPEM) {
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  var certNew = new rs.X509();
  certNew.readCertPEM(certPEM);
  return certNew.getIssuer()
}

window.certParser = function(publicKeys, certPEM) { 
  //Takes pubK map in for getting E and N of signer
  //Need to require jsrsasign here
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');

  //Step 1: Parse cert
  //let certPEM = "-----BEGIN CERTIFICATE----- MIIJTzCCCDegAwIBAgIRAP6oXqXMXYR8meZ3sp2Ap4EwDQYJKoZIhvcNAQELBQAw GTEXMBUGA1UEAxMObG9jYWxob3N0OjkxMDAwHhcNMjMwMzEzMjE1OTI5WhcNMjQw MzEyMjE1OTI5WjAaMRgwFgYDVQQDEw9UZXN0aW5nIER1bW15IDAwggEiMA0GCSqG SIb3DQEBAQUAA4IBDwAwggEKAoIBAQC1GiaUwPMdj2ELYmQIpiZ/PaNTNaaPuNxW f5GY/PRIeajMtKLT+oWyraqGFJHw65yH135+bjt6ML2JqCnaqJqUjui1ViU7neg+ dNKwRxEhfIBVNgNrbpjmQT3SLfLB3O7NIRnWd6KRAIY6UfZb/dcDx6BhmWtyfhN0 7/6agWuFVom+usBlQlnpkdeg49PiyKIhTTUKXJkNelfHV6Yaf6OVSdKMMNwVvv3o q1z5v164+cbw9fL75ylcDa/syWsFAO1TgRVGKvSs6GtDH2YaxGygQ09GTE334CyD AVcfsUR4vEqevEoLINlCKhdZIfOzJT2okC1yLaLX+E2Wr59cgJmVAgMBAAGjggaP MIIGizAOBgNVHQ8BAf8EBAMCBaAwEwYDVR0lBAwwCgYIKwYBBQUHAwEwDAYDVR0T AQH/BAIwADApBgNVHQ4EIgQgzv3FtXhJkHO29rdyIaa0L8ZNCms+BjufW9An3NiC 9cUwKwYDVR0jBCQwIoAggKtJm74QW076w87V5M8MxmYdlgfn6wpp/4bnx31YAC0w FAYDVR0RBA0wC4IJbG9jYWxob3N0MIIF5gYDVR0fBIIF3TCCBdkwD6ANoAuGCXsi UklEIjoxfTCCBcSgggXAoIIFvIaCBbh7CiAgIlNUSCI6IHsKICAgICJhcHBsaWNh dGlvbiI6ICJDVG5nIiwKICAgICJwZXJpb2QiOiAiMCIsCiAgICAidHlwZSI6ICJo dHRwOi8vY3RuZy51Y29ubi5lZHUvMTAxIiwKICAgICJzaWduZXIiOiAibG9jYWxo b3N0OjkwMDAiLAogICAgInNpZ25lcnMiOiBudWxsLAogICAgInNpZ25hdHVyZSI6 IFsKICAgICAgIntcInNpZ1wiOlwiNmEyOGE2OTQ3Y2Y0M2FjNjcwZTZmZTUyY2Rj NmM5OGRhZTljNTg1YjhiYThlN2RmODk2NTk5MWM3YWU5ZmJhYTU5NWNkMzliNTUx YWRjMDM1ZmE4YmFkMzQ2NWFhZThmYmFmODI0YmVjMDVkMmQ4YzE4YjIzODMzZTM1 ZWUzODNhYTkxZDZjNmM2N2FiZTJhMmE5ZmY5YzdlMmIyZjBiODRiY2YxNWZmN2Jk ZDNlZDg5Mzc5YjBiMzEwYjY1NjZlNGIyYjUwZGI0ODIwYTk2ZTg2NTI1ODUyOWVh NDFkMDE3NTU3Y2Q1NjAyYTRhYTA5NWE1MjFkYWZjMGUwYTQzYjE3NTNiN2FlOGZk ZTY0ZTA3ZTkwMTY3OTYwODI0NmUzYTliNjkxYzNhMDcyYTIyMmI0ZjMxYzJkNmYw OTE0MTljNTg2ZTE3NjYxY2UyMjMwNmUzOTJjNGUwM2I3YWZmNjQxYWFkYzI4MWIw MzdjZDIzMmFkNmE3Y2M1OGM0ZjljY2RkZmYwZGYxMDI3NmQ2YTEwMjhhMjI3MzRj NDQ5YjQzM2Y3ODU3ZjdlNzg3ODJiNzc2NDVhNWM0ZGY4Njc1OGYzYzg1NTczZGM3 NDEzYWY2NmI1NjI0MDQ1MGI2ZmIzN2E2YjVhZGFjNDVlMThhNjA2Yzk2YTZjYmQ1 ZTZlNTlcIixcImlkXCI6XCJsb2NhbGhvc3Q6OTAwMFwifSIsCiAgICAgICIiCiAg ICBdLAogICAgInRpbWVzdGFtcCI6ICIyMDIzLTAzLTEzVDIxOjU5OjMxWiIsCiAg ICAiY3J5cHRvX3NjaGVtZSI6ICJSU0EiLAogICAgInBheWxvYWQiOiBbCiAgICAg ICJsb2NhbGhvc3Q6OTAwMCIsCiAgICAgICJ7XCJTaWduZXJcIjpcImxvY2FsaG9z dDo5MDAwXCIsXCJUaW1lc3RhbXBcIjpcIjIwMjMtMDMtMTNUMjE6NTk6MzFaXCIs XCJSb290SGFzaFwiOlwiXFx1ZmZmZFxcdWZmZmRcXHUwMDEwXFx1ZmZmZCdAR2pc XHVmZmZkKlxcdWZmZmRxeey5o1xcdWZmZmRiXFx1MDAxM1xcdWZmZmRcXG5cXHVm ZmZkXFx1ZmZmZD9cXHVmZmZkXFx1ZmZmZFxcdWZmZmRcXHVmZmZkN1xcdWZmZmRc XHUwMDFkXFx1ZmZmZFwiLFwiVHJlZVNpemVcIjoxMn0iLAogICAgICAiIgogICAg XQogIH0sCiAgIlBPSSI6IHsKICAgICJTaWJsaW5nSGFzaGVzIjogWwogICAgICAi WjdpUFZQdlpRUllXUXVEaWFQeDViWDNjcnJ3T0lrOURwVkJrNisyZ1R2dz0iLAog ICAgICAiYTNKWnNTdGcxeEhhWGZsNlBUN1FKWjM0SUl1N2RBWGp4cjlnTU82VE5h bz0iLAogICAgICAidnFBZEJYTEt2bVZWeE9hYStHQVlsSXVUb3VVVGRpK21SLzdB aGk5NnJHQT0iLAogICAgICAiQ3VTZGk5QXV6NVVjOWQ0MnNsNkErdHJkSXFPUXpz SDBlbWZFRDRxNmFxcz0iCiAgICBdLAogICAgIk5laWdoYm9ySGFzaCI6ICI2Z2th WUl0MXpNNHBhU1dCSTM0cEpkdElXQ29DS3lZQUNFT0Rxa3VTeUNNPSIKICB9Cn0w DQYJKoZIhvcNAQELBQADggEBACUfsrUbzzZki5/JPYrX23fAxpyA8sMdr4TyqNVe jo8rMT78vUS/8UUAwQ2UnEkIbwr8pIJQLNm66Kc5HNJFQySosZ3608FaZ+5UGLw8 /9cXW8Jyzgs8vLDNJaCYH/VSZ79f5AC0xZgLWRfiP48FX/mREsNplBLyg5Cx80hr uOzvFEdwsrklWsFeLIBii/SGcJPaJ2rK4rVGDpr6Us2qldjgbZgDBdn+PJnkjuqQ /7blPm9LDY2if+WFXeJiSHgWSoDBm0A+3EYyZ9cBLtku97DhF7LV6GQwXtnvRAg0 N/37Iw5oylpoqSWKtXJExXW3cC2LBet1w0Lgp/4XhflyodM= -----END CERTIFICATE-----"
  var certNew = new rs.X509();
  certNew.readCertPEM(certPEM);
  console.log(certNew.getParam())
  console.log("X509 CERT: ", certNew.getExtCRLDistributionPoints())
  //Step 2: Parse CTng extension
  var ctngExt = certNew.getExtCRLDistributionPoints().array[1].dpname.full[0].uri
  ctngExt = JSON.parse(ctngExt)
  console.log("crl", ctngExt)
  //Step 3: Decode RSA sig from encoded string
  var sth = ctngExt.STH
  console.log("STH: ", sth)
  var sig = JSON.parse(sth.signature[0])["sig"]
  //RSASigFromString(sth_example.Signature[0]) //convert string to uint8bytes, then convert to hex
  console.log("RSA SIG: ", sig)

  // string to bytes ?? does this work
  var sigBytes = stringToUTF8Bytes(sig)
  console.log("bytes: ", sigBytes)
  // bytes to hex ?? ^^
  var sigHex = bytesToHex(sigBytes)
  console.log("hex: ", sigHex)
  
  //Step 4: Construct message
  let msg = sth.payload.join("") //convert string to uint8bytes
  console.log("MSG: ", msg)
  //Step 5: Obtain the public key for the signer
  let E = publicKeys[sth.signer].E
  let N = publicKeys[sth.signer].N
  let signerPubKey = window.createPublicKeyRSA(BigInt(E), BigInt(N))
  console.log("PUB KEY: ", signerPubKey)
  // //Verify
  let verified = window.verifyRSA(sig, signerPubKey, msg)
  console.log("VERIFIED? ", verified)
}

window.verifyRSA = function(sigValueHex, rsaPublicKey, msg) {
  // Returns a boolean based on whether we can verify a message based on the signature and public key
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  
  var sig = new rs.KJUR.crypto.Signature({"alg": "SHA256withRSA"});
  sig.init(rsaPublicKey);
  sig.updateString(msg)
  var isValid = sig.verify(sigValueHex)
  console.log('Verified msg? ', isValid)
  return isValid
}

window.signRSA = function(msg, rsaPrivateKey) {
  // Returns a signature on a msg from an RSA private key
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  var sig = new rs.KJUR.crypto.Signature({ "alg": "SHA256withRSA" });
  sig.init(rsaPrivateKey); // rsaPrivateKey of RSAKey object
  sig.updateString(msg)
  var sigValueHex = sig.sign()
  return sigValueHex
}

window.createPublicKeyRSA = function(params) {
  // Creates a public key object from E and N
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  var pubKey = rs.KEYUTIL.getKey(params);

  // var pubKey = new rs.RSAKey() //RSAKey();
  // pubKey.setPublic(n.toString(16), e.toString(16));
  // pubKey.isPublic = true;
  return pubKey
}

window.createPrivateKeyRSA = function(n1, e1, d1, p1, q1, dp1, dq1, co1) {
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  var keyObj = rs.KEYUTIL.getKey({n: n1, e: e1, d: d1, p: p1, q: q1, dp: dp1, dq: dq1, co: co1});
  return keyObj
}


window.getCertSignature = function(cert) {
  // Returns the signature on a certificate in hex
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  var c = new rs.X509();
  c.readCertPEM(cert);
  return c.getSignatureValueHex()
}

window.generateKeyPair = function() {
  // Generates an RSA private and public key pair
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  var sig = new rs.KJUR.crypto.Signature({ "alg": "SHA256withRSA" });
  var rsaKeypair = rs.KEYUTIL.generateKeypair("RSA", 2048);

  let rsaPrivateKey = rsaKeypair.prvKeyObj //RSA Object
  let rsaPublicKey = rsaKeypair.pubKeyObj //RSA Object

  return [rsaPublicKey, rsaPrivateKey]
}

// if (alg == "RSA") {
//   var keylen = keylenOrCurve;
//   var prvKey = new RSAKey();
//   prvKey.generate(keylen, '10001');
//   prvKey.isPrivate = true;
//   prvKey.isPublic = true;
  
//   var pubKey = new RSAKey();
//   var hN = prvKey.n.toString(16);
//   var hE = prvKey.e.toString(16);
//   pubKey.setPublic(hN, hE);
//   pubKey.isPrivate = false;
//   pubKey.isPublic = true;
  
//   var result = {};
//   result.prvKeyObj = prvKey;
//   result.pubKeyObj = pubKey;
//   return result;

window.getPublicKeyRSA = function(cert) {
  // Gets the public key from a certificate
  var rs = require('jsrsasign');
  var rsu = require('jsrsasign-util');
  var c = new rs.X509();
  c.readCertPEM(cert);
  return c.getPublicKey()
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
