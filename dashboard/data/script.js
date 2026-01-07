// ═══════════════════════════════════════════════════════════
// 🎵 BGM CONFIGURATION
// ═══════════════════════════════════════════════════════════

const BGM_CHOICE = 2;  // Quiz Show Loop

// ═══════════════════════════════════════════════════════════
// 🔊 AUDIO FEEDBACK SYSTEM
// ═══════════════════════════════════════════════════════════

let audioContext = null;
let lastResponseCount = 0;
let seenTeams = new Set();
let audioEnabled = false;

// BGM control variables
let bgmOscillators = [];
let bgmGainNodes = [];
let bgmInterval = null;
let bgmPlaying = false;

// Phase tracking
let currentPhase = "LISTEN";  // Start in LISTEN mode
let previousWinner = 0;
let previousResponseCount = 0;

// Initialize audio context
function initAudio() {
  if(!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('🔊 Audio context created');
  }
  
  if(audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log('🔊 Audio context resumed');
    });
  }
}

// Toggle audio on/off
function toggleAudio() {
  if(!audioContext) {
    initAudio();
  }
  
  audioEnabled = !audioEnabled;
  updateAudioButton();
  
  if(audioEnabled) {
    console.log('✅ Audio ENABLED');
    playBuzzerSound();
  } else {
    console.log('🔇 Audio DISABLED');
    stopBGM();
  }
}

// Update button appearance
function updateAudioButton() {
  const btn = document.getElementById('audio-toggle-btn');
  const icon = document.getElementById('audio-icon');
  const text = document.getElementById('audio-text');
  
  if(audioEnabled) {
    btn.style.background = '#00ff00';
    btn.style.color = '#000';
    icon.textContent = '🔊';
    text.textContent = 'Sound ON';
  } else {
    btn.style.background = '#ff3333';
    btn.style.color = '#fff';
    icon.textContent = '🔇';
    text.textContent = 'Sound OFF';
  }
}

// ═══════════════════════════════════════════════════════════
// 🎵 BACKGROUND MUSIC FUNCTIONS (Quiz Show Loop)
// ═══════════════════════════════════════════════════════════

function startBGM() {
  if(!audioContext || !audioEnabled || bgmPlaying) return;
  
  console.log('🎵 Starting BGM (Quiz Show Loop)');
  startBGM_QuizShow();
  bgmPlaying = true;
}

function stopBGM() {
  if(!bgmPlaying) return;
  
  bgmOscillators.forEach(osc => {
    try { osc.stop(); } catch(e) {}
  });
  
  bgmOscillators = [];
  bgmGainNodes = [];
  
  if(bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
  
  bgmPlaying = false;
  console.log('🔇 BGM stopped');
}

function startBGM_QuizShow() {
  const melody = [523.25, 659.25, 783.99, 659.25]; // C-E-G-E
  let noteIndex = 0;
  
  function playNote() {
    if(!audioContext || !audioEnabled) return;
    
    try {
      const now = audioContext.currentTime;
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.type = 'sine';
      osc.frequency.value = melody[noteIndex];
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.4);
      
      bgmOscillators.push(osc);
      bgmGainNodes.push(gain);
      
      noteIndex = (noteIndex + 1) % melody.length;
      
    } catch(e) {
      console.error('BGM error:', e);
    }
  }
  
  playNote();
  bgmInterval = setInterval(playNote, 500);
}

// ═══════════════════════════════════════════════════════════
// 🎮 ARCADE SOUND EFFECTS
// ═══════════════════════════════════════════════════════════

function playBuzzerSound() {
  if(!audioContext || !audioEnabled) return;
  
  try {
    const now = audioContext.currentTime;
    
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.frequency.value = 1000;
    osc1.type = 'square';
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain1.gain.linearRampToValueAtTime(0, now + 0.08);
    osc1.start(now);
    osc1.stop(now + 0.08);
    
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.frequency.value = 700;
    osc2.type = 'square';
    gain2.gain.setValueAtTime(0, now + 0.08);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.09);
    gain2.gain.linearRampToValueAtTime(0, now + 0.18);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.18);
    
    console.log('🎮 Beep-boop!');
  } catch(e) {
    console.error('Audio error:', e);
  }
}

function playResetSound() {
  if(!audioContext || !audioEnabled) return;
  
  try {
    const now = audioContext.currentTime;
    
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.frequency.value = 600;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.4, now + 0.01);
    gain1.gain.linearRampToValueAtTime(0, now + 0.12);
    osc1.start(now);
    osc1.stop(now + 0.12);
    
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.frequency.value = 900;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.4, now + 0.16);
    gain2.gain.linearRampToValueAtTime(0, now + 0.28);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.28);
    
    console.log('🔄 Reset sound played');
  } catch(e) {
    console.error('Reset audio error:', e);
  }
}

