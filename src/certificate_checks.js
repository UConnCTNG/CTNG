import { SignatureGeneration } from "./sig-gen.js"
class CertificateCheck {
    
    // Verifies signatures of monitor update objects using BLS
    static async verifyUpdate(masterArray, pubKeyMap) {
        let verified = false
        for (let o of masterArray) {
            let aggKey = "";
            if (o.signers.length > 1) {
                // if two or more signers, aggregate keys
                let keys = [];
                for (let s of o.signers) {
                    keys.push(pubKeyMap[s].T)
                }
                aggKey = window.aggregatePublicKeys(keys)
            } else {
                //if one signer, just set aggKey to the signers pubKey
                aggKey = pubKeyMap[o.signers[0]].T
            }

            let verified = await window.verifyBLS(aggKey, o.sig, SignatureGeneration.stringToHex(o.payloadLine)).then((result) => {
                if (result.isValid) {
                    return true
                }
                else {
                    return false
                }  
            })
            if (!verified) {
                break
            }
        }
        return verified
    }

    // Step 1.1: Signature check on cert STHs
    static checkSignatures(sths) {
        //console.log("CHECK SIGS RUNNNING")
        let gettingItem = browser.storage.local.get(["pubK"]);
        return gettingItem.then((data) => {
            let publicKeys = data.pubK
            
            for (let i = 0; i < sths.length; i++) {
                let signer = sths[i].signer
                let sig = sths[i].signature
                let N = publicKeys[signer].N
                let E = publicKeys[signer].E

                let rsaPubKey = window.createPublicKeyRSA({n: BigInt(N).toString(16), e: BigInt(E).toString(16)})
                let verify = window.verifyRSA(sig, rsaPubKey, window.createHash(sths[i].payload.join("")))
                if (verify) {
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
        let gettingItem = browser.storage.local.get(["pubK", "blsPrivateKeys"]);
        gettingItem.then(async (data) => {
            let publicKeys = data.pubK
            let masterArray = [];
            
            if (sths && Array.isArray(sths)) {
                for (let sth of sths) {
                    let type = "sths";
                    let signers = Object.values(sth.signers || []);
                    let sigLine = sth.signature ? sth.signature[0] : "";
                    let sigIndex = sigLine.indexOf("\"sign\":\"");
                    let idIndex = sigLine.indexOf("\", \"ids\"");
                    let sig = sigLine.substring(sigIndex + 8, idIndex);
                    let payloadLine = sth.payload ? sth.payload[0] : "";
                    let subArray = { type, signers, sig, payloadLine };
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
                    let payloadLine = rev.payload ? rev.payload[0] : "";
                    let subArray = { type, signers, sig, payloadLine };
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
                    let payloadLine = acc.payload ? acc.payload[0] : "";
                    let subArray = { type, signers, sig, payloadLine };
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
                    let payloadLine = con.payload ? con.payload[0] : "";
                    let subArray = { type, signers, sig, payloadLine };
                    masterArray.push(subArray);
                }
            };
            masterArray = await SignatureGeneration.signatureGeneration(masterArray, data.blsPrivateKeys)
            this.verifyUpdate(masterArray, publicKeys)
        }, (error) => {
            console.log(`Error: ${error}`);
        });
    }

    
    //Step 2: Check if CA and Loggers are in CONs and ACCs PoM lists
    static checkPOMs(period, certCA) {
        let storageRequest = [`accs${period.toString()}`]
        for (var p = period; p >= 0; p--) {
            storageRequest.push(`cons${p.toString()}`)
        }
        let gettingItem = browser.storage.local.get(storageRequest);
        return gettingItem.then((data) => {   
            
            // These are the only three loggers for now
            var loggers = ["localhost:9000","localhost:9001", "localhost:9002"]
            
            var conLoggerCount = 0
            var accLoggerCount = 0

            let accs = data[Object.keys(data)[0]]
            let cons = []

            for (const [key, value] of Object.entries(data)) {
                if (!key.includes("accs")) {
                    for (let i = 0; i < value.length; i++) {
                        if (!cons.includes(value[i])) {
                            cons.push(value[i])
                        }
                    }
                }
            }
            
            var conPOMs = []
            if (cons != undefined || cons.length > 0) {
                for (var i = 0; i < cons.length; i++) {
                    conPOMs.push(cons[i].payload[0])
                    if (loggers.includes(cons[i].payload[0])) {
                        conLoggerCount += 1;
                    }
                }
            }
            
            var accPOMs = []
            if (accs != undefined || accs.length > 0) {
                for (var i = 0; i < accs.length; i++) {
                    accPOMs.push(accs[i].payload[0])
                    if (loggers.includes(accs[i].payload[0])) {
                        accLoggerCount += 1;
                    }
                }
            }

            var goodLoggers = loggers.length
            for (let i = 0; i < loggers.length; i++) {
                if (conPOMs.includes(loggers[i]) || accPOMs.includes(loggers[i])) {
                    goodLoggers--;
                }
            }

            // console.log("CONPOMS: ", conPOMs)
            // console.log("ACCPOMS: ", accPOMs)
            // console.log("Good loggers: ", goodLoggers)
            // console.log("CA: ", certCA)
            
            if (conPOMs.includes(certCA) || accPOMs.includes(certCA)) {
                //console.log("Bad Certificate (CA in POMs)")
                return false; //fail
            }
            if (goodLoggers < 1) {
                //console.log("No good loggers")
                return false; //fail
            }
            if ((!conPOMs.includes(certCA) && !accPOMs.includes(certCA)) && goodLoggers > 0) {
                //console.log("No POM against CA and at least 1 good logger")
                return true; //success
            }
            else {
                return false; //fail
            }
        }, (error) => {
        console.log(`Error: ${error}`);
        });
      }

    // Double hash function referenced from CTNG Go code repo
    doubleHash(data1, data2) {
        if (data1 < data2) {
            return window.createHash(data1.concat(data2))
        } else {
            return window.createHash(data2.concat(data1))
        }
    }
    
    // Step 3: POI verification. Check if a certificate is in the Tree head given the POI
    static checkPOI(period, cert) {
        //console.log("CERT:", cert)
        console.log("CERT STH:", cert)
        let gettingItem = browser.storage.local.get([`sths${period.toString()}`]);
        gettingItem.then((data) => {
            console.log("STH_FULL:", data)
            let cert = data.rawCert;
            cert = SignatureGeneration.stringToUTF8Bytes(cert)
            console.log("CERT: ", cert)
            let testHash = window.createHash(cert)
            console.log("TEST HASH: ", testHash)
            let poi = data.cert.POI; // object with siblingHashes and neighborHash
            let siblingHashes = poi.SiblingHashes // array of sibling hashes
            console.log("SIB HASHs: ", siblingHashes)
            let neighborHash = poi.NeighborHash // neighbor hash string
            console.log("NEIG HASH: ", neighborHash)
            console.log(Object.keys(data))
            let rootHash = data[Object.keys(data)[2]].payload[1]

            rootHash = rootHash.split("\"")[11] // json string
            // rootHash[11] is \ufffd%\ufffd\ufffd\ufffd[PV\ufffd\u0001?\ufffd3M\u0007$\ufffdS\ufffd\n\ufffdX\ufffd\ufffd\ufffdpn\ufffd\ufffd\u0019_(
            console.log("ROOT HASH STRING: ", rootHash)
            rootHash = SignatureGeneration.stringToUTF8Bytes(rootHash)
            console.log("ROOT HASH BYTES: ", rootHash)
            let n = siblingHashes.length
            siblingHashes[n-1] = neighborHash
            for (let i = n-1; i >= 0; i--) {
                testHash = doubleHash(siblingHashes[i], testHash)
            }
            console.log(testHash)
            console.log(testHash == rootHash)
            return String(testHash) == String(rootHash)

        }, (error) => {
            console.log(`Error: ${error}`);
        });
    }
        
}

export { CertificateCheck };