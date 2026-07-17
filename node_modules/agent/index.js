const io = require('socket.io-client');
const { exec } = require('child_process');
const { SerialPort } = require('serialport');

// Setup SerialPort (configure with correct port when hardware is connected)
// let serial;
// try {
//   serial = new SerialPort({ path: 'COM3', baudRate: 9600 });
// } catch (e) {
//   console.error('Serial port not available');
// }

const socket = io('http://localhost:3000'); // Update with actual server URL later

socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('identify', { name: 'PC-' + Math.floor(Math.random() * 1000) });
});

socket.on('execute', (action) => {
  console.log('Executing action:', action);
  
  // Option 1: Hardware HID (if serial is active)
  // if (serial && serial.isOpen) {
  //   serial.write(JSON.stringify(action));
  // }
  
  // Option 2: Software HID (existing)
  if (action.type === 'key') {
    const psCommand = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${action.value}')"`;
    exec(psCommand);
  } else if (action.type === 'mouse') {
    const psCommand = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${action.x}, ${action.y})"`;
    exec(psCommand);
  }
});
