# 📋 SOFTWARE SETUP GUIDE - REC QUIZ BUZZER SYSTEM

## 🎯 Quick Overview

This guide covers setting up the **Master ESP32 firmware**, **Slave ESP32 firmware**, and **Web Dashboard** for the REC Quiz Buzzer System.

**System Architecture:**
```
Master ESP32 (AP)  ←→ [ESP-NOW] ←→ 10× Slave ESP32 (Clients)
      ↓
   Web Dashboard (WebSocket)
      ↓
   Live Monitoring & Control
```

---

## 📋 PREREQUISITES

### Hardware Requirements
- **Master Unit:** ESP32 DevKit + OLED 128x64 + 3× LEDs + Reset Button + Power Switch
- **Slave Units:** 10× ESP32 DevKit + Buttons + LEDs (each)
- **USB Cables:** For programming ESP32s
- **Power Supply:** 5V for all units

### Software Requirements
- **PlatformIO IDE** (recommended) or **Arduino IDE**
- **Git** (for version control)
- **USB Drivers:** CH340/CP2102 for ESP32

---

## 🔧 INSTALLATION STEPS

### STEP 1: Install PlatformIO

**Option A: PlatformIO Extension (Recommended)**
1. Install VS Code: https://code.visualstudio.com
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X)
4. Search "PlatformIO"
5. Click Install on "PlatformIO IDE"
6. Restart VS Code
7. ✅ PlatformIO ready!

**Option B: Arduino IDE**
1. Download: https://www.arduino.cc/en/software
2. Install
3. Go to Tools → Board → Boards Manager
4. Search "ESP32"
5. Install "esp32 by Espressif Systems"
6. ✅ Arduino ready!

---

### STEP 2: Create Project Structure

```bash
mkdir REC-Quiz-Buzzer-System
cd REC-Quiz-Buzzer-System

# Create folders
mkdir -p firmware/{master,slave}/src
mkdir -p dashboard/data
mkdir -p docs
```

---

### STEP 3: Master ESP32 Setup

#### 3.1 Create Master Project

**Using PlatformIO:**
```bash
cd firmware/master

# platformio.ini content:
[env:esp32doit-devkit-v1]
platform = espressif32
board = esp32doit-devkit-v1
framework = arduino
upload_speed = 921600
monitor_speed = 115200

lib_deps =
    ESP-NOW
    WiFi
    ESPAsyncWebServer
    AsyncTCP
    ArduinoJson
    LittleFS
    Wire
    Adafruit GFX Library
    Adafruit SSD1306
```

#### 3.2 Copy Master Code

1. Place your Master firmware code in `src/main.cpp`
2. Code features:
   - **WiFi AP Mode**: Creates network for dashboard
   - **ESP-NOW**: Receives data from slaves
   - **OLED Display**: Shows system status
   - **WebSocket Server**: Real-time dashboard updates
   - **Two-Phase System**: LISTEN ↔ READY modes
   - **Battery Monitoring**: 3-zone system

#### 3.3 Pin Configuration

```cpp
#define RESET_BUTTON 13     // GPIO 13
#define LED_WINNER 2        // GPIO 2
#define LED_SYNC 15         // GPIO 15
#define LED_READY 16        // GPIO 16
#define POWER_SWITCH 25     // GPIO 25

// OLED: SDA=GPIO 21, SCL=GPIO 22 (I2C)
```

#### 3.4 Upload Master Code

**Using PlatformIO:**
```bash
# Plug in Master ESP32
pio run -t upload
pio device monitor  # View serial output
```

**Expected Output:**
```
✅ LittleFS initialized!
✅ ESP-NOW initialized
🌐 WebSocket server started!
📢 Starting in LISTEN mode
```

---

### STEP 4: Slave ESP32 Setup

#### 4.1 Create Slave Project

**platformio.ini:**
```ini
[env:esp32doit-devkit-v1]
platform = espressif32
board = esp32doit-devkit-v1
framework = arduino
upload_speed = 921600
monitor_speed = 115200

lib_deps =
    ESP-NOW
    WiFi
```

#### 4.2 Copy Slave Code