function playOnlineSound() {
  if(!audioContext || !audioEnabled) return;
  
  try {
    const now = audioContext.currentTime;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
    
    oscillator.start(now);
    oscillator.stop(now + 0.2);
    
    console.log('⬆️ Power-up! (Team online)');
  } catch(e) {
    console.error('Online sound error:', e);
  }
}

function playOfflineSound() {
  if(!audioContext || !audioEnabled) return;
  
  try {
    const now = audioContext.currentTime;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
    
    oscillator.start(now);
    oscillator.stop(now + 0.3);
    
    console.log('⬇️ Power-down (Team offline)');
  } catch(e) {
    console.error('Offline sound error:', e);
  }
}

function playWinnerSound(teamNumber) {
  if(!audioContext || !audioEnabled) return;
  
  try {
    const now = audioContext.currentTime;
    
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = freq;
      osc.type = 'square';
      
      const startTime = now + (index * 0.15);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.15);
      
      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
    
    console.log('🏆 Victory jingle played!');
    
    setTimeout(() => {
      speakWinner(teamNumber);
    }, 600);
    
  } catch(e) {
    console.error('Winner sound error:', e);
  }
}

function speakWinner(teamNumber) {
  if(!audioEnabled) return;
  
  try {
    if('speechSynthesis' in window) {
      let voices = window.speechSynthesis.getVoices();
      
      if(voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          speakWithVoice(teamNumber, voices);
        };
      } else {
        speakWithVoice(teamNumber, voices);
      }
    } else {
      console.warn('⚠️ Speech synthesis not supported');
    }
  } catch(e) {
    console.error('Voice error:', e);
  }
}

function speakWithVoice(teamNumber, voices) {
  try {
    const utterance = new SpeechSynthesisUtterance(`Team ${teamNumber}!`);
    
    let selectedVoice = null;
    
    const femaleEnglishVoices = voices.filter(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.toLowerCase().includes('female') || 
       voice.name.toLowerCase().includes('woman') ||
       voice.name.toLowerCase().includes('girl') ||
       voice.name.toLowerCase().includes('samantha') ||
       voice.name.toLowerCase().includes('victoria') ||
       voice.name.toLowerCase().includes('karen') ||
       voice.name.toLowerCase().includes('zira'))
    );
    
    if(femaleEnglishVoices.length > 0) {
      selectedVoice = femaleEnglishVoices[0];
      console.log('✅ Using female voice:', selectedVoice.name);
    } else {
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
      if(englishVoices.length > 0) {
        selectedVoice = englishVoices[0];
      }
    }
    
    if(selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 1.3;
    utterance.pitch = 1.8;
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
    
    console.log(`🎤 Speaking: "Team ${teamNumber}!"`);
    
  } catch(e) {
    console.error('Voice speak error:', e);
  }
}

// ═══════════════════════════════════════════════════════════
// WebSocket connection
// ═══════════════════════════════════════════════════════════

let ws;
let reconnectInterval;

