import { SignatureGeneration } from "./sig-gen.js"
class CertificateCheck {

    static privateKeyToPEM(privateKey) {
        const b64 = btoa(String.fromCharCode.apply(null, privateKey));
        let pem = "-----BEGIN PRIVATE KEY-----\n";
        for (let i = 0; i < b64.length; i += 64) {
            pem += b64.substr(i, 64) + "\n";
        }
        pem += "-----END PRIVATE KEY-----";
        return pem;
    }
    
    static async verifyUpdate(masterArray, pubKeyMap) {
        // pubK = { "localhost:9000" : pubK1... ,
        //          "localhost:9001" : pubK2...,
        // }
        // aggregate the pubK using https://github.com/paulmillr/noble-bls12-381
        // get signature from struct object (payload)
        // get message from struct object (payload)
        // return bls.verify(aggPubK, sig, message)
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

            let verified = await window.verify(aggKey, o.sig, SignatureGeneration.stringToHex(o.payloadLine)).then((result) => {
                if (result.isValid) {
                    //console.log(`${o.type} verified!`)
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
    
    static verifyCertSignature(issuer, sig, rawCert, publicKeys) {
        console.log(issuer, sig)
        let N = publicKeys[issuer].N
        let E = publicKeys[issuer].E
        console.log(issuer)
        var hashedCert = window.createHash(rawCert)
        var privK = "-----BEGIN PRIVATE KEY----- MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDJdSJ/fn/YXBlq zVHUBbgUQJRbeyIjaAKI2DWXic+jBcAInZgmj7bdxIASXhe6SBHKGI96eHejg8Re ISF14WsqScCZlJS7m1+k3zMDxSMJzDV7EBuXUjmeCXNbI1wvzB4kCm4LL4UOcPCz FAl07YcDs/Mam97CPyuwk+p0euDkUzdcfgoJbygz3+d/NIW9VVQzyCTObBDIhGz2 iUTtm8dW3IKXdVRkpaIxnkZZVlAT2fKsF3ccFAs49kZycPqjXbhc4StiEmgdu5PR IaQE30IgzryzZjRMe4FAtWLExIecpl5DdDjkZP1mxn6Eo9hqo65mSGt4XfFU/ywQ wkNFd141AgMBAAECggEAfr+MuexL4UNo1nJhpmUGwO80qC3bd61L0u89IJ+bHLVU cdc9UB2hbvvfnC7I/PG1B5LWSraahy0zEgoENFdkBlIqtDXwMez6iw/G1/tjJRnv GAM1aMpZ592IT3H64TOqTwCk5bK7Iy/ZsMHNhVygUqsYK8ifqVT3VvxpSWm6Lswx kgFxhk8kSeY6GQYDH6h7jldXvctMMVxf+Ntvpg9TI1pPZK9wmGCwqyS0yFqd5yBb uNT8Jj1Y6+jKbjAUtwokCvhEiO7gQD1YVul1PWzgiMZSxub+cuQKoO0efZHoq5Wp yEOGHrAMDTmQHO/wHjDvAy6McuSlhr06BzDDswD6AQKBgQDPH/zZpZ2r+7K0HaIF LXXBj1+7yS1SFHe6asDyHe0T9hEwMF13HEtLWwzlfrOyPCF/g3lyLd0k7eJhwzK9 Ejs6+YSaNhzVWYjKbI7J/lWyddFeevL0O8KB/+oQuPmSvzrRb8ub8bD7Cu3X7PgY mlljhteft2uK8PzA85DJVARjtQKBgQD4/sp3UAChOPlqJVRQ1Qov/QSU0kpsZdRz lT3uIqrAM25nv3rr0XGSUu/GTwgs8lwto7rTznkQV7hh4aj/kSEhLVHhADq635S2 LoqRhAs6fOKpTl/PE0vSTYrF6cq7Q7YVEbY+rNFiQWM2bj8l05+4yIVnlMJxJdZ+ bsNt4zCggQKBgFCMwRmnhdUPkqTnbU4UKtp2tqViDIUCPrm5sIW4S63aoT6bYI3k 7AdHRpGtn5auOdzMNZvI6FrnRIX+kqnjADPkO8R5TOdP5ZnLdBBsH8nCdgUHTZrb 7r3913pfZXfDdM1ka8uex9QpoOu7VZTD2gWRuCN+Ao3LQJCNaH5TdU2NAoGBAO1x C2H7yJ311uKB9oWeorhgb537az0zXgVarFQKewoOAZqt3mpCsCr5K+3QL9uswnpD SEXy/z+2Zv3wU1hi7VTWAt6teVP7IbUZbMqXQJ3lub/6HSM7I3LIvy08ZTduupQc 782Uv5cTA6lEOLO5uvZbQdwk38dGbeTjezmvDRABAoGAZ6FKpWYfqARbIoXh1rAH XTrOooEGfXFl+BTeflg30TYtrIVYtMuBgH+8neY8xSudj7qFhcd0tkeDVKVmmavL i3tkq+cyq0AXtwsH4Fgct7wYvo8JyAW/hK3SJarUfSHEjExf0qX4mcHO2/oUhlWY qZAeQol9ITHPERJBau6LWZM= -----END PRIVATE KEY-----"
        //var digSig = window.signRSA(privK, hashedCert)
        //console.log("DIGSIG:", digSig, hashedCert)
        // let rsaPrivateKey = {
        //     "N": "28289144454339349066815611011072919704815780568116807124033317074501747158092238108625845484294458170684635180767779471186812062223165047836555517729612627445913894917126907141539096933580451852414255077776299604189818614081401604468933933073559526635896880884676597663249511990732549694181080063376692648852496681384390051520215961439588026093668116084970297892897465409342405204800861401311876470541382798878546753983480412864678228738921800842175374768234701021535062817797558477630046686713237936988594016657525936313108624708966744718176337912405211276765633214282274543820269348549015966681790731369304710454687",
        //     "E": "65537",
        //     "D": "24286871732355821524396605788150477244784776441782384802992730597934614093566378949018618431936580694471382554067154614131345357294145008415456859561112874914084338579918907339650842866898151021195478309215916157738989339171613916954461872596912076631044112531491047309500492731717455918688656327965723360661409567093078590271537464668955146101384814196414274491562078875534696277994171275660677462197388750839372144151280860156202741744143705002332400462779772245556214518757183846260776821913408860023474747322470477199150095505019512817170312401070658636096928247054933113372758347645651936577518923998992335837993",
        //     "Primes": [
        //      "168829081367707509553610792215063341400730245924170434642310270987810659274133958712980948433651300383158806671355192199737658839933012242725264269462535985696766592712159409090780105261167771237010138586551620576620502634143397900641341292327808744675921718937648918217582899519091360328300070007358223913589",
        //      "167560850448069228368725445039124486090249644424207839424550619276706160724381350126242561296743023177518362112756274925012389223863115539148705911032043580990386673573987751870066713368197839094541942315660218798770183585310082594680810823774767589694183431233026026364963818093230552012766272805615539881283"
        //     ],
        //     "Precomputed": {
        //      "Dp": "61146025532812082438386037871992057486423441983247775099102439723616793697161048629191384897403714938045034639231073165585441357166943537136684204342016786799799378131678528681184011756398343196693053534497906007395276721913235158301766588563603283086312738158658997555770750919101462208409455142814819152737",
        //      "Dq": "2937690421667631160957406294916673551088649792383154668337102118634288702142517528953914627309119026366306026634679034573435390973323767558506844862838062080320342523101636127663863980042713537690597551317478544940826417741448111773322728176712512940150094793578389372314012344006010410343293825680947484987",
        //      "Qinv": "101130578022651400459186069529070516823791774043672720894797485239741146271197829800949570239710662804910275330647237538856543116531130488011834112972917410435879460797294785201656729324181672068916979233275687023287092742979781355544651976994959744899470147903577020715916848679095875613837128312314719352511",
        //      "CRTValues": []
        //     }
        // }
        
        //let sigAndKeyObject = window.signRSA(window.createHash(rawCert), window.getPublicKeyRSA(rawCert))
        //console.log(sigAndKeyObject)
        console.log(window.getPublicKeyRSA(rawCert))
        console.log("HASHED SHIT: ", window.createHash(rawCert))
        let caPub = window.createPublicKeyRSA(BigInt(E), BigInt(N))
        console.log(caPub)
        sig = window.getCertSignature(rawCert)
        console.log(sig)

        let verified = window.verifyRSA(sig, caPub, window.createHash(rawCert))
        console.log("VERIFIED? ", verified)
        return verified
    }

    static verifySTHSignature(signer, sig, publicKeys) {
        let N = publicKeys[signer].N
        let E = publicKeys[signer].E
        let verified = window.verifyRSA(sig, N, E).then((result) => {
            return result.isValid
        })
        return verified
    }

    // Step 1.1: Signature check on cert and on STHs
    static checkSignatures() {
        console.log("CHECK SIGS RUNNNING")
        let gettingItem = browser.storage.local.get(["cert", "pubK", "rawCert"]);
        gettingItem.then((data) => {
            let cert = data.cert
            let rawCert = data.rawCert
            let publicKeys = data.pubK
            console.log(cert)
            rawCert.trim()

            let sig = cert.Signature.replace(/:/g,''); //window.convertRSASignature(cert.Signature)

            //First part: checking signature of cert with CA's public key
            if (!this.verifyCertSignature(cert.Issuer, sig, rawCert, publicKeys)) {
                return 0 //Fail
            }

            //Second part: verify signatures of STHs passed in with cert with logger's public key
            for (let i = 0; i < cert.STH.length; i++) {
                let signer = cert.STH[i].signer
                let sigLine = cert.STH.signature[0]
                let sigIndex = sigLine.indexOf("\"sign\":\"");
                let idIndex = sigLine.indexOf("\", \"ids\"");
                let sig = sigLine.substring(sigIndex+8, idIndex);
                
                if (verifySTHSignature(signer, sig, publicKeys)) {
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
        let gettingItem = browser.storage.local.get(["pubK", "privK"]);
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
            masterArray = await SignatureGeneration.signatureGeneration(masterArray, data.privK)
            this.verifyUpdate(masterArray, publicKeys)
        }, (error) => {
            console.log(`Error: ${error}`);
        });
    }

    
    //Step 2: Check if CA and Loggers are in CONs and ACCs PoM lists
    static checkPOMs(p) {
        let period = String(p)
        let gettingItem = browser.storage.local.get([`cons${period.toString()}`, `accs${period.toString()}`, "cert"]);
        gettingItem.then((data) =>
        {
            var certCA = data.cert["Issuer"]
            var loggers = ["localhost:9000","localhost:9001", "localhost:9002"]
            
            var conLoggerCount = 0
            var accLoggerCount = 0

            let cons  = data[Object.keys(data)[0]]
            let accs = data[Object.keys(data)[1]]
            
            var conPOMs = []
            for (var i = 0; i < cons.length; i++) {
                conPOMs.push(cons[i].payload[0])
                if (loggers.includes(cons[i].payload[0])) {
                conLoggerCount += 1;
                }
            }
            
            var accPOMs = []
            for (var i = 0; i < accs.length; i++) {
                accPOMs.push(accs[i].payload[0])
                if (loggers.includes(accs[i].payload[0])) {
                accLoggerCount += 1;
                }
            }
            
            var loggerCountCheck = (conLoggerCount == 0 && accLoggerCount == 0)
            
            if (conPOMs.length == 0 && accPOMs.length == 0) {
                console.log("Pass. 1")
                return 1; //success
            }
            else if ((!conPOMs.includes(certCA) && !accPOMs.includes(certCA)) && loggerCountCheck) {
                console.log("Pass. 2")
                return 1; //success
            }
            else if ((conPOMs.includes(certCA) || accPOMs.includes(certCA)) && loggerCountCheck) {
                console.log("Fail. 3")
                return 0; //fail
            }
            else {
                console.log("Fail. 4")
                return 0; //fail
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
            rootHash = utf8Encode.encode(rootHash);

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