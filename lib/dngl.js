#!/usr/bin/env node

var moment = require("moment");
var events = require("events");
var fs = require("fs");
var async = require("async");

function dngl( modem ,interval){
	if (!(this instanceof dngl)) return (new dngl(modem, interval));
	var self = this;
	
	
	self.modem = modem;
	self.open = false;

		self.open = true;
		retryATCommand(self, function(err, status, data){
			self.prepare(function(err){
				if (err) return self.emit("error", err);
				self.check();
			});
		});
		self.modem.on("error", function(err){
			return self.emit("error", err);
		});
		self.modem.on("close", function(err){
			if (self.open) {
				self.open = false;
				self.emit("close");
				try {
					self.modem.close();
				} catch(e) {
					return self.emit("error", e);
				}
			}
		});

	return this;
}

function retryATCommand(dongle,callback){
	async.retry({times: 30, interval: 1000}, 
		function(cb,results){
			dongle.send("AT", function(err, status, data){
				if (err){
					cb(err);
				}else if (status !== "OK") {
					cb("AT returned "+status);
				}else{
					cb(null,{err:err, status:status, data:data});
				}
			});
		},function(err, result) {
			if(result)
				callback(result.err,result.status,result.data);
			else
				callback(err,false,null);
		});
}

/* clone prototype from event emitter */
dngl.prototype = Object.create(events.EventEmitter.prototype);

dngl.prototype.prepare = function(callback){
	var self = this;
	// enable dongle dlink 157
	self.send("ATZ +CFUN=1", function(err, status, data){

			setTimeout(function(){
				self.send("AT+CREG=2", function(err, status, data){

					// enable numeric operator format
					self.send("AT+COPS=3,2", function(err, status, data){

						// FIXME: request IMEI, IMSI, etc here
						self.imsi(function(err, imsi){

							self.imsi = imsi;
							self.imei(function(err, imei){

								self.imei = imei;
								callback(null);
							});
						});
					});
				});
			},5000);
	// enable cell id

	});

};

// check get all information and compile it 
dngl.prototype.check = function(){
	var self = this;
	self.signalstrength(function(signal_err, signal){

		self.cellid(function(cellid_err, cellid){

			self.service(function(service_err, service){

				self.time(function(time_err, time){

					self.emit("data", {
						imsi: self.imsi,
						imei: self.imei,
						signal: signal,
						cell: cellid,
						service: service,
						time: time
					});
				});
			});
		});
	});
		
};

dngl.prototype.imsi = function(callback){
	var self = this;
	self.send("AT+CIMI", function(err, status, data){

		var result = (data.match(/^([0-9]{6,15})$/));
		if (!result) return callback(new Error("Failed AT+CIMI"));
		callback(null, parseInt(result[1],10));
	});
};

dngl.prototype.imei = function(callback){
	var self = this;
	self.send("AT+CGSN", function(err, status, data){
		var result = (data.match(/^([0-9]{14,15})/));
		if (!result) return callback(new Error("Failed AT+CGSN"));
		callback(null, parseInt(result[1],10));
	});
};

dngl.prototype.time = function(callback){
	var self = this;
	self.send("AT+CCLK?", function(err, status, data){

		var result = (data.match(/^\+CCLK: ([0-9]{4}\/[0-9]{2}\/[0-9]{2},[0-9]{2}:[0-9]{2}:[0-9]{2})/));
		if (!result) return callback(new Error("Failed AT+CCLK?"));
		var datetime = moment(result[1], "YYYY/DD/MM,HH:mm:ss");
		if (!datetime.isValid()) return callback(new Error("Failed AT+CCLK?"));
		callback(null, datetime.unix());
	});
};

dngl.prototype.signalstrength = function(callback){
	var self = this;
	self.send("AT+CSQ", function(err, status, data){
		var signal = data.split(':')[1];
		if (!signal) return callback(new Error("Failed AT+CSQ"));
		callback(null, signal);
	});
};

dngl.prototype.cellid = function(callback){
	var self = this;
	self.send("AT+CREG?", function(err, status, data){

		var cellid = data.split(":")[1].split(",");
		console.log(cellid);
		if (!cellid) return callback(new Error("Parse Error AT+CREG?"));

		callback(null, {
			stat: parseInt(cellid[0],10),
			lac: (typeof cellid[2] === "string") ? cellid[2].toLowerCase() : null,
			cell: (typeof cellid[3] === "string") ? cellid[3].toLowerCase() : null,
			act: (typeof cellid[4] === "string") ? cellid[4] : null
		});
	});
};

dngl.prototype.service = function(callback){
	var self = this;
	self.send("AT+COPS?", function(err, status, data){
		var result = data.match(/^\+COPS: ([0-4])(,([0-2]),"([^"]+)"(,([0-7]))?)?$/);
		if (!result) return callback(new Error("Parse Error AT+COPS?"));
		callback(null, {
			operator: (typeof result[4] === "string") ? result[4] : null,
			mode: (typeof result[6] === "string") ? parseInt(result[6],10) : null
		});
	});
};

dngl.prototype.send = function(command, callback){
	var self = this;
	self.modem.execute(command, function(data, status){
		status = (typeof status === "string") ? status.trim() : false;
		data = (typeof data === "string") ? data.trim() : "";
		self.emit("command", command, data, status);
		callback(null, status, data);
	}, false, 5000);	
};

module.exports = dngl;