1. Place slave firmware code in `firmware/slave/src/main.cpp`
2. Code features:
   - **ESP-NOW**: Connects to master
   - **Button Input**: Detects button press
   - **Battery Monitoring**: Reports battery level
   - **LED Feedback**: Shows connection & ready status
   - **Team ID**: Configurable per slave

#### 4.3 Slave Configuration

Before uploading, set **Team ID** in slave code:

```cpp
#define TEAM_ID 1  // Set 1-10 for each slave

// Button & LED pins
#define BUTTON_PIN 33      // Button GPIO
#define STATUS_LED 25      // Status LED GPIO
#define READY_LED 26       // Ready LED GPIO
```

#### 4.4 Upload Slave Code to Each Unit

```bash
cd firmware/slave

# For each slave:
# 1. Edit TEAM_ID (1-10)
# 2. Upload
pio run -t upload
pio device monitor
```

**Repeat for 10 slaves** (Team 1 through Team 10)

---

### STEP 5: Dashboard Setup

#### 5.1 File Structure

```
dashboard/data/
├── index.html      (Your dashboard HTML)
├── style.css       (Your dashboard CSS)
└── script.js       (Your dashboard JavaScript)
```

#### 5.2 Copy Dashboard Files

1. **index.html**: Paste your HTML code
2. **style.css**: Paste your CSS code
3. **script.js**: Paste your JavaScript code

#### 5.3 Key Dashboard Features

**HTML Elements:**
- Audio toggle button (top right)
- Team status panel (left)
- Winner display (center)
- System info panel (right)
- Confetti animation
- Response list

