const io = require('socket.io-client');
const { exec } = require('child_process');
const { SerialPort } = require('serialport');
const fs = require('fs');
const Peer = require('simple-peer');
const screenshot = require('screenshot-desktop');
const os = require('os');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

let serial;
try {
  serial = new SerialPort({ path: config.port, baudRate: config.baudRate });
  console.log(`Serial port ${config.port} initialized`);
} catch (e) {
  console.error('Serial port initialization failed:', e.message);
}

const socket = io('http://localhost:3000'); // Update with actual server URL later

let peer;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function executeAction(action) {
  if (serial && serial.isOpen) {
    serial.write(JSON.stringify(action));
  }
  
  if (action.type === 'key') {
    const psCommand = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${action.value}')"`;
    exec(psCommand);
  } else if (action.type === 'mouse') {
    const psCommand = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${action.x}, ${action.y})"`;
    exec(psCommand);
  }
}

socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('identify', { name: 'PC-' + Math.floor(Math.random() * 1000) });
  
  // Stats reporting
  setInterval(() => {
    const stats = {
      cpu: os.loadavg()[0],
      memory: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
    };
    socket.emit('stats', stats);
  }, 3000);
});

socket.on('signal', (data) => {
  if (peer) peer.signal(data.signal);
});

socket.on('execute', async (action) => {
  console.log('Executing action:', action);
  
  if (action.type === 'macro') {
    for (const subAction of action.sequence) {
      await executeAction(subAction);
      await delay(200); // Small delay between macro steps
    }
  } else if (action.type === 'start-stream') {
    // Initiate WebRTC
    peer = new Peer({ initiator: true, trickle: false });
    peer.on('signal', (signal) => {
      socket.emit('signal', { targetId: action.senderId, signal });
    });
    
    // Periodically capture screen and send as data
    setInterval(async () => {
        const img = await screenshot();
        if (peer && peer.connected) {
            peer.send(img);
        }
    }, 100);
  } else {
    await executeAction(action);
  }
});
