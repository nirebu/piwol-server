const db = require('./src/db');

require('dotenv').config();
const wol = require('node-wol');
const express = require('express');
const scanner = require('local-devices');
const app = new express();

/**
 * Route to scan the local netowrk and update the DB
 * @name get/scan
 * @param {String} path - Express path
 * @param {callback} handler - Handler of the path
 * @returns {Object}
*/
app.get('/scan/', (req, res) => {
	scanner().then( (devices) => {
		devices.forEach( device => {
			db.get(`devices`)
				.upsert({ mac: device.mac , ip: device.ip , name: device.name, status: 'UP' }, `mac`)
				.write();
		});
		const data = {...devices};
		res.send(data);
	});
});

/**
 * Route to list all the devices present in the DB
 * @name get/device
 * @param {String} path - Express path
 * @param {callback} handler - Handler of the path
 * @returns {Object}
*/
app.get(`/device/`, (req, res) => {
	const devices = db.get(`devices`).value();
	res.status(200).send(devices);
});

/**
 * Route to get a single device from the DB with the corresponding mac address
 * @name get/device/:mac
 * @param {String} path - Express path
 * @param {callback} handler - Handler of the path
 * @returns {Object}
*/
app.get(`/device/:mac`, (req, res) => {
	wol.wake(req.params.mac, (err) => {
		if( err ) throw new Error(`Error on waking the device`);

		const device = db.get(`devices`).find({mac: req.params.mac}).value();
		res.status(200).send(device);
	});
});

/**
 * Route to wakeup the device with the corresponding mac address
 * @name get/device/:mac/wakeup
 * @param {String} path - Express path
 * @param {callback} handler - Handler of the path
 * @returns {Object}
*/
app.get(`/device/:mac/wakeup`, (req, res) => {
	wol.wake(req.params.mac, (err) => {
		if( err ) throw new Error(`Error on waking the device`);

		const data = { mac: req.params.mac , magic: true };
		res.status(200).send(data);
	});
});

/**
 * Route to ping the device with the corresponding mac address
 * Initially we look in the DB for the IP corresponding to the mac address
 * if there's a match we scan the device and return the UP status
 * otherwise we scan the entire network to check if the device changed IP address
 * @name get/device/:mac/ping
 * @param {String} path - Express path
 * @param {callback} handler - Handler of the path
 * @returns {Object}
*/
app.get(`/device/:mac/ping`, (req, res) => {
	const expectedIp = db.get(`devices`).find({ mac: req.params.mac }).value();
	if( expectedIp )
	{
		scanner(expectedIp.ip).then( device => {
			const data = { ip: device.ip , mac: device.mac , status: 'UP' };
			res.status(200).send(data);
		})
	}
	else
	{
		scanner().then( (devices) => {
			const device = devices.filter( device => device.mac === req.params.mac ).pop();
			/**
			 * In this way we check if the device changed IP address
			 * if the address is indeed changed, we respond with the updated data
			 * otherwise we consider the device DOWN
			 */
			if( device !== undefined )
			{
				const data = { ip: device.ip , mac: device.mac , status: 'UP' , ipAddressChanged: true };
				res.status(200).send(data);
			}
			else
			{
				const data = { mac: req.params.mac , status: 'DOWN' };
				res.status(200).send(data);
			}
		})
	}
});


const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