function connectWebSocket() {
  const wsStatus = document.getElementById('ws-status');
  if(!wsStatus) {
    console.error('ws-status element not found');
    return;
  }
  
  wsStatus.textContent = '⚪ Connecting...';
  wsStatus.style.color = '#ffaa00';
  
  ws = new WebSocket(`ws://${window.location.hostname}/ws`);
  
  ws.onopen = function() {
    console.log('✅ WebSocket connected');
    wsStatus.textContent = '🟢 Live';
    wsStatus.style.color = '#00ff00';
    clearInterval(reconnectInterval);
  };
  
  ws.onmessage = function(event) {
    try {
      const data = JSON.parse(event.data);
      updateDashboard(data);
    } catch(e) {
      console.error('JSON parse error:', e);
    }
  };
  
  ws.onerror = function(error) {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = function() {
    console.log('❌ WebSocket disconnected');
    wsStatus.textContent = '🔴 Reconnecting...';
    wsStatus.style.color = '#ff3333';
    
    if(reconnectInterval) clearInterval(reconnectInterval);
    
    reconnectInterval = setInterval(() => {
      console.log('🔄 Attempting reconnect...');
      connectWebSocket();
    }, 5000);
  };
}

// ═══════════════════════════════════════════════════════════
// Update dashboard with WebSocket data
// ═══════════════════════════════════════════════════════════

let previousTeamStates = {};

function updateDashboard(data) {
  if(!data) {
    console.error('No data received');
    return;
  }
  
  // ═══════════════════════════════════════════════════════════
  // 🎯 SIMPLE PHASE LOGIC
  // ═══════════════════════════════════════════════════════════
  
  const quizActive = data.quizActive || false;
  const hasWinner = data.winnerTeam > 0;
  
  // ✅ DEBUG: Log received data
  console.log(`📡 Received: quizActive=${quizActive}, winner=${data.winnerTeam}, responses=${data.responseCount}`);
  
  // Determine phase based on ESP32 state
  let newPhase = "LISTEN";  // Default
  
  if(!quizActive) {
    newPhase = "LISTEN";    // Quiz not active = LISTEN
  } else if(quizActive && !hasWinner) {
    newPhase = "READY";     // Quiz active, no winner = READY
  } else if(quizActive && hasWinner) {
    newPhase = "ANSWERED";  // Quiz active, winner found = ANSWERED
  }
  
  // Phase changed?
  if(newPhase !== currentPhase) {
    console.log(`🔄 Phase Change: ${currentPhase} → ${newPhase}`);
    
    // LISTEN → READY (Start BGM)
    if(newPhase === "READY" && currentPhase === "LISTEN") {
      startBGM();
      playResetSound();
      console.log('🎵 BGM Started (LISTEN → READY)');
    }
    
    // READY → ANSWERED (Stop BGM)
    if(newPhase === "ANSWERED" && currentPhase === "READY") {
      stopBGM();
      console.log('🏆 BGM Stopped (Winner found)');
    }
    
    // ANY → LISTEN (Stop BGM, clear state)
    if(newPhase === "LISTEN" && currentPhase !== "LISTEN") {
      stopBGM();
      playResetSound();
      seenTeams.clear();
      previousWinner = 0;
      previousResponseCount = 0;
      console.log('🔇 BGM Stopped (Back to LISTEN)');
    }
    
    currentPhase = newPhase;
  }
  
  // ═══════════════════════════════════════════════════════════
  // 🔊 SOUND EFFECTS
  // ═══════════════════════════════════════════════════════════
  
  // Play buzzer sound for new responses
  if(data.responses && Array.isArray(data.responses)) {
    data.responses.forEach(resp => {
      if(resp && resp.team) {
        const teamKey = `T${resp.team}`;
        if(!seenTeams.has(teamKey)) {
          seenTeams.add(teamKey);
          if(currentPhase !== "LISTEN") {
            playBuzzerSound();
            console.log(`🔊 Team ${resp.team} buzzed`);
          }
        }
      }
    });
  }
  
  // Play winner sound
  if(data.winnerTeam > 0 && previousWinner === 0) {
    playWinnerSound(data.winnerTeam);
    triggerConfetti();
  }
  previousWinner = data.winnerTeam;
  
  // ═══════════════════════════════════════════════════════════
  // 📊 UPDATE DISPLAY
  // ═══════════════════════════════════════════════════════════
  
  updateTeamsList(data);
  updateCenterDisplay(data);
  updateResponsesList(data);
  updateInfoPanel(data);
}

// ═══════════════════════════════════════════════════════════
// Update teams list
// ═══════════════════════════════════════════════════════════

function updateTeamsList(data) {
  const teamsContainer = document.getElementById('teams-container');
  if(!teamsContainer || !data.teams || !Array.isArray(data.teams)) return;
  
  teamsContainer.innerHTML = '';
  
  data.teams.forEach(team => {
    const teamKey = `team_${team.id}`;
    const wasConnected = previousTeamStates[teamKey];
    const isConnected = team.connected;
    
    if(wasConnected === false && isConnected === true) {
      playOnlineSound();
      console.log(`✅ Team ${team.id} online`);
    } else if(wasConnected === true && isConnected === false) {
      playOfflineSound();
      console.log(`❌ Team ${team.id} offline`);
    }
    
    previousTeamStates[teamKey] = isConnected;
    
    const teamDiv = document.createElement('div');
    teamDiv.className = 'team-status';
    
    if(isConnected) {
      teamDiv.classList.add('team-connected');
    }
    
    const indicator = document.createElement('div');
    indicator.className = `indicator ${team.connected ? 'online' : 'offline'}`;
    
    const content = document.createElement('div');
    content.style.flex = '1';
    
    const label = document.createElement('div');
    label.className = 'team-label';
    label.textContent = `Team ${team.id}`;
    content.appendChild(label);
    
    if(team.connected) {
      const statusDiv = document.createElement('div');
      statusDiv.style.cssText = 'display:flex; align-items:center; justify-content:space-between; margin-top:2px; font-size:0.75em';
      
      const onlineSpan = document.createElement('span');
      onlineSpan.style.cssText = 'color:#00ff00; font-weight:500';
      onlineSpan.textContent = 'ONLINE';
      
      const batterySpan = document.createElement('span');
      let emoji = '🔋', color = '#00ff00', bg = 'rgba(0, 255, 0, 0.2)';
      if(team.zone === 1) { emoji = '⚠️'; color = '#ffaa00'; bg = 'rgba(255, 170, 0, 0.2)'; }
      else if(team.zone === 0) { emoji = '🪫'; color = '#ff3333'; bg = 'rgba(255, 51, 51, 0.2)'; }
      
      batterySpan.style.cssText = `display:inline-flex; align-items:center; justify-content:center; width:28px; height:20px; border-radius:4px; background:${bg}; border:1px solid ${color}`;
      batterySpan.innerHTML = `<span style='font-size:1.2em'>${emoji}</span>`;
      
      statusDiv.appendChild(onlineSpan);
      statusDiv.appendChild(batterySpan);
      content.appendChild(statusDiv);
    } else {
      const offlineDiv = document.createElement('div');
      offlineDiv.style.cssText = 'font-size:0.7em; color:#ff3333; margin-top:2px; font-weight:500';
      offlineDiv.textContent = 'OFFLINE';
      content.appendChild(offlineDiv);
    }
    
    teamDiv.appendChild(indicator);
    teamDiv.appendChild(content);
    teamsContainer.appendChild(teamDiv);
  });
}

// ═══════════════════════════════════════════════════════════
// Update center display (LISTEN / READY / WINNER)
// ═══════════════════════════════════════════════════════════

function updateCenterDisplay(data) {
  const winnerSection = document.getElementById('winner-section');
  if(!winnerSection) return;
  
  if(currentPhase === "ANSWERED" && data.winnerTeam > 0) {
    const isNewWinner = (data.winnerTeam !== previousWinner || previousWinner === 0);
    const animationClass = isNewWinner ? 'winner-animation' : '';
    
    winnerSection.innerHTML = `
      <div class="winner-box ${animationClass}">
        <div class="title">🎯 FIRST TO BUZZ 🎯</div>
        <div class="team">TEAM ${data.winnerTeam}</div>
        <div class="time">⚡ ${(data.winnerTime || 0).toFixed(2)} ms</div>
      </div>
    `;
  } else if(currentPhase === "LISTEN") {
    winnerSection.innerHTML = `
      <div class="listen-box">
        <div class="text">📢 LISTEN 📢</div>
        <div class="subtitle">Question Being Asked</div>
        <div class="instruction">🤫 No Buzzing Yet 🤫</div>
      </div>
    `;
  } else {
    winnerSection.innerHTML = `
      <div class="ready-box">
        <div class="text">⏳ READY ⏳</div>
        <div class="subtitle">Press Your Buzzer!</div>
      </div>
    `;
  }
}

// ═══════════════════════════════════════════════════════════
// Update responses list
// ═══════════════════════════════════════════════════════════

function updateResponsesList(data) {
  const responsesBox = document.getElementById('responses-box');
  const responsesList = document.getElementById('responses-list');
  const responsesTitle = document.getElementById('responses-title');
  
  if(!responsesBox || !responsesList || !responsesTitle) return;
  
  if(currentPhase === "LISTEN") {
    responsesBox.style.display = 'none';
    return;
  }
  
  if(data.responses && data.responses.length > 0) {
    responsesBox.style.display = 'block';
    responsesTitle.textContent = `📊 RESPONSE ORDER (${data.responses.length})`;
    responsesList.innerHTML = '';
    
    data.responses.forEach((resp, index) => {
      const respDiv = document.createElement('div');
      respDiv.className = resp.position === 1 ? 'response-item first response-slide-in' : 'response-item response-slide-in';
      respDiv.style.animationDelay = `${index * 0.05}s`;
      respDiv.innerHTML = `
        <div class="position">#${resp.position}</div>
        <div class="team">TEAM ${resp.team}</div>
        <div class="time">${(resp.time || 0).toFixed(2)} ms</div>
      `;
      responsesList.appendChild(respDiv);
    });
  } else {
    responsesBox.style.display = 'none';
  }
}

// ═══════════════════════════════════════════════════════════
// Update info panel
// ═══════════════════════════════════════════════════════════

function updateInfoPanel(data) {
  const phaseStatus = document.getElementById('phase-status');
  if(phaseStatus) {
    let phaseText = '📢 LISTEN';
    let phaseColor = '#ff8800';
    
    if(currentPhase === "READY") {
      phaseText = '⏳ READY';
      phaseColor = '#f093fb';
    } else if(currentPhase === "ANSWERED") {
      phaseText = '🏆 ANSWERED';
      phaseColor = '#00ff00';
    }
    
    phaseStatus.textContent = phaseText;
    phaseStatus.style.color = phaseColor;
  }
  
  const connectedCount = document.getElementById('connected-count');
  if(connectedCount) {
    connectedCount.textContent = `${data.connectedCount || 0}/10`;
  }
  
  const statusCounts = document.getElementById('status-counts');
  if(statusCounts) {
    statusCounts.innerHTML = `
      <span style="color:#00ff00">🔋×${data.greenCount || 0}</span>
      <span style="color:#ffaa00">⚠️×${data.yellowCount || 0}</span>
      <span style="color:#ff3333">🪫×${data.redCount || 0}</span>
    `;
  }
  
  const healthElem = document.getElementById('battery-health');
  if(healthElem) {
    let healthText = 'No data';
    let healthColor = '#aaa';
    if(data.redCount > 0) {
      healthText = `⚠️ ${data.redCount} critical`;
      healthColor = '#ff3333';
    } else if(data.yellowCount > 0) {
      healthText = `⚠️ ${data.yellowCount} low`;
      healthColor = '#ffaa00';
    } else if(data.connectedCount > 0) {
      healthText = '✅ All good';
      healthColor = '#00ff00';
    }
    healthElem.textContent = healthText;
    healthElem.style.color = healthColor;
  }
  
  const wifiChannel = document.getElementById('wifi-channel');
  if(wifiChannel) {
    wifiChannel.textContent = data.channel || '1';
  }
  
  const totalResponses = document.getElementById('total-responses');
  if(totalResponses) {
    totalResponses.textContent = data.responseCount || 0;
  }
  
  const statusElem = document.getElementById('system-status');
  if(statusElem) {
    statusElem.textContent = data.quizActive ? '🟢 ACTIVE' : '🔒 LOCKED';
    statusElem.style.color = data.quizActive ? '#00ff00' : '#ffaa00';
  }
}

// ═══════════════════════════════════════════════════════════
// 🎊 CONFETTI ANIMATION
// ═══════════════════════════════════════════════════════════

function triggerConfetti() {
  const confettiContainer = document.getElementById('confetti-container');
  if(!confettiContainer) return;
  
  for(let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.backgroundColor = ['#ff0', '#f0f', '#0ff', '#0f0', '#f00'][Math.floor(Math.random() * 5)];
    confettiContainer.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }
}

// ═══════════════════════════════════════════════════════════
// Initialize on page load
// ═══════════════════════════════════════════════════════════

window.addEventListener('DOMContentLoaded', function() {
  console.log('📊 Dashboard loaded');
  console.log('📢 Forcing LISTEN phase on load');
  
  // ✅ Force LISTEN mode on page load
  currentPhase = "LISTEN";
  
  const winnerSection = document.getElementById('winner-section');
  if(winnerSection) {
    winnerSection.innerHTML = `
      <div class="listen-box">
        <div class="text">📢 LISTEN 📢</div>
        <div class="subtitle">Question Being Asked</div>
        <div class="instruction">🤫 No Buzzing Yet 🤫</div>
      </div>
    `;
  }
  
  // Update phase indicator
  const phaseStatus = document.getElementById('phase-status');
  if(phaseStatus) {
    phaseStatus.textContent = '📢 LISTEN';
    phaseStatus.style.color = '#ff8800';
  }
  
  // Hide responses on load
  const responsesBox = document.getElementById('responses-box');
  if(responsesBox) {
    responsesBox.style.display = 'none';
  }
  
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  if(audioToggleBtn) {
    audioToggleBtn.addEventListener('click', toggleAudio);
  }
  
  connectWebSocket();
  
  console.log('✅ Dashboard initialized in LISTEN mode');
});

window.addEventListener('online', () => {
  console.log('📶 Network online');
  if(ws && ws.readyState !== WebSocket.OPEN) {
    connectWebSocket();
  }
});

window.addEventListener('offline', () => {
  console.log('📶 Network offline');
});
