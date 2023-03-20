// JavaScript source code

function queryMonitor(period, theUrl) {

    var XMLHttpRequest = require('xhr2');
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl); // access objects
    xmlHttp.send(); // send request to server
    xmlHttp.responseType = "json"; // data will be returned in json format
 
    // listen to GET response using onload event listener
    xmlHttp.onload = () => {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
         console.log('ClientUpdate: ', xmlHttp.response); // log data to console
        }
        else {
          console.log(`Error: ${xmlHttp.status}`); // log error to console
        }
    };
 
    return xmlHttp.responseText; // returns ClientUpdate json payload (not parsed)
 
    // TODO: update the function to send request for every missing period
 }
 

 
var update = {
    "STHs": [
     {
      "application": "CTng",
      "period": "0",
      "type": "http://ctng.uconn.edu/301",
      "signer": "",
      "signers": {
       "0": "localhost:8080",
       "1": "localhost:8081"
      },
      "signature": [
       "{\"sign\":\"1c2e5a5556d357883079598de6038c1eeffdc0df9dc7f0d7ab7965a58ca24db2eb751fb11528ec6a7f2f2783b807db15\", \"ids\":[\"localhost:8080\",\"localhost:8081\"]}",
       ""
      ],
      "timestamp": "2023-03-02T05:27:16Z",
      "crypto_scheme": "BLS",
      "payload": [
       "localhost:9000",
       "{\"Signer\":\"localhost:9000\",\"Timestamp\":\"2023-03-02T05:27:09Z\",\"RootHash\":\"\\ufffd\\ufffd\\ufffd֙\\ufffd\\u0000-'\\ufffd\\ufffdG\\ufffd\\u001f\\u0008\\ufffdUp\\u0011\\ufffd\\u001b\\ufffd\\ufffd\\ufffd\\u0001\\ufffd\\ufffd\\u0013\\u000c5Z\\u0015\",\"TreeSize\":12}",
       ""
      ]
     },
     {
      "application": "CTng",
      "period": "0",
      "type": "http://ctng.uconn.edu/301",
      "signer": "",
      "signers": {
       "0": "localhost:8080",
       "1": "localhost:8081"
      },
      "signature": [
       "{\"sign\":\"79844bac56ea4936921e2d5bb1f32b190629910bafebc0ee725c602adb5cb5e13af9b3ff395f61a24ce0546e32e94a0e\", \"ids\":[\"localhost:8080\",\"localhost:8081\"]}",
       ""
      ],
      "timestamp": "2023-03-02T05:27:16Z",
      "crypto_scheme": "BLS",
      "payload": [
       "localhost:9001",
       "{\"Signer\":\"localhost:9001\",\"Timestamp\":\"2023-03-02T05:27:09Z\",\"RootHash\":\"\\ufffd\\ufffd\\u003c\\u001cc\\ufffd\\ufffd\\ufffd.'\\ufffd\\ufffd)\\u000eIÉ\\ufffdH\\ufffd,!v\\ufffd\\u00071\\ufffd:\\ufffd\\ufffd\\u0005\\u001c\",\"TreeSize\":12}",
       ""
      ]
     },
     {
      "application": "CTng",
      "period": "0",
      "type": "http://ctng.uconn.edu/301",
      "signer": "",
      "signers": {
       "0": "localhost:8080",
       "1": "localhost:8081"
      },
      "signature": [
       "{\"sign\":\"3022ffbc2c2cfa0357f4f4c48bc45380ff4476068e64217d917277f10a33473c9e4d60c69d10612b7ff87fc0b979ce98\", \"ids\":[\"localhost:8080\",\"localhost:8081\"]}",
       ""
      ],
      "timestamp": "2023-03-02T05:27:16Z",
      "crypto_scheme": "BLS",
      "payload": [
       "localhost:9002",
       "{\"Signer\":\"localhost:9002\",\"Timestamp\":\"2023-03-02T05:27:09Z\",\"RootHash\":\"W\\ufffdMl\\ufffdg\\ufffd\\u0008\\ufffdN\\ufffd{\\ufffd\\ufffdM\\ufffd@\\ufffdQ%\\ufffd*\\ufffdR\\ufffdo2\\u0010\\ufffd\\ufffd@\\ufffd\",\"TreeSize\":12}",
       ""
      ]
     }
    ],
    "REVs": [
     {
      "application": "CTng",
      "period": "0",
      "type": "http://ctng.uconn.edu/302",
      "signer": "",
      "signers": {
       "0": "localhost:8080",
       "1": "localhost:8081"
      },
      "signature": [
       "{\"sign\":\"a5c75d5565e1f1f54ca40f3ea629e0c61d6990ecfd66e59790111e7ff00ece3efb93e5b2e00e11986f05bfd97798700e\", \"ids\":[\"localhost:8080\",\"localhost:8081\"]}",
       ""
      ],
      "timestamp": "2023-03-02T05:27:16Z",
      "crypto_scheme": "BLS",
      "payload": [
       "localhost:9100",
       "CRV",
       "{\"Period\":\"0\",\"Delta_CRV\":\"IkFBQUFBQUFBQUFBPSI=\",\"SRH\":\"{\\\"sig\\\":\\\"9810b47896ce214c629fc1f0a7c23d509a758d19136e92d849a2dd63c39502c7bfead308a34ad0e8c91262807fb082552d9b46c09c0e50302a7c5adbbeb713259d21e65b861120e789ebad6c07e81e8b5605bad78667add05c6882d079fd24bfe8ec15717910ad345aa6a7d3eb2bc4b35c8189c0044be89e0ee71464d9c6382bfdc510e1cc2aed3d274686f3d2bd5868607e8328f5bd4edcf7b3c21fea327d5eea53bae56c4ecaed6ae4a9706b249c46096c842e19b59127226619fabc12bd6b8ede62ce944c8bdd265a43702d666cb8710317ae7d6b7046891991c5eb608cc63e09d58b2ed88466d6f45226db33add0c0eb7d196c4b7861925fdbdcbfa4675a\\\",\\\"id\\\":\\\"localhost:9100\\\"}\"}"
      ]
     },
     {
      "application": "CTng",
      "period": "0",
      "type": "http://ctng.uconn.edu/302",
      "signer": "",
      "signers": {
       "0": "localhost:8080",
       "1": "localhost:8081"
      },
      "signature": [
       "{\"sign\":\"b28c87a574f61c6cdc5bb24ce3209676b3923146a07629b6f090a5a78dee509aa9aa92c8acbf288f72f985ecfa3aa402\", \"ids\":[\"localhost:8080\",\"localhost:8081\"]}",
       ""
      ],
      "timestamp": "2023-03-02T05:27:16Z",
      "crypto_scheme": "BLS",
      "payload": [
       "localhost:9101",
       "CRV",
       "{\"Period\":\"0\",\"Delta_CRV\":\"IkFBQUFBQUFBQUFBPSI=\",\"SRH\":\"{\\\"sig\\\":\\\"bacf05dd2984a566c899978652d82a6ddf716867e7c3707ca45ebd29a234c3f5c83f61656e8a35626ed3a9f2dda3716acd1f2fb3080c6a4ea8830f193693135dbdc6f1725a48a86409ad44686fcb5387e2c9393b139e8959b8bc9c06bd014347ecb6aa074731c8b49435a1c52c4aabda646e916b050ed7d8885359b75e7f85b09eefb470a7a04d04fdbad6cfcb0b70de782ad673832404d1ff9ac65002c6d9ca025e3ba196c3d6a50ce79949ca7ad7588c94fed42af69a11873a1eba10f654cd8b4fa66539e2c014fadeadf8fe96c9cad36e217df6ce607f97bda8b179b24140700be7cc1efb99d2067283949006fb59978515348c756e51d352930366b47f7c\\\",\\\"id\\\":\\\"localhost:9101\\\"}\"}"
      ]
     },
     {
      "application": "CTng",
      "period": "0",
      "type": "http://ctng.uconn.edu/302",
      "signer": "",
      "signers": {
       "0": "localhost:8080",
       "1": "localhost:8081"
      },
      "signature": [
       "{\"sign\":\"85cd037f7729f4262b8fa661e5015fdd8b1b0faf74b1e0fa4922565cc09dec9add05a2c951fc030f16d587bcdced5687\", \"ids\":[\"localhost:8080\",\"localhost:8081\"]}",
       ""
      ],
      "timestamp": "2023-03-02T05:27:16Z",
      "crypto_scheme": "BLS",
      "payload": [
       "localhost:9102",
       "CRV",
       "{\"Period\":\"0\",\"Delta_CRV\":\"IkFBQUFBQUFBQUFBPSI=\",\"SRH\":\"{\\\"sig\\\":\\\"38abe42b675bf41182801dff6224990d1ef142f03426d617f2bac74a52089726541be0e97bbe668ec2c52b2c83d63b3ddbde9c77fd6ecc3db4034cf8274f6b13b330d00b1126f97628bdb10f547b8a73c91a751afc945cb2944384ead298b87927929cc60c9613a49f91ae268ad6baeca23e1669bf0f416a54c0d666cd7c32670b540dc3483650aeda58099825c825564c3b5e2d338d9357848a0e48ae8004b206796f51b2d17dfcbbc09fdec50db5cb50939df55cd8392ccfd44209771cbaec5948c1aa7e8db9faf63c0f011199e766d6ec857739372c2ee4040702a76593bb9a40f7cebe93096de0197067fd357b99524e1ea86520774bc1856f105fcc2847\\\",\\\"id\\\":\\\"localhost:9102\\\"}\"}"
      ]
     }
    ],
    "ACCs": null,
    "PoMs": null,
    "MonitorID": "localhost:8180",
    "Period": "0"
   }

function parseUpdate(update) {

    
    //var parsedUpdate = JSON.parse(update);
    var parsedUpdate = update;
    var sths = [];
    var revs = [];
    //var poms = [];
   
    for (var i = 0; i < Object.keys(parsedUpdate.STHs).length; i++) {
        sths.push(parsedUpdate.STHs[i]);
        
    }
    
    for (var j = 0; j < Object.keys(parsedUpdate.REVs).length; j++) {
        revs.push(parsedUpdate.REVs[j]);
    }
    console.log(revs);
   
   // for (var k = 0; k< Object.keys(parsedUpdate.PoMs).length; k++) {
     //   poms.push(parsedUpdate.PoMs[k]);
    //}


}

// test http get request from local host, send period 0 on start
//var update = queryMonitor(0, "http://localhost:3000/ClientUpdateTest%22");
parseUpdate(update);



//run test on json files and link with riana's code to verify check and receive
