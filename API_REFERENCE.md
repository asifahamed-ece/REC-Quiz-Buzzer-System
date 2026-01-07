# 🔌 API REFERENCE - REC QUIZ BUZZER SYSTEM

## Overview

This document describes the communication protocols used in the REC Quiz Buzzer System:
- **ESP-NOW**: Master ↔ Slave communication
- **WebSocket**: Master ↔ Dashboard real-time updates
- **HTTP REST**: Dashboard requests

---

## 📡 ESP-NOW PROTOCOL

### Purpose
Wireless communication between Master ESP32 and Slave ESP32 units.

### Configuration
```cpp
#define WIFI_CHANNEL 1          // WiFi channel
#define MAX_TEAMS 10            // Maximum slave units
#define HEARTBEAT_TIMEOUT 5000  // 5 seconds
```

### Data Structure

**BuzzerData (Slave → Master)**

```cpp
typedef struct {
  int teamID;              // 1-10 (Team identification)
  unsigned long timestamp; // microseconds (precise timing)
  bool buttonPressed;      // true if button pressed
  bool isHeartbeat;        // true if heartbeat signal
  int batteryZone;         // 2=GREEN, 1=YELLOW, 0=RED
  float batteryPercent;    // 0-100%
} BuzzerData;
```

**Example Message:**
```json
{
  "teamID": 3,
  "timestamp": 1234567890,
  "buttonPressed": true,
  "isHeartbeat": false,
  "batteryZone": 2,
  "batteryPercent": 95.5
}
```

### Message Types

#### 1. Heartbeat Message (Every 500ms)
```cpp
// Sent continuously to keep connection alive
data.teamID = 3;
data.timestamp = micros();
data.buttonPressed = false;
data.isHeartbeat = true;        // ← Heartbeat flag
data.batteryZone = 2;
data.batteryPercent = 95.5;
```

**Purpose:**
- Keep master informed of slave's status
- Maintain battery level tracking
- Detect disconnections
- Monitor WiFi signal strength

**Timeout:** Slave considered disconnected if no heartbeat for 5 seconds

#### 2. Button Press Message (On button click)
```cpp
// Sent when user presses button
data.teamID = 3;
data.timestamp = micros();      // Exact moment of press
data.buttonPressed = true;      // ← Button pressed flag
data.isHeartbeat = false;
data.batteryZone = 2;
data.batteryPercent = 95.5;
```

**Behavior:**
- Only processed if Master is in READY mode
- Ignored if already responded in this round
- Response time measured to microsecond
- Faster response = higher ranking

### Battery Levels

```
ZONE 2 (GREEN):    100% - 60%  🔋
ZONE 1 (YELLOW):   60% - 40%   ⚠️
ZONE 0 (RED):      Below 40%   🪫
```

**Dashboard Indication:**
- Green = Fully charged, good to go
- Yellow = Low battery warning
- Red = Critical, may disconnect soon

### ESP-NOW Timing

```
Master sends beacon every 1 second
Slaves heartbeat every 500ms
Button response time: <1ms
Master-Slave latency: <5ms
```

---

## 🌐 WEBSOCKET PROTOCOL

### Purpose
Real-time communication between Master and Dashboard (web browsers).

### Connection

**URL:**
```
ws://192.168.4.1/ws
```

**Port:** 80 (same as HTTP)

**Connection Flow:**
```
Dashboard (Browser)
    ↓
    [1] WebSocket handshake
    ↓
Master ESP32
    ↓
    [2] Connected confirmation
    ↓
    [3] Initial data sent
    ↓
    [4] Real-time updates (every message change)
```

### Message Format

**Master → Dashboard (JSON)**

All messages are JSON objects containing:

```json
{
  "teams": [
    {
      "id": 1,
      "connected": true,
      "zone": 2,
      "percent": 95.5
    },
    {
      "id": 2,
      "connected": false,
      "zone": -1,
      "percent": 0
    }
  ],
  "winnerTeam": 3,
  "winnerTime": 1.234567,
  "responses": [
    {
      "position": 1,
      "team": 3,
      "time": 1.234567
    },
    {
      "position": 2,
      "team": 5,
      "time": 1.456789
    }
  ],
  "connectedCount": 8,
  "greenCount": 7,
  "yellowCount": 1,
  "redCount": 0,
  "responseCount": 2,
  "quizActive": true,
  "channel": 1
}
```

