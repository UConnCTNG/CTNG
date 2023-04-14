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
    
    static verifySTHSignature() {
    
    }
    // Step 1.1: Signature check on cert and on STHs
    static checkSignatures() {
        let gettingItem = browser.storage.local.get(["cert", "pubK"]);
        gettingItem.then((data) => {
            let cert = data.cert
            let publicKeys = data.pubK

            //First part: checking signature of cert with CA's public key
            

            //Second part: verify signatures of STHs passed in with cert with logger's public key
            for (let i = 0; i < cert.STH.length; i++) {
                let signer = cert.STH[i].signer
                let sig = cert.STH.signature[0] //have to parse this
                
                if (verifySTHSignature(sig, publicKeys.signer)) {
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

        // Parse STHs
        if (sths && Array.isArray(sths)) {
            for (let sth of sths) {
                let type = "sths";
                let signers = Object.values(sth.signers || []);
                let sig = sth.signature ? sth.signature[0] : "";
                let subArray = { type, signers, sig };
                masterArray.push(subArray);
            }
        }

        // Parse REVs
        if (revs && Array.isArray(revs)) {
            for (let rev of revs) {
                let type = "revs";
                let signers = Object.values(rev.signers || []);
                let sig = rev.signature ? rev.signature[0] : "";
                let subArray = { type, signers, sig };
                masterArray.push(subArray);
            }
        }

        // Parse ACCs
        if (accs && Array.isArray(accs)) {
            for (let acc of accs) {
                let type = "accs";
                let signers = Object.values(acc.signers || []);
                let sig = acc.signature ? acc.signature[0] : "";
                let subArray = { type, signers, sig };
                masterArray.push(subArray);
            }
        }

        // Parse CONs
        if (cons && Array.isArray(cons)) {
            for (let con of cons) {
                let type = "cons";
                let signers = Object.values(con.signers || []);
                let sig = con.signature ? con.signature[0] : "";
                let subArray = { type, signers, sig };
                masterArray.push(subArray);
            }
        }
        console.log(masterArray);
        //return masterArray;
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
    verifyPOI() {
        
        let gettingItem = browser.storage.local.get(["cert"]);
        gettingItem.then((data) => {
            let cert = data.cert;
            let poi = data.POI; // object with siblingHashes and neighborHash
            let siblingHashes = poi.SiblingHashes // array of sibling hashes
            let neighborHash = poi.NeighborHash // neighbor hash string
            let rootHash = data.STH.payload[1] // need to parse for rootHash

            let testHash = hash(cert) // TODO: define hash function
            let n = siblingHashes.length
            siblingHashes[n-1] = neighborHash
            for (let i = n-1; i >= 0; i--) {
                testHash = doubleHash(siblingHashes[i], testHash) // TODO: define doubleHash function
            }
            return String(testHash) == String(rootHash)

        }, (error) => {
            console.log(`Error: ${error}`);
        });

        // Jie's go code:
        // n := len(poi.SiblingHashes)
        // poi.SiblingHashes[n-1] = poi.NeighborHash
        // for i := n - 1; i >= 0; i-- {
        //     testHash = doubleHash(poi.SiblingHashes[i], testHash)
        // }
        // return string(testHash) == string(sth.RootHash)
    }
        
}

export { CertificateCheck };