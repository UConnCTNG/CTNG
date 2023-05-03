class SignatureGeneration {
    
    // Takes a hex string and converts it to Uint8 byte array
    static hexToUint8Array(hex) {
      if (hex.length % 2 !== 0) {
          throw new Error('Invalid hex string length');
      }
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
          bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
      }
      return bytes;
    }
    
    // Takes a Uint8 byte array and converts to hex format
    static bytesToHex(bytes) {
      return Array.from(
      bytes,
      byte => byte.toString(16).padStart(2, "0")
      ).join("");
    }
    
    // Takes a string and converts it to Uint8 format like [120, 80, ...]
    static stringToUTF8Bytes(string) {
      return new TextEncoder().encode(string);
    }

    // Takes a string like "Hello" and converts it into hex form like "a5fb"
    static stringToHex(inputString) {
      let hexString = '';
      for (let i = 0; i < inputString.length; i++) {
          let hexCode = inputString.charCodeAt(i).toString(16);
          hexString += hexCode;
      }
      return hexString;
    }

    // Test function for verifying locally generated signatures for STHs, REVs, and POMs from monitor update
    verifyGeneratedSignatures(signers, sig, msg) {
      let gettingItem = browser.storage.local.get(["pubK"]);
      gettingItem.then(async (data) => {
          let keys = [] //public keys
          for (let s of signers) {
          let key = data.pubK[s].T
          keys.push(this.hexToUint8Array(key))
          }
          console.log("PUBKEYS", keys)
          let aggKey = window.aggregatePublicKeys(keys)
          console.log("aggpubkey", aggKey, sig, msg)
          let b = await window.verify(aggKey, sig, msg)
          console.log("Result of VERIFY: ")
          console.log(b)
          return 1;
      }, (error) => {
          console.log(`Error: ${error}`);
      });
    }

    // Takes an array of signers, a msg(payload), and private key map
    // creates a new signature by signing the payload(msg) with the signers private keys and returns it
    static async generateSignature(signers, msg, privK) {
      // Returns a uint8 array that is the *aggregated* signature
      msg = this.stringToHex(msg)
      let sigs = []
      for (let s of signers) {
          let key = privK[s]
          //console.log("k", key, msg)
          let n = await window.signBLS(msg, key)
          sigs.push(n) //has to return uint8 signature
      }
      let aggSig = window.aggregateSignatures(sigs) //has to be uint8
      return aggSig;
    }

    // Takes a masterArray from checkUpdate (in cert_checks)
    // changes old sig to new generated sig for every object
    static async signatureGeneration(masterArray, privateKeys) {
      for (let m of masterArray) {
          let newSig = await this.generateSignature(m.signers, m.payloadLine, privateKeys);
          m.sig = newSig;
      }
      return masterArray;
    }
    
    // Takes a signer and an sth's payload
    // creates a new signature by signing the payload(msg) with the signer's private key and returns it
    static async generateRSASignature(signer, payload, rsaPrivKey) {
      // Returns a uint8 array that is the signature
        var msg = payload.join("")
        let sig = window.signRSA(window.createHash(msg), rsaPrivKey)
        return sig;
    }
    
};

export { SignatureGeneration };