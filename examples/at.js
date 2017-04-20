var pdu = require('pdu');
var modem = require('../index.js').Modem();
modem.open('/dev/ttyUSB1', function() {
var encoded = "*121#";
/*
	modem.execute('AT+CPIN?', function(escape_char, response){
		//console.log(escape_char + response);
		setTimeout(function(){
			modem.execute('AT+CPIN="1234"', function(escape_char, response){
				//console.log(escape_char + response);
					setTimeout(function(){
						modem.execute('AT+CPIN?', function(escape_char, response){
							//console.log(escape_char + response);
							setTimeout(function(){
								modem.execute('ATZ +CFUN=1', function(escape_char, response){
									setTimeout(function(){
									//console.log(escape_char + response);
										modem.execute('AT+CUSD=1,"*121*44#",15', function(escape_char, response){
											
											console.log(escape_char + response);
												setTimeout(function(){
													modem.execute('AT+CUSD=2', function(escape_char, response){
														//console.log(escape_char + response);
													});
												},3000);

										});
									},9000);
								});
							},9000);
						});
					},9000);

			});
		},9000);
	});
*/


								modem.execute('ATZ +CFUN=1', function(escape_char, response){
									setTimeout(function(){
									//console.log(escape_char + response);
										modem.execute('AT+CUSD=1,"*121*44#",15', function(escape_char, response){
											
											console.log(escape_char + response);
												setTimeout(function(){
													modem.execute('AT+CUSD=2', function(escape_char, response){
														//console.log(escape_char + response);
													});
												},3000);

										});
									},9000);
								});



});
