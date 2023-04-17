class CertificateCheck {

    static verifyBLSSignature() {
        // pubK = { "localhost:9000" : pubK1... ,
        //          "localhost:9001" : pubK2...,
        // }
        // aggregate the pubK using https://github.com/paulmillr/noble-bls12-381
        // get signature from struct object (payload)
        // get message from struct object (payload)
        // return bls.verify(aggPubK, sig, message)
    }
    
    static verifyCertSignature(issuer, sig, publicKeys) {
    
    }

    static verifySTHSignature(sig, signer, publicKeys) {
    
    }

    static verifyUpdate(objectArray) {
        //for o in objectArray {
        //  verifyBLSSignature(...)
        //}
    }

    // Step 1.1: Signature check on cert and on STHs
    static checkSignatures() {
        let gettingItem = browser.storage.local.get(["cert", "pubK"]);
        gettingItem.then((data) => {
            let cert = data.cert
            let publicKeys = data.pubK

            //First part: checking signature of cert with CA's public key
            if (!verifyCertSignature(cert.Issuer, cert.Signature, publicKeys)) {
                return 0 //Fail
            }

            //Second part: verify signatures of STHs passed in with cert with logger's public key
            for (let i = 0; i < cert.STH.length; i++) {
                let signer = cert.STH[i].signer
                let sig = cert.STH.signature[0] //have to parse this
                
                if (verifySTHSignature(sig, signer, publicKeys)) {
                    continue
                } else {
                    return 0 //Fail
                }
            }

            //if the for loop gets done and no errors, all sth sigs were verified
            return 1
        }, (error) => {
            console.log(`Error: ${error}`);
        });
    }
    
    //Step 1.2: Signature Verification on monitor update
    static checkUpdate(period, sths, revs, accs, cons) {
        let masterArray = [];

        if (sths && Array.isArray(sths)) {
            for (let sth of sths) {
                let type = "sths";
                let signers = Object.values(sth.signers || []);
                let sigLine = sth.signature ? sth.signature[0] : "";
                let sigIndex = sigLine.indexOf("\"sign\":\"");
                let idIndex = sigLine.indexOf("\", \"ids\"");
                let sig = sigLine.substring(sigIndex+8, idIndex);
                let subArray = { type, signers, sig };
                masterArray.push(subArray);
            }
        };
        
        // Parse REVs
        if (revs && Array.isArray(revs)) {
            for (let rev of revs) {
                let type = "revs";
                let signers = Object.values(rev.signers || []);
                let sigLine = rev.signature ? rev.signature[0] : "";
                let sigIndex = sigLine.indexOf("\"sign\":\"");
                let idIndex = sigLine.indexOf("\", \"ids\"");
                let sig = sigLine.substring(sigIndex+8, idIndex);
                let subArray = { type, signers, sig };
                masterArray.push(subArray);
            }
        };
        
        // Parse ACCs
        if (accs && Array.isArray(accs)) {
            for (let acc of accs) {
                let type = "accs";
                let signers = Object.values(acc.signers || []);
                let sigLine = acc.signature ? acc.signature[0] : "";
                let sigIndex = sigLine.indexOf("\"sign\":\"");
                let idIndex = sigLine.indexOf("\", \"ids\"");
                let sig = sigLine.substring(sigIndex+8, idIndex);
                let subArray = { type, signers, sig };
                masterArray.push(subArray);
            }
        };
        
        // Parse CONs
        if (cons && Array.isArray(cons)) {
            for (let con of cons) {
                let type = "cons";
                let signers = Object.values(con.signers || []);
                let sigLine = con.signature ? con.signature[0] : "";
                let sigIndex = sigLine.indexOf("\"sign\":\"");
                let idIndex = sigLine.indexOf("\", \"ids\"");
                let sig = sigLine.substring(sigIndex+8, idIndex);
                let subArray = { type, signers, sig };
                masterArray.push(subArray);
            }
        };
        console.log(masterArray);
        this.verifyUpdate(masterArray)
    }

    
    //Step 2: Check if CA and Loggers are in CONs and ACCs PoM lists
    static checkPOMs() {
        let gettingItem = browser.storage.local.get(["cons1", "accs1", "cert"]);
        gettingItem.then((data) =>
        {
            var certCA = data.cert.Issuer
            var loggers = ["localhost:9000","localhost:9001", "localhost:9002"]
            
            var conLoggerCount = 0
            var accLoggerCount = 0
            
            var conPOMs = []
            for (var i = 0; i < data.cons1.length; i++) {
                conPOMs.push(data.cons1[i].payload[0])
                if (loggers.includes(data.cons1[i].payload[0])) {
                conLoggerCount += 1;
                }
            }
            
            var accPOMs = []
            for (var i = 0; i < data.accs1.length; i++) {
                accPOMs.push(data.accs1[i].payload[0])
                if (loggers.includes(data.accs1[i].payload[0])) {
                accLoggerCount += 1;
                }
            }
            
            var loggerCountCheck = (conLoggerCount == 0 && accLoggerCount == 0)
            
            if (conPOMs.length == 0 && accPOMs.length == 0) {
                //return 1; //success
                console.log("Pass.")
            }
            else if ((!conPOMs.includes(certCA) && !accPOMs.includes(certCA)) && loggerCountCheck) {
                //return 1; //success
                console.log("Pass.")
            }
            else if ((conPOMs.includes(certCA) || accPOMs.includes(certCA)) && loggerCountCheck) {
                //return 0; //fail
                console.log("Fail.")
            }
            else {
                console.log("Fail.")
            }
        }
        , (error) => {
        console.log(`Error: ${error}`);
        });
      }


    // Step 3: POI verification. Check if a certificate is in the Tree head given the POI
    hash(cert) {
        // Jie's hash function go code:
        // func hash(data []byte) []byte {
        //     hash := sha256.Sum256(data)
        //     return hash[:]
        // }
        let h = window.createHash(cert)
        return h
    }

    doubleHash(data1, data2) {
        // Jie's doubleHash function go code:
        // func doubleHash(data1 []byte, data2 []byte) []byte {
        //     if data1[0] < data2[0] {
        //         return hash(append(data1, data2...))
        //     } else {
        //         return hash(append(data2, data1...))
        //     }
        // }
        if (data1 < data2) {
            return this.hash(data1.concat(data2))
        } else {
            return this.hash(data2.concat(data1))
        }
    }

    verifyPOI(period) {
        let gettingItem = browser.storage.local.get(["cert", `sth${period}`]);
        gettingItem.then((data) => {
            let cert = data.cert;
            let poi = data.cert.POI; // object with siblingHashes and neighborHash
            let siblingHashes = poi.SiblingHashes // array of sibling hashes
            let neighborHash = poi.NeighborHash // neighbor hash string
            let rootHash = Object.keys(data)[1].payload[1]
            rootHash = rootHash.split("\"")[11] // json string
            // rootHash[11] is \ufffd%\ufffd\ufffd\ufffd[PV\ufffd\u0001?\ufffd3M\u0007$\ufffdS\ufffd\n\ufffdX\ufffd\ufffd\ufffdpn\ufffd\ufffd\u0019_(
            let utf8Encode = new TextEncoder();
            let encode = utf8Encode.encode(rootHash);
            rootHash = encode.join('') // byte array

            let testHash = hash(cert)
            let n = siblingHashes.length
            siblingHashes[n-1] = neighborHash
            for (let i = n-1; i >= 0; i--) {
                testHash = doubleHash(siblingHashes[i], testHash)
            }
            return String(testHash) == String(rootHash)

        }, (error) => {
            console.log(`Error: ${error}`);
        });

    }
        
}

export { CertificateCheck };