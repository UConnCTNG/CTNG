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

            let verified = await window.verifyBLS(aggKey, o.sig, SignatureGeneration.stringToHex(o.payloadLine)).then((result) => {
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

    static verifySTHSignature(signer, sig, msg, publicKeys) {
        //console.log(publicKeys)
        //window.certParser(publicKeys)

        //console.log("KP: ", window.generateKeyPair())
        console.log(window.certParser)

        let r = {
            N: "22563152875487429106689137614824193881384868606949072613876077246817826800656408428689569792626425751757103668905790874085904308994272577249393839901594638373026083729614957772225986980106530492907313646509054189167540885492731964740591279266611759417376789694996801929389724110452859432030423682537555131205369172007786755802263956544307456888475975019812997965673565517315450787068915058834733994299513295847005782966188263824821362702920674845139389611962806159634284684262824406319009282688892418677305894992319953420121246560164710149855635006516385593897453237579149710587187652820590321935200528151126709040649",
            E: "65537",
            D: "17979393817486000430880675552115047638243465420460219709697581245106846041330540265368500286560718861620324776862949430358243140952559574006974602151166162621947009637482367818773482430720102261792554443469221003721508272625950858212122898166535940187278454739182721014976571436290640067731583929279014016767966891495290474957665272827533153947827369345269407897819846327054114886847196475630622374431045946594239189202037756038950597644341227755956417983670341774130364384160136492411793528204724235346286755180077669835357912975633106256642095116437401700164277483866615943855875604199348775167696396720610884898029",
            Primes: [
             "163842191580356615008796699053352630924282415581090193480031105786032518223102968277668702181300264151348780871028630229965461816219132669639055861052330505879185111158964205280028159915908810277477926401526628141332962220379066840896823779182436962858068967387419601260165706901255731503435907049516642204823",
             "137712714032034303956441171527196376373623462648291637551340957761049401884804193205245240549221242599920377567002530067201317315914895612834156675755789234913177610660054496594737926136386472810344502029378809682214905891897416191758478277370177970149235227429605966468846056514039592477504644618476666541663"
            ],
            Precomputed: {
             Dp: "5922488851394858186304520805917151878475136831280080997820981882098830213017546299797017798609950497803458533095302272224669713942095690897888571872880525022930398528092317352158120006115445802330671340543762791504307299694493329662397966536203872087687342779510765451353167823505421791226935376967284516887",
             Dq: "93486712044878559943574892369882154887506413983284174659492488377391212442665037394164529228296276657009896668384920925428179614340810623235601728861178617594446982594043434296655176981061601466838990116835730087763265989143782082965877268721473639195255737497034796347085784431841882742941874652120586759213",
             Qinv: "61804676207706357139426867512084024740518558148942413772335479689751168344447374052236887971359865645055333751843182941477806106224939710774215159753680350852419103765040495534751725519770255458342934222026944725244841814313246965504385514832761067883289207117157112052646515318245276753632473575314527278185",
             "CRTValues": []
            }
        }
        let n = BigInt(r.N).toString(16) //SignatureGeneration.stringToHex(r.N)
        let e = BigInt(r.E).toString(16) //SignatureGeneration.stringToHex(r.E)
        let d = BigInt(r.D).toString(16)
        let p = BigInt(r.Primes[0]).toString(16)
        let q = BigInt(r.Primes[1]).toString(16)
        let dp = BigInt(r.Precomputed["Dp"]).toString(16)
        let dq = BigInt(r.Precomputed["Dq"]).toString(16)
        let co = BigInt(r.Precomputed["Qinv"]).toString(16)
        var privK = window.createPrivateKeyRSA(n, e, d, p, q, dp, dq, co)
        console.log("$$$$", privK)
        var message = "Jie"
        var sigtest = window.signRSA(window.createHash(message), privK)
        console.log(sigtest)
        let N = publicKeys[signer].N
        let E = publicKeys[signer].E

        
        console.log({N, E, signer})
        let pubK = window.createPublicKeyRSA({n: BigInt(N).toString(16), e: BigInt(E).toString(16)})
        console.log("pubby", pubK)
        let verify = window.verifyRSA(sigtest, pubK, window.createHash("Jie"))
        console.log("VERIFIED? ", verify)

        // let N = publicKeys[signer].N
        // let E = publicKeys[signer].E

        // //Test verify STH
        // // Try if the RSA private key pair works. take the private key valeus in the config and then compare with public key
        // // verification function might not be working because of the hashing

        // let keyPair = window.generateKeyPair()
        // let pubK = keyPair[0]
        // let privK = keyPair[1]
        
        // let pubK2 = window.createPublicKeyRSA(BigInt(E), BigInt(N))
        // console.log("PUB", pubK)
        // console.log("PRIV ", privK)
        // console.log("SIG: ", sig, "\n")
        // console.log("utf8: ", SignatureGeneration.stringToUTF8Bytes(msg))
        // console.log("MSG: ", window.createHash(SignatureGeneration.stringToUTF8Bytes(msg)))


        // let hashedMsg = window.createHash(msg)
        // let signed = window.signRSA(hashedMsg, privK)
        // let ver = window.verifyRSA(signed, pubK2, hashedMsg)
        // console.log("VER??? ", ver)

        // //sig = window.signRSA(window.createHash(SignatureGeneration.stringToHex(msg)), privK)
        // //console.log("SIGNER, SIG, MSG: ", signer, sig, msg)

        // let verify = window.verifyRSA(sig, pubK, window.createHash(SignatureGeneration.stringToUTF8Bytes(msg)))
        // console.log("VERIFIED? ", verify)
        //msg = SignatureGeneration.stringToUTF8Bytes(msg)
        //console.log("MSG AS BYTE ARRAY: ", msg)
        //console.log("N AND E: ", N.toString(), E.toString())
        
        //console.log("LOGGER PUBKEY: ", logPub)

        // let verified = window.verifyRSA(sig, logPub, rawCert)
        // console.log("VERIFIED? ", verified)
        // let verified = window.verifyRSA(sig, N, E).then((result) => {
        //     return result.isValid
        // })
        //return verified
    }

    // Step 1.1: Signature check on cert and on STHs
    static checkSignatures() {
        console.log("CHECK SIGS RUNNNING")
        let gettingItem = browser.storage.local.get(["cert", "pubK"]);
        gettingItem.then((data) => {
            let cert = data.cert
            let publicKeys = data.pubK

            //TEST STH VERIFY
            let STH = data.cert.STH
            console.log("STH: ", STH)
            let sthSig = "6a28a6947cf43ac670e6fe52cdc6c98dae9c585b8ba8e7df8965991c7ae9fbaa595cd39b551adc035fa8bad3465aae8fbaf824bec05d2d8c18b23833e35ee383aa91d6c6c67abe2a2a9ff9c7e2b2f0b84bcf15ff7bdd3ed89379b0b310b6566e4b2b50db4820a96e865258529ea41d017557cd5602a4aa095a521dafc0e0a43b1753b7ae8fde64e07e901679608246e3a9b691c3a072a222b4f31c2d6f091419c586e17661ce22306e392c4e03b7aff641aadc281b037cd232ad6a7cc58c4f9ccddff0df10276d6a1028a22734c449b433f7857f7e78782b77645a5c4df86758f3c85573dc7413af66b56240450b6fb37a6b5adac45e18a606c96a6cbd5e6e59"
            let payloadString = STH.payload.join("") //.replace(/"/g, '\\"');
            console.log("PS: ", payloadString)
            let signer = STH.signer
            this.verifySTHSignature(signer, sthSig, payloadString, publicKeys)

            //Second part: verify signatures of STHs passed in with cert with logger's public key
            // for (let i = 0; i < cert.STH.length; i++) {
            //     let signer = cert.STH[i].signer
            //     let sigLine = cert.STH.signature[0]
            //     let sigIndex = sigLine.indexOf("\"sign\":\"");
            //     let idIndex = sigLine.indexOf("\", \"ids\"");
            //     let sig = sigLine.substring(sigIndex+8, idIndex);
                
            //     if (verifySTHSignature(signer, sig, publicKeys)) {
            //         continue
            //     } else {
            //         return 0 //Fail
            //     }
            // }

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
    static checkPOMs(period) {
        let gettingItem = browser.storage.local.get([`cons${period.toString()}`, `accs${period.toString()}`, "cert"]);
        gettingItem.then((data) =>
        {
            var certCA = data.cert["Issuer"]
            
            // These are the only three loggers for now
            var loggers = ["localhost:9000","localhost:9001", "localhost:9002"]
            
            var conLoggerCount = 0
            var accLoggerCount = 0

            let cons  = data[Object.keys(data)[0]]
            let accs = data[Object.keys(data)[1]]
            
            var conPOMs = []
            if (cons != undefined) {
                for (var i = 0; i < cons.length; i++) {
                    conPOMs.push(cons[i].payload[0])
                    if (loggers.includes(cons[i].payload[0])) {
                        conLoggerCount += 1;
                    }
                }
            }
            
            var accPOMs = []
            if (accs != undefined) {
                for (var i = 0; i < accs.length; i++) {
                    accPOMs.push(accs[i].payload[0])
                    if (loggers.includes(accs[i].payload[0])) {
                        accLoggerCount += 1;
                    }
                }
            }
            
            var loggerCountCheck = (conLoggerCount == 0 && accLoggerCount == 0)
            
            if (conPOMs.length == 0 && accPOMs.length == 0) {
                console.log("Pass. 1")
                return true; //success
            }
            else if ((!conPOMs.includes(certCA) && !accPOMs.includes(certCA)) && loggerCountCheck) {
                console.log("Pass. 2")
                return true; //success
            }
            else if ((conPOMs.includes(certCA) || accPOMs.includes(certCA)) && loggerCountCheck) {
                console.log("Fail. 3")
                return false; //fail
            }
            else {
                console.log("Fail. 4")
                return false; //fail
            }
        }
        , (error) => {
        console.log(`Error: ${error}`);
        });
      }


    // Step 3: POI verification. Check if a certificate is in the Tree head given the POI
    
    // Reference from Jie's Code:
    // func doubleHash(data1 []byte, data2 []byte) []byte {
    //     if data1[0] < data2[0] {
    //         return hash(append(data1, data2...))
    //     } else {
    //         return hash(append(data2, data1...))
    //     }
    // }
    // func VerifyPOI(sth STH, poi CA.ProofOfInclusion, cert x509.Certificate) bool {
    //     certBytes, _ := json.Marshal(cert)
    //     testHash := hash(certBytes)
    //     n := len(poi.SiblingHashes)
    //     poi.SiblingHashes[n-1] = poi.NeighborHash
    //     for i := n - 1; i >= 0; i-- {
    //         testHash = doubleHash(poi.SiblingHashes[i], testHash)
    //     }
    //     return string(testHash) == string(sth.RootHash)
    // }
    
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
            return window.createHash(data1.concat(data2))
        } else {
            return window.createHash(data2.concat(data1))
        }
    }

    static verifyPOI(period) {
        let gettingItem = browser.storage.local.get(["rawCert", "cert", `sth${period.toString()}`]);
        gettingItem.then((data) => {
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