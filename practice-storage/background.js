// test with for loop
// var sths = 'sths';
// var timestamps = 'timestamps'
// for(var p = 0; p < 4; p++) {
//     theUrl = 'http://localhost:3000/?period=' + p
//     fetch(theUrl)
//         .then(response => response.text())
//         .then((text) => {
//             console.log(p)
//             // getting the payload as an Object 
//             const data = JSON.parse(text);

//             //var sths0 = [] // store the sths from period=0 here
//             eval('var ' + sths + p + '= [];');

//             //var timestamps0 = [] // store the timestamp from period=0 
//             eval('var ' + timestamps + p + '= [];');

//             for (var i = 0; i < Object.keys(data.STHs).length; i++) {
//                 //sths0.push(data.STHs[i]);
//                 eval(sths + p + '.push(data.STHs[i]);')

//                 //timestamps0.push(data.STHs[i].timestamp);
//                 eval(timestamps + p + '.push(data.STHs[i].timestamp);')
//             }

//             // store the period=0 sths and timestamps into local storage
//             //browser.storage.local.set({sths0 /*key name in local storage*/});
//             eval('browser.storage.local.set({' + sths + p + '});')

//             //browser.storage.local.set({timestamps0 /*key name in local storage*/})
//             eval('browser.storage.local.set({' + timestamps + p + '})')
            
//             // checks
//             console.log("The following is the STH(s) from period " + p + ":")

//             //console.log(sths0);
//             eval('console.log(' + sths + p + ');')

//             //console.log(timestamps0);
//             eval('console.log(' + timestamps + p + ');')
//         })
// }

// if period=0
fetch('http://localhost:3000/?period=0')
  .then(response => response.text())
  .then(text => {
    // getting the payload as an Object 
    const data = JSON.parse(text);

    var sths0 = [] // store the sths from period=0 here
    var timestamps0 = [] // store the timestamp from period=0 
    var revs0 = []
    for (var i = 0; i < Object.keys(data.STHs).length; i++) {
        sths0.push(data.STHs[i]);
        timestamps0.push(data.STHs[i].timestamp);
        revs0.push(data.REVs[i]);
    }

    // store the period=0 sths and timestamps into local storage
    browser.storage.local.set({sths0 /*key name in local storage*/});
    browser.storage.local.set({timestamps0 /*key name in local storage*/})
    browser.storage.local.set({revs0})
    
    // checks
    console.log("The following is the STH(s) from period 0:")
    console.log(sths0);
    console.log(timestamps0);

    console.log("The following is the REV(s) from period 0:")
    console.log(revs0)
  });

// if period=1
fetch('http://localhost:3000/?period=1')
  .then(response => response.text())
  .then(text => {
    // getting the payload as an Object 
    const data = JSON.parse(text);

    var sths1 = [] // store the sths from period=1 here
    var timestamps1 = [] // store the timestamp from period=1 
    var revs1 = []
    for (var i = 0; i < Object.keys(data.STHs).length; i++) {
        sths1.push(data.STHs[i]);
        timestamps1.push(data.STHs[i].timestamp);
        revs1.push(data.REVs[i]);
    }

    // store the period=1 sths and timestamps into local storage
    browser.storage.local.set({sths1 /*key name in local storage*/});
    browser.storage.local.set({timestamps1 /*key name in local storage*/})
    browser.storage.local.set({revs1})

    // check sths
    console.log("The following is the STH(s) from period 1:")
    console.log(sths1);
  });

// if period=2
fetch('http://localhost:3000/?period=2')
  .then(response => response.text())
  .then(text => {
    // getting the payload as an Object 
    const data = JSON.parse(text);

    var sths2 = [] // store the sths from period=0 here
    var timestamps2 = [] // store the timestamp from period=2 
    var revs2 = []
    for (var i = 0; i < Object.keys(data.STHs).length; i++) {
        sths2.push(data.STHs[i]);
        timestamps2.push(data.STHs[i].timestamp);
        revs2.push(data.REVs[i]);
    }

    // store the period=2 sths and timestamps into local storage
    browser.storage.local.set({sths2 /*key name in local storage*/});
    browser.storage.local.set({timestamps2 /*key name in local storage*/})
    browser.storage.local.set({revs2})

    // check sths
    console.log("The following is the STH(s) from period 2:")
    console.log(sths2);
});

// if period=3
fetch('http://localhost:3000/?period=3')
  .then(response => response.text())
  .then(text => {
    // getting the payload as an Object 
    const data = JSON.parse(text);

    var sths3 = [] // store the sths from period=0 here
    var timestamps3 = [] // store the timestamp from period=3
    var revs3 = []
    for (var i = 0; i < Object.keys(data.STHs).length; i++) {
        sths3.push(data.STHs[i]);
        timestamps3.push(data.STHs[i].timestamp);
        revs3.push(data.REVs[i]);
    }

    // store the period=3 sths and timestamps into local storage
    browser.storage.local.set({sths3 /*key name in local storage*/});
    browser.storage.local.set({timestamps3 /*key name in local storage*/})
    browser.storage.local.set({revs3})

    // check sths
    console.log("The following is the STH(s) from period 3:")
    console.log(sths3);
});