const db = require('./src/db');

require('dotenv').config();
const wol = require('node-wol');
const express = require('express');
const scanner = require('local-devices');
const ping = require('ping');
const cors = require('cors');
const app = new express();

app.use(cors());

/**
 * Route to scan the entire local network and update the DB
*/
app.get('/scan/', (req, res) => {
	scanner().then( (devices) => {
		const data = devices.map( device => { return { ...device, status: 'UP' }} );
		console.log(`Found ${data.length} devices...`);
		console.table(data);
		data.forEach( device => {
			db.get(`devices`)
				.upsert({
					mac: device.mac,
					ip: device.ip,
					name: device.name,
					status: device.status
				}, `mac`)
				.write();
		});
		res.send(data);
	});
});

/**
 * Route to ping a device in the DB
*/
app.get('/device/:mac/ping', (req, res) => {
	// Find the corresponding IP by looking up in the DB
	const device = db.get(`devices`).find({mac: req.params.mac}).value();
	if( device )
	{
		console.info(`Found the following device, will try to ping its IP`);
		console.info(device);
		ping.promise.probe( device.ip ).then( pingRes => {
			console.info(`The device with IP: ${device.ip} is ${ pingRes.alive ? "UP" : "DOWN" }`);
			if( pingRes.alive )
			{
				res.status(200).send(device);
			}
			else
			{
				console.warn(`Device not found, it means either: IP is changed OR the device is DOWN`);
				scanner().then( devices => {
					const device = devices.filter( device => device.mac === req.params.mac ).pop();
					if( device )
					{
						console.info(`Found this device, looks like the IP address has changed`);
						console.info(device);
						console.info(`Updating the DB with the new IP...`);
						db.get(`devices`)
							.find({ mac: device.mac})
							.assign({ ip: device.ip , status: 'UP' })
							.write();
						const data = { ...device , status: 'UP' };
						res.status(200).send(data);
					} else {
						console.info(`Device not in network, must be down...`);
						db.get(`devices`)
							.find({ mac: req.params.mac})
							.assign({ status: 'DOWN' })
							.write();
						const data = { mac: req.params.mac , ip: null , status: 'DOWN' };
						res.status(200).send(data);
					}
				})
			}
		});
	}
	else
	{
		console.warn(`mac not in the db, maybe we should consider the eventuality`);
		res.status(400).send({msg: "Mac address not in the DB"});
	}
});

/**
 * Route to ping a device in the DB
*/
app.get('/device/:mac/wakeup', (req, res) => {
	wol.wake(req.params.mac , err => {
		if( err )
			console.error(`Something went wrong while sending the MAGIC packet`);
		res.status(200).send({ msg: "Magic packet sent" , mac: req.params.mac });
	})
});

app.get('/device/' , (req,res) =>{
	const devices = db.get(`devices`).value();
	res.status(200).send(devices);
})

/**
 * Route to set a device as ignored
*/
app.get('/device/:mac/ignore' , (req, res) => {
	const device = db.get(`devices`)
		.find({ mac: req.params.mac })
		.assign({ ignored: true })
		.write();
	res.status(200).send(device);
})


const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
