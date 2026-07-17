const io = require('socket.io-client');
const { exec } = require('child_process');
const { SerialPort } = require('serialport');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

let serial;
try {
  serial = new SerialPort({ path: config.port, baudRate: config.baudRate });
  console.log(`Serial port ${config.port} initialized`);
} catch (e) {
  console.error('Serial port initialization failed:', e.message);
}

const socket = io('http://localhost:3000'); // Update with actual server URL later

socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('identify', { name: 'PC-' + Math.floor(Math.random() * 1000) });
});

socket.on('execute', (action) => {
  console.log('Executing action:', action);
  
  if (serial && serial.isOpen) {
    serial.write(JSON.stringify(action));
  }
  
  // Software HID fallback
  if (action.type === 'key') {
    const psCommand = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${action.value}')"`;
    exec(psCommand);
  } else if (action.type === 'mouse') {
    const psCommand = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${action.x}, ${action.y})"`;
    exec(psCommand);
  }
});
