const noble = require('noble');
const data = require('./config.json');
const lockCommand = '/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend';

var exec = require('child_process').exec

function _command (cmd) {
  exec(cmd, (err, stdout, stderr) => {});
}

noble.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});


noble.on('discover', (peripheral) => {
  let peripheralName = peripheral.advertisement.localName;
  if (peripheralName === data.device){
    console.log(`Pebble Found with ID ${peripheral.id}`);
    explore(peripheral);
    noble.stopScanning();
  }
});

function explore(peripheral) {
  let shouldLock = true;
  peripheral.connect((err) => {
    if (err) {
      console.log('Error when Connect Pebble');
      noble.startScanning();
      return;
    }
    console.log('Connected!');

    process.on('SIGINT', function() {
        peripheral.disconnect();
        shouldLock = false;
        process.exit();
    });

  });
  peripheral.on('disconnect', () => {
    if (shouldLock) {
      console.log('Pebble lost connection!');
      console.log('Locking macbook');
      _command(data.lockCommand);
      noble.startScanning();
    }
  });
}