### Field Descriptions

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| `teams[].id` | int | 1-10 | Team number |
| `teams[].connected` | bool | - | Online status |
| `teams[].zone` | int | 0-2 | Battery zone |
| `teams[].percent` | float | 0-100 | Battery % |
| `winnerTeam` | int | 0-10 | 0 = none, 1-10 = team |
| `winnerTime` | float | - | Response time (seconds) |
| `responses[]` | array | - | All responses in order |
| `responses[].position` | int | 1-10 | Response rank |
| `responses[].team` | int | 1-10 | Team ID |
| `responses[].time` | float | - | Response time (sec) |
| `connectedCount` | int | 0-10 | Teams connected |
| `greenCount` | int | 0-10 | Green battery teams |
| `yellowCount` | int | 0-10 | Yellow battery teams |
| `redCount` | int | 0-10 | Red battery teams |
| `responseCount` | int | 0-10 | Total responses |
| `quizActive` | bool | - | READY mode? |
| `channel` | int | 1 | WiFi channel |

### Update Frequency

**Priority Updates (Immediate):**
- Button press detected
- Winner announced
- Phase change (LISTEN ↔ READY)
- New response received

**Safe Updates (Max 1/second):**
- Team connection status
- Battery level changes
- Heartbeat information

### JavaScript Client Example

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://192.168.4.1/ws');

// Connection established
ws.onopen = (event) => {
  console.log('Connected to Master');
};

// Receive data
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  // Update UI with data
  updateTeamStatus(data.teams);
  updateWinner(data.winnerTeam);
  updateResponses(data.responses);
  updateBattery(data.greenCount, data.yellowCount, data.redCount);
};

// Handle disconnection
ws.onclose = (event) => {
  console.log('Disconnected from Master');
};

// Error handling
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

---

## 🔄 SYSTEM STATES

### Two-Phase System

**LISTEN Phase:**
```
quizActive = false

Characteristics:
- Question is being read
- Slave buzzers ignored
- Dashboard shows "READY" waiting message
- Master OLED: "LISTEN ?"

Transition: Press RESET button → READY Phase
```

**READY Phase:**
```
quizActive = true

Characteristics:
- Waiting for responses
- Slave buzzers processed
- First response = WINNER
- Master OLED: "READY"

Transition: Press RESET button → LISTEN Phase
```

### State Transitions

```
LISTEN (Initial)
    ↓ [Press RESET]
READY
    ↓ [First buzz received]
ANSWERED (Winner shown)
    ↓ [Press RESET]
LISTEN (Cycle repeats)
```

---

## 📊 BATTERY MONITORING

### Algorithm

```cpp
// Slave measures battery voltage
float voltage = analogRead(BATTERY_PIN) * (3.3 / 4095);

// Convert to percentage (linear approximation)
float percent = (voltage - 3.0) / (4.2 - 3.0) * 100;

// Determine zone
int zone = 2;  // default GREEN
if (percent < 60) zone = 1;   // YELLOW
if (percent < 40) zone = 0;   // RED
```

### Three-Zone System

| Zone | Color | Percent | Status | Action |
|------|-------|---------|--------|--------|
| 2 | 🟢 GREEN | 100-60% | Optimal | Ready to use |
| 1 | 🟡 YELLOW | 60-40% | Warning | Low battery warning |
| 0 | 🔴 RED | <40% | Critical | May disconnect soon |

### Master Tracking

```cpp
// Master maintains battery status for all teams
int teamBatteryZone[MAX_TEAMS];      // 0, 1, or 2
float teamBatteryPercent[MAX_TEAMS]; // 0-100%

// Updated on every heartbeat from slave
```

### Dashboard Display

**Right Panel - Battery Indicators:**
```
🔋 GREEN: 100-60%
  - Displays count and team IDs
  
⚠️ YELLOW: 60-40%
  - Displays count and team IDs
  - Warning indicator
  
🪫 RED: Below 40%
  - Displays count and team IDs
  - Critical alert
```

---

## ⏱️ TIMING & RESPONSE CALCULATION

### Timestamp Units

```cpp
// ESP32 uses microseconds
unsigned long timestamp = micros();  // Returns microseconds since boot

// Dashboard converts to seconds for display
time_in_seconds = timestamp / 1000000.0;
```

### Response Time Calculation

```cpp
// Master receives button press from slave
unsigned long slaveTimestamp = incomingData.timestamp;
unsigned long masterTime = micros();

// Response time = Master's current time - Slave's timestamp
unsigned long responseTime = masterTime - slaveTimestamp;

// Display as seconds
float displayTime = responseTime / 1000000.0;  // Convert to seconds
```

