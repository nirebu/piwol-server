const db = require('./src/db');

const express = require('express');
const scanner = require('local-devices');
const arp = require('node-arp');
const app = new express();

app.get('/scan/',(req,res) =>{
	scanner().then( devices =>{
		res.send(devices);
	});
});

app.get('/mac/:ip', (req,res) => {
	arp.getMAC(req.params.ip , ( err , mac ) => {

		if( err ) throw new Error(err);

		db.get('hosts').upsert({ip: req.params.ip , mac }).write();
		res.send(mac);
	});
});


app.listen(3000, () => {
	console.log("Listening...");
})