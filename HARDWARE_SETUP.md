# 🛠️ Hardware Setup Guide

## Master Unit Assembly

### Components Required

```
1x ESP32 DevKit (30-pin)
1x OLED Display (0.96" I2C - SSD1306)
1x Push Button (Momentary SPST)
1x Toggle Switch (SPST)
1x 5V Buzzer (Active)
3x LEDs (Red, Green, Blue - 5mm)
3x 220Ω Resistors (LED current limiting)
2x 10kΩ Resistors (Pull-down)
1x Breadboard or PCB
1x 5V Power Supply (2A rated)
Jumper wires (M-F and M-M)
```

### Pinout Configuration

#### ESP32 Master Pins
```
GPIO 13 (D13) → RESET BUTTON
GPIO 2  (D2)  → LED_WINNER (Red)
GPIO 15 (D15) → LED_SYNC (Green)
GPIO 16 (D16) → LED_READY (Blue)
GPIO 25 (D25) → POWER SWITCH
GPIO 27 (D27) → BUZZER
SDA (GPIO 21) → OLED SDA
SCL (GPIO 22) → OLED SCL
GND           → OLED GND
3.3V          → OLED VCC
```

### Wiring Diagram

```
┌─────────────────────────────────────────────────┐
│              ESP32 DevKit                       │
│                                                 │
│  GPIO13 ─────────┐                             │
│                  ├─→ Reset Button              │
│  GND ────────────┘                             │
│                                                 │
│  GPIO2 ───[220Ω]─→ LED_WINNER (Red)           │
│  GPIO15 ──[220Ω]─→ LED_SYNC (Green)           │
│  GPIO16 ──[220Ω]─→ LED_READY (Blue)           │
│  GND ────────────→ LEDs GND                    │
│                                                 │
│  GPIO25 ─────────┐                             │
│                  ├─→ Power Switch              │
│  GND ────────────┘                             │
│                                                 │
│  GPIO27 ─────────→ Buzzer (+)                  │
│  GND ────────────→ Buzzer (-)                  │
│                                                 │
│  GPIO21 (SDA) ──→ OLED SDA                     │
│  GPIO22 (SCL) ──→ OLED SCL                     │
│  GND ──────────→ OLED GND                      │
│  3.3V ─────────→ OLED VCC                      │
│                                                 │
└─────────────────────────────────────────────────┘

        5V Power Supply
        ├─→ ESP32 5V
        └─→ Buzzer VCC
```

### Assembly Steps

#### 1. Prepare the Breadboard
- Place ESP32 on breadboard center
- Connect power rails (5V and GND)

#### 2. Add OLED Display
```
OLED Connections:
GND  → Breadboard GND rail
VCC  → Breadboard 3.3V rail
SDA  → GPIO21
SCL  → GPIO22
```

#### 3. Add Reset Button
```
Button Connections:
Pin 1 → GPIO13
Pin 2 → GND
```

#### 4. Add Power Switch
```
Switch Connections:
Pin 1 → GPIO25
Pin 2 → GND
```

#### 5. Add LEDs
```
Red LED (Winner):
Anode   → GPIO2 (through 220Ω resistor)
Cathode → GND

Green LED (Sync):
Anode   → GPIO15 (through 220Ω resistor)
Cathode → GND

Blue LED (Ready):
Anode   → GPIO16 (through 220Ω resistor)
Cathode → GND
```

#### 6. Add Buzzer
```
Buzzer Connections:
+ Pin → GPIO27
- Pin → GND
```

---

## Slave Unit Assembly (Repeat for Teams 1-10)

### Components Required (Per Slave)

```
1x ESP32 DevKit (30-pin)
1x Push Button (Momentary SPST)
1x LED (5mm - any color)
1x 220Ω Resistor (LED current limiting)
1x 18650 Li-ion Battery
1x 18650 Battery Holder
Jumper wires
```

### Pinout Configuration

#### ESP32 Slave Pins
```
GPIO 13 (D13) → BUZZER BUTTON
GPIO 2  (D2)  → STATUS LED
GND           → Common Ground
VBAT          → Battery Voltage (for monitoring)
```

### Wiring Diagram (Single Slave)

