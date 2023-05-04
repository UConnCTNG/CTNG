// If you're using single file, use global variable instead: `window.nobleBls12381`

// Retrieves the public key from a given secret key
window.getPublicKey = function(key) {
  const bls = require('@noble/bls12-381');
  const publicK = bls.getPublicKey(key);
  return publicK
}

// Main verify function
window.verifyBLS = async function(key, signature, message) {
  const bls = require('@noble/bls12-381');
  const isValid = await bls.verify(signature, message, key);
  return {isValid};
}

// Testing function. For this one we pass in a private key
window.verifyTest = async function(key, signature, message) {
  const bls = require('@noble/bls12-381');
  const publicK = bls.getPublicKey(key);
  console.log({publicK, signature})
  const isValid = await bls.verify(signature, message, publicK);
  console.log({isValid})
  return {isValid};
}

// Takes a message and signs given a private key (in hex format) and returns the signature 
window.signBLS = async function(message, privateKey) {
  const bls = require('@noble/bls12-381');
  const signature = await bls.sign(message, privateKey);
  return signature
}

// Verifies an aggregate signature given an array of public keys, signatures, and a message
window.verifyAggregate = async function(publicKeys, signatures, message) {
  const bls = require('@noble/bls12-381');
  const aggPublicKey = bls.aggregatePublicKeys(publicKeys);
  const aggSignature= bls.aggregateSignatures(signatures);
  const isValid = await bls.verifyBatch(aggSignature, message, aggPublicKey);
  return isValid
}

// Takes an array of keys and aggregates the public keys
window.aggregatePublicKeys = function(keys) {
  const bls = require('@noble/bls12-381');
  return bls.aggregatePublicKeys(keys);
}

// Takes an array of signatures and aggregates the signatures
window.aggregateSignatures = function(sigs) {
  const bls = require('@noble/bls12-381');
  return bls.aggregateSignatures(sigs)
}

// Testing function. Good for REFERENCE!
window.aggTest = async function() {
  const bls = require('@noble/bls12-381');
  const privateKey = '67d53f170b908cabb9eb326c3c337762d59289a8fec79f7bc9254b584b73265c';
  const message = '64726e3da8';
  const publicKey = bls.getPublicKey(privateKey);
  const signature = await bls.sign(message, privateKey);
  const isValid = await bls.verify(signature, message, publicKey);
  console.log({ publicKey, signature, isValid });

  // Sign 1 msg with 3 keys
  const privateKeys = [
    '18f020b98eb798752a50ed0563b079c125b0db5dd0b1060d1c1b47d4a193e1e4',
    'ed69a8c50cf8c9836be3b67c7eeff416612d45ba39a5c099d48fa668bf558c9c',
    '16ae669f3be7a2121e17d0c68c05a8f3d6bef21ec0f2315f1d7aec12484e4cf5'
  ];
  const messages = ['d2', '0d98', '05caf3'];
  const publicKeys = privateKeys.map(bls.getPublicKey);
  const signatures2 = await Promise.all(privateKeys.map(p => bls.sign(message, p)));
  const aggPubKey2 = bls.aggregatePublicKeys(publicKeys);
  console.log("pubKeys: ", publicKeys, aggPubKey2)
  const aggSignature2 = bls.aggregateSignatures(signatures2);
  const isValid2 = await bls.verify(aggSignature2, message, aggPubKey2);
  console.log({ signatures2, aggSignature2, isValid2 });

  // Sign 3 msgs with 3 keys
  const signatures3 = await Promise.all(privateKeys.map((p, i) => bls.sign(messages[i], p)));
  const aggSignature3 = bls.aggregateSignatures(signatures3);
  const isValid3 = await bls.verifyBatch(aggSignature3, messages, publicKeys);
  console.log({ publicKeys, signatures3, aggSignature3, isValid3 });
}


