var cert = {
    "Issuer": "localhost:9100",
    "Serial Number": "fe:a8:5e:a5:cc:5d:84:7c:99:e6:77:b2:9d:80:a7:81",
    "Signature": "25:1f:b2:b5:1b:cf:36:64:8b:9f:c9:3d:8a:d7:db:77:c0:c6:9c:80:f2:c3:1d:af:84:f2:a8:d5:5e:8e:8f:2b:31:3e:fc:bd:44:bf:f1:45:00:c1:0d:94:9c:49:08:6f:0a:fc:a4:82:50:2c:d9:ba:e8:a7:39:1c:d2:45:43:24:a8:b1:9d:fa:d3:c1:5a:67:ee:54:18:bc:3c:ff:d7:17:5b:c2:72:ce:0b:3c:bc:b0:cd:25:a0:98:1f:f5:52:67:bf:5f:e4:00:b4:c5:98:0b:59:17:e2:3f:8f:05:5f:f9:91:12:c3:69:94:12:f2:83:90:b1:f3:48:6b:b8:ec:ef:14:47:70:b2:b9:25:5a:c1:5e:2c:80:62:8b:f4:86:70:93:da:27:6a:ca:e2:b5:46:0e:9a:fa:52:cd:aa:95:d8:e0:6d:98:03:05:d9:fe:3c:99:e4:8e:ea:90:ff:b6:e5:3e:6f:4b:0d:8d:a2:7f:e5:85:5d:e2:62:48:78:16:4a:80:c1:9b:40:3e:dc:46:32:67:d7:01:2e:d9:2e:f7:b0:e1:17:b2:d5:e8:64:30:5e:d9:ef:44:08:34:37:fd:fb:23:0e:68:ca:5a:68:a9:25:8a:b5:72:44:c5:75:b7:70:2d:8b:05:eb:75:c3:42:e0:a7:fe:17:85:f9:72:a1:d3",
    "Validity": {
      "Not Before": "Mar 13 21:59:29 2023 GMT",
      "Not After": "Mar 12 21:59:29 2024 GMT"
    },
    "Subject": "CN = Testing Dummy 0",
    "STH": {
      "application": "CTng",
      "period": "0",
      "type": "http://ctng.uconn.edu/101",
      "signer": "localhost:9000",
      "signers": null,
      "signature": [
        "{\"sig\":\"6a28a6947cf43ac670e6fe52cdc6c98dae9c585b8ba8e7df8965991c7ae9fbaa595cd39b551adc035fa8bad3465aae8fbaf824bec05d2d8c18b23833e35ee383aa91d6c6c67abe2a2a9ff9c7e2b2f0b84bcf15ff7bdd3ed89379b0b310b6566e4b2b50db4820a96e865258529ea41d017557cd5602a4aa095a521dafc0e0a43b1753b7ae8fde64e07e901679608246e3a9b691c3a072a222b4f31c2d6f091419c586e17661ce22306e392c4e03b7aff641aadc281b037cd232ad6a7cc58c4f9ccddff0df10276d6a1028a22734c449b433f7857f7e78782b77645a5c4df86758f3c85573dc7413af66b56240450b6fb37a6b5adac45e18a606c96a6cbd5e6e59\",\"id\":\"localhost:9000\"}",
        ""
      ],
      "timestamp": "2023-03-13T21:59:31Z",
      "crypto_scheme": "RSA",
      "payload": [
        "localhost:9000",
        "{\"Signer\":\"localhost:9000\",\"Timestamp\":\"2023-03-13T21:59:31Z\",\"RootHash\":\"\\ufffd\\ufffd\\u0010\\ufffd'@Gj\\ufffd*\\ufffdqy...\\ufffdb\\u0013\\ufffd\\n\\ufffd\\ufffd?\\ufffd\\ufffd\\ufffd\\ufffd7\\ufffd\\u001d\\ufffd\",\"TreeSize\":12}",
        ""
      ]
    },
    "POI": {
      "SiblingHashes": [
        "Z7iPVPvZQRYWQuDiaPx5bX3crrwOIk9DpVBk6+2gTvw=",
        "a3JZsStg1xHaXfl6PT7QJZ34IIu7dAXjxr9gMO6TNao=",
        "vqAdBXLKvmVVxOaa+GAYlIuTouUTdi+mR/7Ahi96rGA=",
        "CuSdi9Auz5Uc9d42sl6A+trdIqOQzsH0emfED4q6aqs="
      ],
      "NeighborHash": "6gkaYIt1zM4paSWBI34pJdtIWCoCKyYACEODqkuSyCM="
    }
  }

  export { cert };