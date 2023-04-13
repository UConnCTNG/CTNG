class CertificateCheck {

    //Step 1: Signature Verification on monitor update

    //Step 2: Check if CA and Loggers are in CONs and ACCs PoM lists
    // onGot(data) {
    //     var certCA = data.cert.Issuer
    //     var loggers = ["localhost:9000","localhost:9001", "localhost:9002"]
      
    //     var conLoggerCount = 0
    //     var accLoggerCount = 0
      
    //     var conPOMs = []
    //     for (var i = 0; i < data.cons1.length; i++) {
    //       conPOMs.push(data.cons1[i].payload[0])
    //       if (loggers.includes(data.cons1[i].payload[0])) {
    //         conLoggerCount += 1;
    //       }
    //     }
        
    //     var accPOMs = []
    //     for (var i = 0; i < data.accs1.length; i++) {
    //       accPOMs.push(data.accs1[i].payload[0])
    //       if (loggers.includes(data.accs1[i].payload[0])) {
    //         accLoggerCount += 1;
    //       }
    //     }
      
    //     var loggerCountCheck = (conLoggerCount == 0 && accLoggerCount == 0)
      
    //     if (conPOMs.length == 0 && accPOMs.length == 0) {
    //         //return 1; //success
    //         console.log("Pass.")
    //     }
    //     else if ((!conPOMs.includes(certCA) && !accPOMs.includes(certCA)) && loggerCountCheck) {
    //         //return 1; //success
    //         console.log("Pass.")
    //     }
    //     else if ((conPOMs.includes(certCA) || accPOMs.includes(certCA)) && loggerCountCheck) {
    //         //return 0; //fail
    //         console.log("Fail.")
    //     }
    //     else {
    //         //return 0; //fail
    //         console.log("Fail.")
    //     }
    //   }
      
    //     onError(error) {
    //     console.log(`Error: ${error}`);
    //   }
        
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
      
}

export { CertificateCheck };