### Example

```
Slave presses button at: 1234567890 μs
Master receives at:      1234567895 μs
Response time:           5 μs (0.000005 seconds)
Display: "5 μs" or "0.000005 sec"
```

### Ranking

```
1st Response: Fastest time
2nd Response: 2nd fastest time
...
10th Response: Slowest time

Example:
Position 1: Team 3 @ 1.234567 sec
Position 2: Team 5 @ 1.456789 sec
Position 3: Team 2 @ 1.678901 sec
```

---

## 🎯 HTTP REST ENDPOINTS

### Static Files

**GET /index.html**
```
Response: HTML dashboard file
Content-Type: text/html
Status: 200 OK
```

**GET /style.css**
```
Response: CSS stylesheet
Content-Type: text/css
Status: 200 OK
```

**GET /script.js**
```
Response: JavaScript file
Content-Type: application/javascript
Status: 200 OK
```

**GET /favicon.ico**
```
Response: (no content)
Status: 204 No Content
```

---

## 🔐 SECURITY NOTES

**Current Implementation:**
- No authentication (local network only)
- No encryption on ESP-NOW
- WiFi password: `12345678` (weak)

**Production Recommendations:**
1. Change WiFi password to strong value
2. Add authentication to WebSocket
3. Implement HTTPS/WSS
4. Validate all input data
5. Rate limiting on requests

---

## 📈 BANDWIDTH USAGE

### Master → Slaves (ESP-NOW)

**Per Message:**
- Struct size: ~20 bytes
- Heartbeat frequency: 0.5 Hz (2 seconds apart)
- Button press: 1 event per round

**Estimated Bandwidth:**
```
Heartbeat: 10 slaves × 20 bytes × 2/sec = 400 bytes/sec
Button: 10 teams × 20 bytes × ~1/10sec = 20 bytes/sec
Total: ~420 bytes/sec ≈ 3.36 Kbps
```

### Master → Dashboard (WebSocket)

**Per Message:**
- JSON size: ~500 bytes (typical)
- Update frequency: varies (1-10 updates/sec)

**Estimated Bandwidth:**
```
Conservative: 1 update/sec × 500 bytes = 500 bytes/sec
Active round: 10 updates/sec × 500 bytes = 5000 bytes/sec
Total: ~0.5-5 Kbps
```

---

## 🧪 TESTING ENDPOINTS

### Manual ESP-NOW Test

```cpp
// Send test data from slave
BuzzerData testData;
testData.teamID = 1;
testData.timestamp = micros();
testData.buttonPressed = true;
testData.isHeartbeat = false;
testData.batteryZone = 2;
testData.batteryPercent = 95.5;

esp_now_send(masterMAC, (uint8_t *)&testData, sizeof(testData));
```

### Manual WebSocket Test

```bash
# Using wscat tool
npm install -g wscat

# Connect to master
wscat -c ws://192.168.4.1/ws

# You'll receive JSON updates in real-time
```

### Dashboard Test

```javascript
// Open browser console (F12)
// Check WebSocket connection
console.log(ws.readyState);  // 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED

// Check latest data
console.log(lastReceivedData);

// Manually trigger update
ws.send('{"test": true}');
```

---

## 📞 DEBUGGING

### Master Serial Output

```
📡 PRIORITY Broadcast → quizActive=TRUE | Winner=3 | Clients=1
📡 Broadcast → 1 clients
📡 No changes detected
⏳ Broadcast throttled (non-critical)
🔌 WebSocket client #1 connected
🔌 WebSocket client #1 disconnected
```

### Dashboard Console

```javascript
// WebSocket events
WS Connected: ws://192.168.4.1/ws
WS Received: {"teams": [...], "quizActive": true}
WS Disconnected: code=1000
WS Error: Network error

// UI updates
Team 3 connected
Winner: Team 3 (1.234567 sec)
Response #2: Team 5
Battery: 7🔋 1⚠️ 0🪫
```

---

## 📚 RELATED DOCUMENTATION

- **README.md**: Project overview
- **HARDWARE_SETUP.md**: Hardware assembly
- **SOFTWARE_SETUP.md**: Software installation
- **TROUBLESHOOTING.md**: Common issues

---

**Made with ❤️ by Asif Ahamed S**  
**Rajalakshmi Engineering College, Chennai**  
**Version 1.0 - January 2026**
