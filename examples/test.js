var modem = require('../index.js').Modem();

var Session = require('../index.js').Ussd_Session;

var device1   = '/dev/ttyUSB1';
var dngl = require('../index.js').Dongle;


var device = new dngl(device1,modem,5000); // put your device here

device.on("data", function(data){
  console.log(data);
});

device.on("error", function(err){
  console.error("error:", err);
});

device.on("close", function(){
  console.log("device is gone.");
});


/*
modem.open(device, function(data){
	console.log(data);
	console.log('here');
	CheckBalance();
	//sendSMS();
});
*/
var CheckBalance = function() {
    var session = new Session();
    session.modem = modem;
    session.query('*121*#', function(response_code, message){
    	console.log('inside');
    	console.log(response_code);
    	console.log(message);
    });
    
};


function sendSMS(){
	function err(message) {
  console.log('Usage: node send_sms.js /path/to/device xxxxyyzz "Foo Bar"');
  process.exit();
}


var receiver = '8888087807';
var text     = 'Hello';

if(!device || !receiver || !text) err();

	console.log('asdasd');
  modem.sms({
    receiver:receiver,
    text:text,
    encoding:'16bit'
  }, function(err, sent_ids) {
    console.log('>>', arguments);
    if(err)
      console.log('Error sending sms:', err);
    else
      console.log('Message sent successfully, here are reference ids:', sent_ids.join(','));
  });

}
