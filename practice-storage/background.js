// currently stores the sths correctly...
// console.log("hi is this working?");

fetch("http://localhost:3000/?period=0") // have to specify each url to access a certain resource 
    .then(response => response.json())
    .then(function(data) {
        
        // creates sth array (jobin has this)
        //var sths = [];

        // check orig data
        console.log("The following data is the original payload:")
        console.log(data);
        console.log(data.type);

        var parsedUpdate = JSON.parse(data);
        console.log(parsedUpdate.type);
        // stores the actual sths into the array that was just made (jobin has this)
        /*for (var i = 0; i < data.length; i++) {
            sths.push(data.STHs[i]); 
        }
        
        // check if sths array is exact same as orig data
        console.log("The following data is the STHs array:")
        console.log(sths);

        // store sths into local storage (local to the machine that the extension is installed on)
        browser.storage.local.set({sths});*/
    });



        // jobin's parsing code
        //var parsedUpdate = JSON.parse(data);
        //var parsedUpdate = update;
        /*
        
        //var poms = [];
        var revs = [];
        for (var i = 0; i < Object.keys(parsedUpdate.STHs).length; i++) {
            sths.push(parsedUpdate.STHs[i]); 
        }
        for (var j = 0; j < Object.keys(parsedUpdate.REVs).length; j++) {
            revs.push(parsedUpdate.REVs[j]);
        }
       
       // for (var k = 0; k< Object.keys(parsedUpdate.PoMs).length; k++) {
         //   poms.push(parsedUpdate.PoMs[k]);
        //}
    
       */ 


    /*
        console.log(data);
        console.log(data.REVs);
        console.log(data.PoMs);
        console.log(data.MonitorId);
        console.log(data.Period);
        console.log(data.PoMsig);
        
        const STH = data.STHs
        const REV = data.REVs
        const PoM = data.PoMs
        const MonitorId = data.MonitorId
        const Period = data.Period
        const PoMsig = data.PoMsig
        
        browser.storage.local.set({data});
        /*
        browser.storage.local.set({REV});
        browser.storage.local.set({PoM});
        browser.storage.local.set({MonitorId});
        browser.storage.local.set({Period});
        browser.storage.local.set({PoMsig});
        */


        // storing of something
        /*
        let results = browser.storage.local.get(data);
        results.then(function(result) {
            console.log(result);
        });

        browser.storage.local.set({data: {STHs: "test_sth_test"}});
        let results2 = browser.storage.local.get(data);
        results2.then(function(result) {
            console.log(result);
        });*/