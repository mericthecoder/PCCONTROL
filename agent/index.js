const io = require('socket.io-client');
const { exec } = require('child_process');

const socket = io('http://localhost:3000'); // Update with actual server URL later

socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('identify', { name: 'PC-' + Math.floor(Math.random() * 1000) });
});

socket.on('execute', (action) => {
  console.log('Executing action:', action);
  
  // Example action structure: { type: 'key', value: '{ENTER}' }
  // or { type: 'mouse', x: 100, y: 100 }
  
  if (action.type === 'key') {
    const psCommand = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${action.value}')"`;
    exec(psCommand);
  } else if (action.type === 'mouse') {
    const psCommand = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${action.x}, ${action.y})"`;
    exec(psCommand);
  }
});
