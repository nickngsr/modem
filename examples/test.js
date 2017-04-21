var exec = require('child_process').exec;
var newModem = require('../index.js').Modem();
var Dngl = require('../index.js').Dongle;


function writeDongleDetails(callback,switchDevice){
  getModemComPorts(function(ports){
    var device = null;

    if(ports[1] && !switchDevice) device = ports[1];
    else if(ports[0]) device = ports[0];

    console.log('Using device '+ device);
    if(device){
    exec('sudo nmcli radio wwan off',{uid:0,gid:0}, function(error, stdout, stderr){
      console.log('Swiching Off 3g gsm dongle in nmcli');
      setTimeout(function(){
          newModem.open(device, function() {
            if(!error){
              getDongleLocationCode(newModem,device,function(error,data){
                var obj = {};
                if(data)
                   obj = data;

                getSimBalance(newModem,device,function(err,output){

                  if(!err)
                    obj.simBalance = output;
                  else
                    console.error(err);

                  if(obj)
                    console.log(obj); 
                  newModem.close();
                  callback();

                });

              });
            
            }else{
              callback(new Error("wwan off failed"));
            }

          });

        newModem.on('close',function(error){
          if(error){
            if(switchDevice)
              callback(error);
            else
              writeDongleDetails(callback,true);
          }

        });

      },5000);

    });

    }else{
      callback(new Error("no dongle ports found"));
    }

  });
}

function getDongleLocationCode(newModem,device,callback){


    var dongle = new Dngl(newModem);

    dongle.on("data", function(data){
      data.time = new Date();
      callback(null,data);
    });

    dongle.on("error", function(err){
      callback(err);
    });

    dongle.on("close", function(){
      console.log("device closed.");
    });
}

function getSimBalance(newModem,device, callback){
  var Session =  require('../index.js').Ussd_Session;

    var session = new Session;
    session.modem = newModem;
    var ussd = "*125#";
    session.query(ussd, function(response_code, message){
        callback(null,message);
    });


}

function getModemComPorts(callback){
  exec('ls /dev/ttyUSB*',{uid:0,gid:0}, function(error, stdout, stderr){
    if(!error){
      callback(stdout.split('\n'));
    }
  });
}

writeDongleDetails(function(){});