```
┌──────────────────────────────────────────┐
│          ESP32 DevKit (Slave)            │
│                                          │
│  GPIO13 ──────────┐                      │
│                   ├─→ Buzzer Button      │
│  GND ─────────────┘                      │
│                                          │
│  GPIO2 ───[220Ω]─→ LED (+)              │
│  GND ────────────→ LED (-)              │
│                                          │
│  VBAT ──→ 18650 Battery Positive        │
│  GND  ──→ 18650 Battery Negative        │
│                                          │
└──────────────────────────────────────────┘

    18650 Battery Holder
    ├─→ + to ESP32 VBAT
    └─→ - to ESP32 GND
```

### Portable Case Assembly

**Materials:**
- 3D printed enclosure (or plastic box)
- Velcro strips
- 18650 battery holder
- Cable ties

**Steps:**
1. Mount ESP32 inside case with velcro
2. Attach battery holder at bottom
3. Mount push button on front
4. Attach LED on top (visible indicator)
5. Create ventilation holes for heat dissipation

---

## Testing the Hardware

### Master Unit Test

```
1. Power ON → OLED should display:
   ✓ "REC QUIZ BUZZER"
   ✓ "Initializing..."
   
2. Wait 2 seconds → Should display:
   ✓ "CH: 1"
   ✓ "Teams: 0/10" (waiting for slave units)
   
3. Check LEDs:
   ✓ LED_READY should be OFF
   ✓ LED_SYNC should blink (no teams connected)
   ✓ LED_WINNER should be OFF
   
4. Test Reset Button:
   ✓ Press once → Buzzer sound
   ✓ OLED shows phase change
   
5. Test Buzzer:
   ✓ Should emit sound on phase change
```

### Slave Unit Test

```
1. Power ON → LED should blink
   
2. Within 5 seconds:
   ✓ LED should stay ON (connected to master)
   
3. Test Button:
   ✓ Press → LED blinks
   ✓ Data sent to master
   
4. Power OFF:
   ✓ LED turns OFF
   
5. Power ON again:
   ✓ Reconnects automatically to master
```

---

## Troubleshooting

### Master Won't Boot
```
Solution:
1. Check power supply (5V, 2A minimum)
2. Verify USB cable connection
3. Check OLED I2C address (0x3C)
4. Try uploading "Blink" sketch first
```

### OLED Display Not Showing
```
Solution:
1. Check I2C connections (SDA, SCL)
2. Verify address: 0x3C (use I2C Scanner)
3. Check power to OLED (3.3V)
4. Try different I2C port if available
```

### Slaves Not Connecting
```
Solution:
1. Both units in WIFI_AP_STA mode
2. Both units running ESP-NOW initialized
3. Check firmware version matches
4. Try uploading slave firmware again
5. Restart both units
```

### Reset Button Bouncing
```
Solution:
1. Already handled in firmware (100ms debounce)
2. If still occurs, add 0.1µF capacitor across button pins
3. Update debounce delay in code
```

### Buzzer Not Working
```
Solution:
1. Check GPIO27 connection
2. Test buzzer directly (5V applied)
3. Verify buzzer polarity (+ and -)
4. Try adjusting tone frequency/duration
```

---

## Bill of Materials (BOM)

### Master Unit
| Part | Quantity | Cost (USD) |
|------|----------|-----------|
| ESP32 DevKit | 1 | $8 |
| OLED 0.96" I2C | 1 | $3 |
| Push Button | 1 | $0.50 |
| Toggle Switch | 1 | $1 |
| Buzzer 5V Active | 1 | $2 |
| LEDs (3x) | 3 | $0.50 |
| Resistors | 5 | $0.50 |
| Breadboard | 1 | $3 |
| Power Supply 5V 2A | 1 | $8 |
| Jumper Wires | 1 pack | $2 |
| **Total Master** | | **~$28** |

### Per Slave Unit
| Part | Quantity | Cost (USD) |
|------|----------|-----------|
| ESP32 DevKit | 1 | $8 |
| Push Button | 1 | $0.50 |
| LED | 1 | $0.20 |
| Resistor 220Ω | 1 | $0.10 |
| 18650 Battery | 1 | $3 |
| Battery Holder | 1 | $1 |
| Case/Enclosure | 1 | $3 |
| Jumper Wires | 1 | $1 |
| **Total Per Slave** | | **~$17** |

### Full System (10 Teams)
```
Master Unit:          $28
10 Slave Units:       $170 (10 × $17)
─────────────────────────
Total Cost:           $198 USD
```

---

**✅ Hardware setup complete! Next: Software installation**
