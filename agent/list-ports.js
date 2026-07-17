const { SerialPort } = require('serialport');

async function listPorts() {
  const ports = await SerialPort.list();
  if (ports.length === 0) {
    console.log('No ports found.');
  } else {
    ports.forEach((port) => {
      console.log(`Path: ${port.path}, Manufacturer: ${port.manufacturer}, Serial Number: ${port.serialNumber}`);
    });
  }
}

listPorts();
