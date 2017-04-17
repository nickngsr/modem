var Session = require('../index.js').Ussd_Session;
var modem = require('../index.js').Modem();

modem.open('/dev/ttyUSB0', function() {
    var encoded = "*121#";

                var session = new Session;
                session.modem = modem;

                session.query('*121*44#', function(response_code, message){
                    console.log('asdasdasd');
                    console.log( message);
                });




});


    

