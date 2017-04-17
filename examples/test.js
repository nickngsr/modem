var exec = require('child_process').exec;

function writeDongleDetails(callback){
  getModemComPorts(function(ports){
    var device = null;
    if(ports[1]) device = ports[1];
    else if(ports[0]) device = ports[0];

    if(device){
      exec('sudo nmcli radio wwan off',{uid:0,gid:0}, function(error, stdout, stderr){
        if(!error){
          getDongleLocationCode(device,function(error,data){
            var obj = {};
            if(data)
               obj = data;


          });
        
        }else{
          callback(new Error("wwan off failed"));
        }

      });

    }else{
      callback(new Error("no dongle ports found"));
    }

  });
}

function getDongleLocationCode(device,callback){
    var newModem = require('../index.js').Modem();
    var Dngl = require('../index.js').Dongle;

    var dongle = new Dngl(newModem);

    dongle.on("data", function(data){
      data.time = new Date();
      console.log("Dongle Balance And Location Details obtained are : ");
      console.log(data);
      //newModem.port.close();
      callback(null,data);
    });

}

function getSimBalance(callback){
  exec('gammu-detect > /root/.gammurc',{uid:0,gid:0}, function(error, stdout, stderr){
    console.log(error);
    exec('sudo gammu 1 getussd *125#', function(error, stdout, stderr){
      console.log('*121*44# ussd returned');
      console.log(stdout);
      callback(error,stdout);
    });
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