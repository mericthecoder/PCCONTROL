# PCCONTROL - Advanced Remote PC Control

PCCONTROL is a powerful, lightweight, and secure solution designed to turn your smartphone or any web-enabled device into a virtual peripheral controller for your Windows 11 PC. By leveraging real-time communication protocols and system-level input simulation, it provides seamless remote control functionality without the need for complex, heavy-duty remote desktop streaming software.

---

## ✨ Features - Advanced Inputs

PCCONTROL now supports **Touchpad Emulation** directly from your mobile device.

- **Touchpad Area:** A designated area in the web interface captures touch movements on your phone.
- **Real-time Cursor Control:** As you slide your finger across the phone's screen, the corresponding mouse position is calculated and sent to your PC agent, which updates the Windows cursor position in real-time.
- **Low-Latency Feedback:** Using WebSocket events for high-frequency coordinate updates.

---

## 🚀 Concept & Philosophy

The philosophy behind PCCONTROL is **minimalism meets functionality**. Rather than streaming your entire desktop (which consumes massive bandwidth, high latency, and high CPU), PCCONTROL sends lightweight, event-driven commands (key presses, mouse movements) to your PC. 

This approach makes it incredibly fast, responsive, and suitable for low-bandwidth environments.

---

## 🏗️ Architecture

PCCONTROL operates on a **Signaling/Relay Architecture**, ensuring that your local machine—which is behind a home router/firewall—can receive commands from the public internet without exposing your PC's ports directly.

### Components:
1.  **Signaling Server (`/server`):** The central hub hosted on the cloud (e.g., Render.com). It mediates the connection between the phone (controller) and the PC (agent). It runs on Node.js using Socket.io.
2.  **Windows Agent (`/agent`):** A lightweight background service running on your local Windows 11 machine. It connects to the Signaling Server via a secure WebSocket and listens for incoming control events. It translates these events into native Windows HID (Human Interface Device) actions.
3.  **Client/Controller (`/client`):** The interface loaded in your phone's web browser. It provides the UI to input the authentication PIN and send control commands.

### Diagram:
`[Phone/Browser]` -> `(WebSocket / HTTPS)` -> `[Signaling Server (Render)]` -> `(WebSocket)` -> `[PC Agent (Windows 11)]` -> `(OS API Simulation)` -> `[Target App/OS]`

---

## 🔒 Security & Authentication

Security is not an afterthought; it is a fundamental requirement.

- **PIN-Based Authentication:** Before any action can be taken, the client must authenticate with the server using a predefined, hardcoded PIN.
- **WebSocket Security:** The connection between all components is established via WebSockets, supporting secure transmission.
- **Access Control:** The signaling server maintains a list of authenticated sessions. Any attempt to send a command without a valid, authenticated session ID is immediately rejected.
- **HID Simulation:** The Windows Agent uses safe, system-level APIs (`System.Windows.Forms`) to simulate input. It does not allow arbitrary code execution—it only accepts specific, structured command objects.

---

## 📋 Prerequisites

To run and deploy this project, you need:
1.  **Node.js:** (v18 or higher recommended) installed on your local development machine and your Windows 11 PC.
2.  **GitHub Account:** To host the repository.
3.  **Render.com Account:** For deploying the signaling server.
4.  **Local Network Access:** For testing purposes during initial development.

---

## 🛠️ Setup & Installation Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/mericthecoder/PCCONTROL.git
cd PCCONTROL
```

### Step 2: Server Setup (`/server`)
1.  Navigate to the `/server` folder.
2.  Install dependencies: `npm install`.
3.  Ensure the `index.js` server is configured with the correct environment variables (if any).
4.  Start locally: `node index.js`.

### Step 3: Agent Setup (`/agent`)
1.  Navigate to the `/agent` folder.
2.  Install dependencies: `npm install`.
3.  Configure the `serverURL` inside `index.js` to point to your hosted Signaling Server (or `http://localhost:3000` for local dev).
4.  Run the agent: `node index.js`.

### Step 4: Client Usage (`/client`)
1.  The client is served by the `/server`. Access it via `http://localhost:3000`.
2.  Enter your PIN (`1234` by default).
3.  Click buttons to test mouse and keyboard inputs.

---

## 🌍 Deployment to Render.com

