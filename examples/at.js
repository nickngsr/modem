var pdu = require('pdu');
var modem = require('../index.js').Modem();
modem.open('/dev/ttyUSB1', function() {
	var encoded = "*121#";

	modem.execute('AT+CSCS="GSM"', function(escape_char, response){
		console.log(escape_char + response);
	});
});