var pdu = require('pdu');
var modem = require('../index.js').Modem();
modem.open('/dev/ttyUSB1', function() {
	var encoded = "*121#";

	modem.execute('ATZ +CFUN=1', function(escape_char, response){
		//console.log(escape_char + response);
			setTimeout(function(){
				//modem.execute('AT+CSCS="GSM"', function(escape_char, response){
					//console.log(escape_char + response);
						//modem.execute('AT+CUSD=1', function(escape_char, response){

							//console.log(escape_char + response);
							modem.execute('AT+CUSD=1,"*121*44#",15', function(escape_char, response){
								
								console.log(escape_char + response);
									setTimeout(function(){
										modem.execute('AT+CUSD=2', function(escape_char, response){
										
											console.log(escape_char + response);
										});
									},10000);

							});
						//});
				//});
			},10000);

	});
});