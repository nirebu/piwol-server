const express = require('express');
const arp = require('node-arp');

const app = new express();

app.get('/mac/:ip', (req,res) => {
	arp.getMAC(req.params.ip , ( err , mac ) => {
		res.send(mac);
	});
});


app.listen(3000, () => {
	console.log("Listening...");
})