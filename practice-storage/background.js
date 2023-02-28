fetch('http://localhost:3000/ClientUpdateTest')
    .then(function(resp) {
        return resp.json();
    })
    .then(function(data) {
        console.log(data.STHs);
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
        
        browser.storage.local.set({STH});
        browser.storage.local.set({REV});
        browser.storage.local.set({PoM});
        browser.storage.local.set({MonitorId});
        browser.storage.local.set({Period});
        browser.storage.local.set({PoMsig});

    });