To host the Signaling Server publicly:
1.  **Create a New Service:** In Render dashboard, select "New Web Service".
2.  **Connect Repo:** Link your `mericthecoder/PCCONTROL` repository.
3.  **Configuration:**
    - **Root Directory:** `server`
    - **Build Command:** `npm install`
    - **Start Command:** `node index.js`
4.  **Environment Variables:** Ensure `PORT` is correctly handled.
5.  **Finalize:** After successful deployment, update your `client/index.html` and `agent/index.js` to use the new `https://your-app-name.onrender.com` URL.

---

## 🔍 Troubleshooting & Debugging

| Issue | Potential Cause | Solution |
| :--- | :--- | :--- |
| Agent not connecting | Wrong Server URL | Verify URL in `/agent/index.js`. |
| Auth failing | Incorrect PIN | Check `VALID_PIN` in `/server/index.js`. |
| No mouse movement | PowerShell restriction | Ensure execution policies allow script execution. |
| Server crashing | Port conflict | Change `PORT` in `index.js`. |

---

---

## ✨ Features - Advanced HID Mapping

PCCONTROL now supports **Extended HID Mapping**, providing a virtual keyboard interface for common operations.

- **Standard Key Support:** Added support for essential keys like `Backspace`, `Esc`, `Enter`, and commonly used combinations like `Ctrl+C` and `Ctrl+V`.
- **Flexible Command System:** The agent uses PowerShell's `SendKeys` which natively supports many key combinations, allowing for easy expansion of supported shortcuts in the future.

---

---

## ✨ Features - Multi-Agent Support

PCCONTROL now supports connecting multiple PCs simultaneously to a single instance of the signaling server.

- **Agent Identification:** Each agent automatically registers with a unique name upon connecting.
- **Dynamic Agent Listing:** The client interface dynamically fetches and displays a list of all currently online agents.
- **Targeted Control:** Users can select a specific target PC from the dropdown list in the controller UI, ensuring commands are routed only to the intended device.

---

## ✨ Features - Native Desktop Client

PCCONTROL now includes an Electron-based native desktop application for the controller interface, providing a more integrated experience than a browser-based controller.

- **Desktop Experience:** Run PCCONTROL as a standalone application on your PC, tablet, or laptop.
- **Cross-Platform:** Built with Electron to work seamlessly across Windows, macOS, and Linux.

---

## ✨ Features - Hardware HID Support

PCCONTROL now supports **Hardware HID Integration**.

- **Serial Communication:** The agent is now equipped with the `serialport` library to send control commands directly to external microcontroller devices (e.g., Arduino, Raspberry Pi Pico) acting as physical USB HID devices.
- **Hybrid Input:** The system supports a hybrid approach, allowing you to use both software-level OS API control and hardware-level emulation for maximum flexibility and compatibility.

---

## 🛠️ Hardware Setup (Optional)

If you are using an external microcontroller (e.g., Arduino) for hardware HID:

1.  **Identify your COM Port:** Run the included port lister script:
    ```bash
    cd agent
    node list-ports.js
    ```
2.  **Configure:** Note the correct `Path` (e.g., `COM3`) from the output. Update the `agent/config.json` file with this port:
    ```json
    {
      "port": "COM3",
      "baudRate": 9600
    }
    ```
3.  **Restart Agent:** Restart the agent script (`node index.js`).

---

## 🛣️ Future Development Roadmap

- [x] **Advanced Input:** Support for touch gestures on mobile (swipes, pinch-to-zoom).
- [x] **Configurable PIN:** Move PIN to a secure environment variable.
- [x] **Full HID Mapping:** Implement comprehensive support for keyboard shortcuts and advanced mouse buttons.
- [x] **Multi-Agent Support:** Allow connecting multiple PCs and switching between them in the UI.
- [x] **Native App Wrappers:** Create Electron/Tauri versions of the client for a better experience.
- [x] **Hardware HID:** Experiment with Node-HID for true USB emulation.
- [x] **Authentication:** OAuth2/Auth0 integration for secure user management.
- [ ] **Performance:** WebRTC for low-latency streaming.
- [ ] **Security:** Two-Factor Authentication (2FA) for sensitive actions.
- [ ] **Monitoring:** Add live dashboard for monitoring agent status (CPU/RAM).
- [ ] **Voice Control:** Integrate speech-to-text for voice-activated commands.
- [ ] **Macro Engine:** Allow recording and playback of complex macro sequences.

---

## 📜 License

This project is open-source. Please use it responsibly for legitimate purposes only.
