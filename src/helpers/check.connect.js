"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const _SECONDS = 5000;

// count connect
const countConnect = () => {
	const numConnection = mongoose.connections.length;
	console.log("Num connection: " + numConnection);
};

// check overload connect
const checkOverloadConnect = () => {
	setInterval(() => {
		const numConnection = mongoose.connections.length;
        const numCors = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;

        // Example: maximum number of connections based on CPU Cores
        const maxConnection = numCors * 5;
        console.log('Active connections: ', numConnection);
        console.log('Memory usage: ', memoryUsage / 1024 / 1024 + ' MB');
        if(numConnection > maxConnection) {
            console.log('Overload connection detected ');
            // Notify.send().....
        }
	}, _SECONDS); // Monitor every 5 seconds
};

module.exports = {
	countConnect,
	checkOverloadConnect,
};