**CSS Styling:**
- Dark theme (#0a0e27 background)
- Gradient panels
- Animations (breathe, pulse, confetti-fall)
- Responsive grid layout
- Color schemes:
  - LISTEN: Orange (#ff8800)
  - READY: Pink/Red (#f5576c)
  - WINNER: Green (#38ef7d)

**JavaScript Features:**
- WebSocket connection
- Real-time updates
- Audio toggle
- Battery monitoring
- Team status tracking
- Confetti animation

---

## 🚀 TESTING THE SYSTEM

### Test 1: Hardware Connection

1. Power on Master ESP32
2. Watch OLED display
3. Should show: "LISTEN", "CH:1", "Teams: 0/10"

### Test 2: Slave Connection

1. Power on Slave Unit 1
2. Serial output: "✅ Team 1 connected!"
3. Master OLED: "Teams: 1/10"

### Test 3: Dashboard Access

1. Open browser
2. Go to: **http://192.168.4.1**
3. Should see:
   - Header: "REC QUIZ BUZZER SYSTEM"
   - Left panel: Team status
   - Center: "READY" display
   - Right: System info
   - Audio toggle button (top-right)

### Test 4: System Phases

**LISTEN Mode:**
- Master OLED: "LISTEN ?"
- Dashboard center: "READY" (standing by)
- Slave presses button: **IGNORED**

**READY Mode:**
1. Press Reset button on Master
2. Master OLED: "READY"
3. Slave presses button: **BUZZER REGISTERED**
4. First to press: Winner display shows (green gradient)
5. Dashboard updates with response order

### Test 5: Complete Quiz Round

1. **LISTEN Phase**: Reading question
   - Slaves cannot buzz
   - Master displays orange "LISTEN ?"
   
2. **Press Reset** → READY Phase
   - Master displays pink "READY"
   - Teams can now buzz
   
3. **Team Buzzes**
   - First team's button press registered
   - LED lights on master
   - Dashboard shows: WINNER + Team ID
   - Confetti animation
   - Audio plays (if enabled)
   
4. **All teams respond** (within 200ms window)
   - Response order list updates
   - Shows position, team, response time
   
5. **Press Reset** → Back to LISTEN
   - Clears winner
   - Resets for next question
   - Back to orange "LISTEN ?"

---

## 📡 NETWORK CONFIGURATION

### WiFi Details

**Master AP:**
```
SSID: QuizBuzzer_AP
Password: 12345678
IP: 192.168.4.1
Channel: 1
```

**To Connect:**
1. Phone/Laptop WiFi settings
2. Find "QuizBuzzer_AP"
3. Enter password "12345678"
4. Open browser → 192.168.4.1

### ESP-NOW Configuration

```cpp
#define WIFI_CHANNEL 1          // Must match master
#define MAX_TEAMS 10            // Maximum 10 slaves
#define HEARTBEAT_TIMEOUT 5000  // 5 seconds
#define BATCH_WINDOW 200        // 200ms response batching
```

---

## 🔌 SERIAL DEBUG OUTPUT

### Master Console Typical Output

```
╔═══════════════════════════════════════════╗
║  REC QUIZ BUZZER - TWO PHASE SYSTEM      ║
╚═══════════════════════════════════════════╝
🟢 Starting system...
📡 AP IP: 192.168.4.1
🔑 MAC: AA:BB:CC:DD:EE:FF
✅ ESP-NOW initialized
🌐 WebSocket server started!
   URL: http://192.168.4.1

📢 Starting in LISTEN mode
   Press RESET to enter READY mode

✅ Team 1 connected! | Battery: 100% (🔋 GREEN)
✅ Team 2 connected! | Battery: 98% (🔋 GREEN)
...
===================================
🏆 FIRST TO BUZZ: Team 3
⏱️  Timestamp: 1234567890 μs
===================================
📝 Response #1: Team 3
📝 Response #2: Team 5
```

### Slave Console Typical Output

```
🔇 Sound OFF
📡 ESP-NOW Initialized
🔍 Scanning for master AP...
✅ Master found! Connecting...
🔗 Connected to Quiz Buzzer AP
🎯 Team ID: 3
📡 Sending heartbeat...
✅ Connected to master
```

---

## ⚙️ TROUBLESHOOTING

### Problem: Master doesn't show up

**Solution:**
- Check OLED connection (SDA=21, SCL=22)
- Verify power supply
- Check USB cable connection
- Try uploading again

### Problem: Slaves can't connect

**Solution:**
- Check WiFi channel (must be 1)
- Verify Team IDs are 1-10
- Check SSID: "QuizBuzzer_AP"
- Restart master first, then slaves

### Problem: Dashboard won't load

**Solution:**
1. Check IP: http://192.168.4.1
2. Verify connected to "QuizBuzzer_AP"
3. Check browser console (F12) for errors
4. Try different browser
5. Clear cache

### Problem: Slave button not responding

**Solution:**
- Check button pin connection
- Verify READY mode is active
- Check serial output for team connection
- Test with slave's serial monitor
- Verify battery level (not below 40%)

### Problem: Response order incorrect

**Solution:**
- Check master's timestamp accuracy
- Verify all slaves' clocks sync
- Check ESP-NOW range
- Test with shorter distances first

---

## 📊 PERFORMANCE MONITORING

### Check Master Status

```bash
# View real-time serial output
pio device monitor --baud 115200

# Look for:
# ✅ Team connections
# 📡 WebSocket clients
# 📝 Response tracking
# 🪫 Battery status
```

### Check Slave Status

```bash
# Connect each slave to monitor
# Look for:
# 🔗 Connected to master
# 📡 Heartbeat sent
# 🔋 Battery level
# ✅ Ready for buzzing
```

### Dashboard Monitoring

- **Left Panel**: Team online/offline status
- **Right Panel**: Battery health (Green/Yellow/Red)
- **Center**: Response order in real-time
- **Top Right**: Audio toggle status

---

## 🎯 NEXT STEPS

1. ✅ Upload all code (Master + 10 Slaves)
2. ✅ Connect to dashboard
3. ✅ Run test quiz rounds
4. ✅ Monitor battery levels
5. ✅ Test audio feedback
6. ✅ Run full competition

---

## 📞 SUPPORT

- **Serial Monitor**: Best for debugging
- **Dashboard**: Monitor real-time status
- **GitHub Issues**: Report problems
- **Documentation**: See README.md

---

**Made with ❤️ by Asif Ahamed S**  
**Rajalakshmi Engineering College, Chennai**  
**2026**
