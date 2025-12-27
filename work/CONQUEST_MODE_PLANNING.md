# Conquest Mode - Planning Document

## Overview

Conquest Mode is a new gameplay mode that transforms the Fantasy Map Generator from a map creation tool into a military simulation game. In this mode, users can control armies, engage in battles, and conquer territories on existing maps.

**Status:** Planning Phase  
**Created:** Current Session  
**Target:** Transform FMG into a time-based military strategy simulation with play/pause controls

---

## Core Concept

### What Conquest Mode Is
- A **military simulation mode** where users control armies on a pre-generated map
- **Time-based gameplay** with automatic progression through daily stages
- **Play/Pause system**: Time advances automatically, player can pause to issue commands
- Focus on **military operations**: moving regiments, engaging in battles, capturing territories
- **State management**: diplomatic relations, resource management, conquest objectives

### What Conquest Mode Is NOT
- A map generation tool (generation is disabled)
- A map editing tool (editing features are disabled)
- Real-time strategy (it's time-based with pause functionality)
- Turn-based (time progresses continuously when playing)
- A complete replacement of FMG (it's an optional mode)

### Natural Language Command Interface (Ollama Integration)

**NEW FEATURE:** Conquest Mode includes a natural language command interface powered by Ollama. Players can issue commands in plain English like:
- "Attack the city to the north" (relative direction)
- "Attack Steelsburg" (named city)
- "Move to Steelsburg" (named city)
- "Move east 20 kilometers" (relative direction with distance)
- "Retreat to friendly territory" (strategic command)
- "Merge with the nearest friendly regiment" (relative target)

The system uses Ollama (local LLM) to interpret these commands, extract intent and targets, and execute them automatically. This provides an intuitive, conversational interface for military operations.

---

## Key Features

### 1. Mode Activation
- **Toggle/Enable Conquest Mode** via menu or option
- Mode state stored in `FMG.State.Data.conquestMode` (boolean)
- When enabled:
  - Disables all generation functions
  - Disables all editing functions
  - Enables military simulation features
  - Shows conquest-specific UI

### 2. Disabled Functions

#### Map Generation
- ❌ `generate()` - Main map generation function
- ❌ `regenerateMap()` - Regenerate entire map
- ❌ `generateMapOnLoad()` - Auto-generation on load
- ❌ New Map button
- ❌ Map seed input/regeneration
- ❌ Heightmap generation/editing
- ❌ Submap generation tool
- ❌ Transform tool

#### Map Editing
- ❌ Heightmap editor (`editHeightmap()`)
- ❌ Biome editor (`editBiomes()`)
- ❌ State editor (`editStates()`)
- ❌ Province editor (`editProvinces()`)
- ❌ Culture editor (`editCultures()`)
- ❌ Religion editor (`editReligions()`)
- ❌ Burg editor (except viewing stats)
- ❌ River editor (`editRiver()`)
- ❌ Route editor (`editRoute()`)
- ❌ Marker editor (`editMarker()`)
- ❌ Label editor (`editLabels()`)
- ❌ Zone editor (`editZones()`)
- ❌ Emblem editor
- ❌ Coastline editor
- ❌ Ice editor
- ❌ Relief editor

#### Regeneration Functions
- ❌ `regenerateBurgs`
- ❌ `regenerateCultures`
- ❌ `regenerateEmblems`
- ❌ `regenerateIce`
- ❌ `regenerateStates`
- ❌ `regenerateProvinces`
- ❌ `regenerateReligions`
- ❌ `regenerateRivers`
- ❌ `regenerateRoutes`
- ❌ `regenerateMilitary` (generate new, but allow reinforcement)
- ❌ `regenerateMarkers`
- ❌ `regeneratePopulation`
- ❌ `regenerateReliefIcons`
- ❌ `regenerateZones`

#### Add Features
- ❌ Add Burg tool
- ❌ Add Label tool
- ❌ Add Marker tool
- ❌ Add River tool
- ❌ Add Route tool

#### Tools
- ❌ Submap tool
- ❌ Transform tool
- ❌ World configurator (limited - view only)
- ❌ Style editor (limited - view only, no save)

### 3. Enabled/Enhanced Functions

#### Military Simulation
- ✅ **Battle System** (already exists - `modules/ui/battle-screen.js`)
  - Enhance for conquest mode gameplay
  - Add strategic battle planning
  - Track battle history
  
- ✅ **Regiment Movement**
  - Enable drag-and-drop movement (exists in `editRegiment()`)
  - Add movement validation (terrain, borders, supply lines)
  - Add movement range/limits
  - Animated movement on map
  
- ✅ **Army Management**
  - View all regiments
  - Merge/split regiments
  - Reinforce regiments
  - Supply management
  - Commanding officer assignment (officers provide bonuses to attack, defense, movement, etc.)
  
- ✅ **Territory Control (Cell-Based)**
  - **Cell-based system**: Controlling a cell = controlling that territory
  - **Area calculation**: Territory size = sum of controlled cell areas
  - Visual indicators for controlled territories
  - Capture mechanics (capture cells, which equals controlling territory)
  - Occupation rules (cells must be occupied to be controlled)
  - Statistics: Total area, percentage, cell count per state

#### View/Information (Read-Only)
- ✅ View map layers
- ✅ View state/culture/religion overlays
- ✅ View burgs (information only)
- ✅ View routes (for movement planning)
- ✅ View markers (battlefields, landmarks)
- ✅ View notes/legends
- ✅ View statistics

#### UI Enhancements
- ✅ Conquest Mode menu/panel
- ✅ Time/date indicator (Day, Stage, Progress)
- ✅ Play/Pause controls
- ✅ Time speed controls (1x, 2x, 5x)
- ✅ Active state/player indicator
- ✅ Victory conditions display
- ✅ Battle log/history
- ✅ Diplomatic relations view (read-only or limited editing)

---

## Technical Implementation

### Phase 1: Mode System Foundation

#### 1.1 State Management
**File:** `core/state.js` (extend existing)

```javascript
FMG.State.Data.conquestMode = false;
FMG.State.Data.conquestIsPlaying = false; // Play/pause state
FMG.State.Data.conquestDay = 1; // Current day
FMG.State.Data.conquestStage = "dawn"; // Current time stage (dawn, morning, afternoon, evening, night)
FMG.State.Data.conquestStageProgress = 0; // Progress through current stage (0-100%)
FMG.State.Data.conquestActiveState = null; // State ID of active player
FMG.State.Data.conquestHistory = []; // Game history log
FMG.State.Data.conquestTimeInterval = null; // Interval ID for time progression
```

#### 1.2 Mode Toggle
**File:** `modules/ui/conquest-mode.js` (new)

```javascript
function toggleConquestMode() {
  FMG.State.Data.conquestMode = !FMG.State.Data.conquestMode;
  
  if (FMG.State.Data.conquestMode) {
    enableConquestMode();
  } else {
    disableConquestMode();
  }
}

function enableConquestMode() {
  // Disable all generation/editing UI
  disableGenerationUI();
  disableEditingUI();
  
  // Enable conquest UI
  enableConquestUI();
  
  // Show notification
  tip("Conquest Mode Enabled. Generation and editing are disabled.", true, "info");
}

function disableConquestMode() {
  // Re-enable all UI
  enableGenerationUI();
  enableEditingUI();
  
  // Disable conquest UI
  disableConquestUI();
}
```

#### 1.3 UI Controls Disabling
**File:** `modules/ui/conquest-mode.js`

Create helper functions to disable/enable button groups:

```javascript
function disableGenerationUI() {
  // Main generation controls
  byId("regenerate").style.display = "none";
  byId("newMapButton").disabled = true;
  byId("optionsSeed").disabled = true;
  
  // Tools tab - Regenerate section
  const regenerateButtons = document.querySelectorAll("#regenerateFeature button");
  regenerateButtons.forEach(btn => btn.disabled = true);
  
  // Tools tab - Add section
  const addButtons = document.querySelectorAll("#addFeature button");
  addButtons.forEach(btn => btn.disabled = true);
  
  // Tools tab - Create section
  byId("openSubmapTool").disabled = true;
  byId("openTransformTool").disabled = true;
}

function disableEditingUI() {
  // Tools tab - Edit section (all editor buttons)
  const editButtons = [
    "editHeightmapButton",
    "editBiomesButton",
    "editStatesButton",
    "editProvincesButton",
    "editCulturesButton",
    "editReligionsButton",
    "editEmblemButton",
    "editNamesBaseButton",
    "editNotesButton",
    "editZonesButton"
  ];
  
  editButtons.forEach(id => {
    const btn = byId(id);
    if (btn) btn.disabled = true;
  });
}
```

### Phase 2: Function Guards

#### 2.1 Guard Functions
**File:** `modules/ui/conquest-mode.js`

```javascript
function guardAgainstConquestMode(functionName) {
  if (FMG.State.Data.conquestMode) {
    tip(`This function is disabled in Conquest Mode. Exit Conquest Mode to ${functionName}.`, false, "error");
    return true; // Block execution
  }
  return false; // Allow execution
}
```

#### 2.2 Apply Guards to Core Functions
**Files:** `main.js`, various editor modules

Wrap critical functions:

```javascript
// In main.js
const originalGenerate = generate;
generate = function(options) {
  if (guardAgainstConquestMode("generate maps")) return;
  return originalGenerate(options);
};

// In modules/ui/tools.js
toolsContent.addEventListener("click", function(event) {
  if (FMG.State.Data.conquestMode) {
    // Check if clicked button should be disabled
    const disabledButtons = ["editHeightmapButton", "editBiomesButton", /* ... */];
    if (disabledButtons.includes(event.target.id)) {
      guardAgainstConquestMode("edit map features");
      return;
    }
  }
  // ... existing code
});
```

### Phase 3: Conquest UI

#### 3.1 Conquest Panel
**File:** `index.html` (add new section)
**File:** `modules/ui/conquest-mode.js` (implementation)

Add to Tools tab or create new "Conquest" tab:

```html
<div id="conquestContent" class="tabcontent" style="display: none">
  <div class="separator">Game Status</div>
  <div class="grid">
    <div>Day: <span id="conquestDay">1</span></div>
    <div>Time: <span id="conquestTime">Dawn</span> (<span id="conquestStageProgress">0</span>%)</div>
    <div>Active: <span id="conquestActiveState">None</span></div>
    <button id="conquestPlayPause" class="icon-play">Play</button>
    <button id="conquestToggleMode">Exit Conquest Mode</button>
  </div>
  
  <div class="separator">Time Controls</div>
  <div class="grid">
    <button id="conquestPause" class="icon-pause" style="display: none">Pause</button>
    <button id="conquestPlay" class="icon-play">Play</button>
    <button id="conquestSpeed1x">1x</button>
    <button id="conquestSpeed2x">2x</button>
    <button id="conquestSpeed5x">5x</button>
  </div>
  
  <div class="separator">Military</div>
  <div class="grid">
    <button id="conquestMoveRegiment">Move Regiment</button>
    <button id="conquestMergeRegiments">Merge Regiments</button>
    <button id="conquestReinforceRegiment">Reinforce</button>
    <button id="conquestSupplyLines">View Supply</button>
  </div>
  
  <div class="separator">Diplomacy</div>
  <div class="grid">
    <button id="conquestViewDiplomacy">View Relations</button>
    <button id="conquestDeclareWar">Declare War</button>
    <button id="conquestPeace">Propose Peace</button>
  </div>
  
  <div class="separator">Victory Conditions</div>
  <div id="conquestVictoryConditions">
    <!-- Dynamic content -->
  </div>
</div>
```

#### 3.2 Time Progression System
**File:** `modules/ui/conquest-mode.js`

Time progresses through daily stages automatically when playing:

```javascript
// Time stages throughout the day
const TIME_STAGES = [
  { name: "dawn", duration: 1000, label: "Dawn" },      // 1000ms = 1 second real-time
  { name: "morning", duration: 2000, label: "Morning" },
  { name: "afternoon", duration: 2000, label: "Afternoon" },
  { name: "evening", duration: 1500, label: "Evening" },
  { name: "night", duration: 1500, label: "Night" }
];

// Time progression speed multiplier
let timeSpeed = 1; // 1x, 2x, 5x, etc.

/**
 * Start time progression (play button)
 */
function startTimeProgression() {
  if (!FMG.State.Data.conquestMode) return;
  if (FMG.State.Data.conquestIsPlaying) return; // Already playing
  
  FMG.State.Data.conquestIsPlaying = true;
  updatePlayPauseButton();
  
  // Start time interval
  FMG.State.Data.conquestTimeInterval = setInterval(() => {
    advanceTime();
  }, 50); // Update every 50ms for smooth progression
  
  tip("Time is now advancing. Pause to issue commands.", true);
}

/**
 * Stop time progression (pause button)
 */
function pauseTimeProgression() {
  if (!FMG.State.Data.conquestMode) return;
  if (!FMG.State.Data.conquestIsPlaying) return; // Already paused
  
  FMG.State.Data.conquestIsPlaying = false;
  
  // Stop time interval
  if (FMG.State.Data.conquestTimeInterval) {
    clearInterval(FMG.State.Data.conquestTimeInterval);
    FMG.State.Data.conquestTimeInterval = null;
  }
  
  updatePlayPauseButton();
  tip("Time paused. Issue commands to your units.", true);
}

/**
 * Toggle play/pause
 */
function togglePlayPause() {
  if (FMG.State.Data.conquestIsPlaying) {
    pauseTimeProgression();
  } else {
    startTimeProgression();
  }
}

/**
 * Advance time through stages
 */
function advanceTime() {
  const stageConfig = TIME_STAGES.find(s => s.name === FMG.State.Data.conquestStage);
  if (!stageConfig) {
    // Start new day at dawn
    FMG.State.Data.conquestDay++;
    FMG.State.Data.conquestStage = "dawn";
    FMG.State.Data.conquestStageProgress = 0;
    processDayStart();
    return;
  }
  
  // Advance progress through current stage
  const progressIncrement = (50 * timeSpeed) / stageConfig.duration * 100; // 50ms updates
  FMG.State.Data.conquestStageProgress += progressIncrement;
  
  if (FMG.State.Data.conquestStageProgress >= 100) {
    // Move to next stage
    const currentIndex = TIME_STAGES.findIndex(s => s.name === FMG.State.Data.conquestStage);
    const nextIndex = (currentIndex + 1) % TIME_STAGES.length;
    
    FMG.State.Data.conquestStage = TIME_STAGES[nextIndex].name;
    FMG.State.Data.conquestStageProgress = 0;
    
    // Process stage transition
    processStageTransition(FMG.State.Data.conquestStage);
    
    // If back to dawn, it's a new day
    if (nextIndex === 0) {
      FMG.State.Data.conquestDay++;
      processDayStart();
    }
  }
  
  // Update UI
  updateTimeDisplay();
  
  // Process ongoing events (movement, battles, etc.)
  processOngoingEvents();
}

/**
 * Process what happens at the start of each day
 */
function processDayStart() {
  // Reset daily movement points and process exhaustion/supplies
  pack.states.forEach(state => {
    if (!state.military) return;
    state.military.forEach(regiment => {
      ConquestMovement.resetDailyMovement(regiment);
    });
  });
  
  // Reset daily resources/actions
  resetDailyResources();
  
  // Process AI decisions for the day
  processAIDecisions();
  
  // Update supply lines
  updateSupplyLines();
  
  // Check for victory conditions
  checkVictoryConditions();
  
  tip(`Day ${FMG.State.Data.conquestDay} begins`, true);
}

/**
 * Process stage transitions (dawn -> morning -> afternoon -> evening -> night)
 */
function processStageTransition(stage) {
  // Different events happen at different times
  switch (stage) {
    case "dawn":
      // Morning planning, prepare for day
      break;
    case "morning":
      // Main movement and action period
      break;
    case "afternoon":
      // Continue operations
      break;
    case "evening":
      // Evening engagements, preparation for night
      break;
    case "night":
      // Reduced activity, rest periods
      processNightPhase();
      break;
  }
  
  updateTimeDisplay();
}

/**
 * Process night phase (reduced activity, rest)
 */
function processNightPhase() {
  // Reduced movement speed at night
  // Rest and recovery
  // Some units may be inactive
}

/**
 * Process ongoing events while time progresses
 */
function processOngoingEvents() {
  if (!FMG.State.Data.conquestIsPlaying) return;
  
  // Process regiment movements (with terrain, supply, exhaustion calculations)
  ConquestMovement.processRegimentMovements();
  
  // Process ongoing battles
  processOngoingBattles();
  
  // Check for new engagements
  checkForBattles();
  
  // Update territory control
  updateTerritoryControl();
}

/**
 * Update time display in UI
 */
function updateTimeDisplay() {
  const stageConfig = TIME_STAGES.find(s => s.name === FMG.State.Data.conquestStage);
  const timeLabel = stageConfig ? stageConfig.label : FMG.State.Data.conquestStage;
  
  byId("conquestDay").textContent = FMG.State.Data.conquestDay;
  byId("conquestTime").textContent = timeLabel;
  byId("conquestStageProgress").textContent = rn(FMG.State.Data.conquestStageProgress, 1);
}

/**
 * Update play/pause button state
 */
function updatePlayPauseButton() {
  const playButton = byId("conquestPlay");
  const pauseButton = byId("conquestPause");
  const playPauseButton = byId("conquestPlayPause");
  
  if (FMG.State.Data.conquestIsPlaying) {
    playButton.style.display = "none";
    pauseButton.style.display = "inline-block";
    playPauseButton.className = "icon-pause";
    playPauseButton.textContent = "Pause";
  } else {
    playButton.style.display = "inline-block";
    pauseButton.style.display = "none";
    playPauseButton.className = "icon-play";
    playPauseButton.textContent = "Play";
  }
}

/**
 * Set time progression speed
 */
function setTimeSpeed(multiplier) {
  timeSpeed = multiplier;
  tip(`Time speed set to ${multiplier}x`, false);
  
  // Update speed button states
  document.querySelectorAll("[id^='conquestSpeed']").forEach(btn => {
    btn.classList.remove("pressed");
  });
  byId(`conquestSpeed${multiplier}x`).classList.add("pressed");
}

// Event listeners
byId("conquestPlayPause").addEventListener("click", togglePlayPause);
byId("conquestPlay").addEventListener("click", startTimeProgression);
byId("conquestPause").addEventListener("click", pauseTimeProgression);
byId("conquestSpeed1x").addEventListener("click", () => setTimeSpeed(1));
byId("conquestSpeed2x").addEventListener("click", () => setTimeSpeed(2));
byId("conquestSpeed5x").addEventListener("click", () => setTimeSpeed(5));
```

**Key Concepts:**
- **Automatic progression**: Time advances automatically through daily stages
- **Pause for commands**: Player pauses time to issue orders, then resumes
- **Daily stages**: Dawn → Morning → Afternoon → Evening → Night → (next day)
- **Speed control**: 1x, 2x, 5x speed options
- **Ongoing events**: Movements, battles, and other events process while time progresses
- **Stage-specific events**: Different activities happen at different times of day

### Phase 4: Natural Language Command Interface (Ollama Integration)

#### 4.1 Command Interpreter Module
**File:** `modules/conquest/command-interpreter.js` (new)

Create a module that uses Ollama to interpret natural language commands:

```javascript
const ConquestCommandInterpreter = (function() {
  const OLLAMA_ENDPOINT = "http://localhost:11434/api/generate";
  
  /**
   * Interpret a natural language command using Ollama
   * @param {string} command - Natural language command from user
   * @param {Object} context - Game state context
   * @returns {Object} Parsed command object
   */
  async function interpretCommand(command, context) {
    const prompt = buildCommandPrompt(command, context);
    const model = getOllamaModel(); // Get from user settings/localStorage
    
    try {
      const response = await callOllama(prompt, model);
      const parsed = parseCommandResponse(response);
      return validateCommand(parsed, context);
    } catch (error) {
      throw new Error(`Failed to interpret command: ${error.message}`);
    }
  }
  
  /**
   * Build a structured prompt for Ollama with game context
   */
  function buildCommandPrompt(command, context) {
    const { selectedRegiment, nearbyTargets, availableActions } = context;
    
    return `You are a command interpreter for a fantasy map military simulation game.

Selected Unit:
- Name: ${selectedRegiment.name}
- State: ${selectedRegiment.stateName}
- Location: Cell ${selectedRegiment.cell}
- Troops: ${selectedRegiment.a}
- Position: (${selectedRegiment.x}, ${selectedRegiment.y})

Nearby Targets (for relative commands like "attack to the north"):
${formatNearbyTargets(nearbyTargets)}

All Cities (for name-based commands like "Attack Steelsburg"):
${formatAllBurgs(context.allTargets, context.selectedRegiment)}

Available Actions:
${formatAvailableActions(availableActions)}

User Command: "${command}"

Interpret this command and return ONLY valid JSON in this exact format:
{
  "action": "move" | "attack" | "defend" | "merge" | "split" | "reinforce" | "retreat" | "invalid",
  "targetType": "cell" | "regiment" | "burg" | "state" | "direction" | null,
  "target": {
    "cellId": number | null,
    "regimentId": { "state": number, "regiment": number } | null,
    "burgId": number | null,
    "direction": "north" | "south" | "east" | "west" | "northeast" | "northwest" | "southeast" | "southwest" | null,
    "coordinates": { "x": number, "y": number } | null,
    "name": string | null
  },
  "parameters": {
    "distance": number | null,
    "amount": number | null
  },
  "confidence": number,
  "reasoning": "Brief explanation of interpretation"
}

Rules:
- If command is unclear or invalid, set action to "invalid"
- For directions (north, south, etc.), calculate approximate cell coordinates
- For commands with city/place names (e.g., "Attack Steelsburg", "Move to Steelsburg"):
  - Search for exact name match first in allTargets (includes ALL cities, not just nearby)
  - If exact match found, set target.burgId and targetType to "burg"
  - If no exact match, try partial/fuzzy match (e.g., "Steelsburg" matches "New Steelsburg")
  - Set target.name to the matched city name for validation
  - Return high confidence (80-100) for exact matches, lower (50-79) for partial matches
- For "attack [name]" without specific city name, find matching target in nearbyTargets
- For "move to [location]", find closest matching cell/burg
- Always prefer named targets over relative directions when both could apply
- Return confidence score 0-100
- Be strict about valid actions only`;
  }
  
  /**
   * Call Ollama API with prompt
   * Note: Consider using /api/chat endpoint for better structured output support
   * Alternative: Use /api/generate with stream:false for simpler implementation
   */
  async function callOllama(prompt, model) {
    // Option 1: Use /api/generate (simpler, what we have now)
    const response = await fetch(OLLAMA_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false, // We want complete response for parsing
        options: {
          temperature: 0.3 // Lower temperature for more deterministic parsing
        }
      })
    });
    
    // Option 2: Use /api/chat endpoint (better for structured responses)
    // const response = await fetch("http://localhost:11434/api/chat", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     model: model,
    //     messages: [
    //       { role: "system", content: "You are a command interpreter..." },
    //       { role: "user", content: prompt }
    //     ],
    //     stream: false,
    //     options: { temperature: 0.3 }
    //   })
    // });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response;
  }
  
  /**
   * Parse JSON from Ollama response
   */
  function parseCommandResponse(response) {
    // Extract JSON from response (may have markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }
  }
  
  /**
   * Validate parsed command against game state
   */
  function validateCommand(parsed, context) {
    // Validate action is valid
    const validActions = ["move", "attack", "defend", "merge", "split", "reinforce", "retreat", "invalid"];
    if (!validActions.includes(parsed.action)) {
      parsed.action = "invalid";
      parsed.reasoning = "Invalid action type";
    }
    
    // Validate target exists and is reachable
    if (parsed.action !== "invalid" && parsed.target) {
      if (parsed.targetType === "burg") {
        // Validate burg exists (by ID or name)
        if (parsed.target.burgId !== null && parsed.target.burgId !== undefined) {
          const burg = pack.burgs[parsed.target.burgId];
          if (!burg || burg.i === 0) {
            parsed.action = "invalid";
            parsed.reasoning = `City with ID ${parsed.target.burgId} not found`;
          }
        } else if (parsed.target.name) {
          const burg = findBurgByName(parsed.target.name);
          if (!burg) {
            parsed.action = "invalid";
            parsed.reasoning = `City "${parsed.target.name}" not found`;
          } else {
            // Update burgId from name match
            parsed.target.burgId = burg.i;
          }
        }
      } else if (parsed.targetType === "cell") {
        if (!isValidCell(parsed.target.cellId, context)) {
          parsed.action = "invalid";
          parsed.reasoning = "Target cell is invalid or unreachable";
        }
      }
      // Add more validation as needed
    }
    
    return parsed;
  }
  
  /**
   * Format nearby targets for prompt
   */
  function formatNearbyTargets(targets) {
    if (!targets || targets.length === 0) return "None";
    
    return targets.map(t => {
      if (t.type === "burg") {
        return `- City: ${t.name} (Cell ${t.cell}, Distance: ${t.distance})`;
      } else if (t.type === "regiment") {
        return `- Regiment: ${t.name} (Cell ${t.cell}, State: ${t.stateName}, Distance: ${t.distance})`;
      } else if (t.type === "state") {
        return `- State: ${t.name} (Borders nearby)`;
      }
      return `- ${t.type}: ${t.name || t.cell}`;
    }).join("\n");
  }
  
  /**
   * Format all burgs for name-based targeting
   */
  function formatAllBurgs(burgs, selectedRegiment) {
    if (!burgs || burgs.length === 0) return "None";
    
    // Sort by name for easier searching
    const sorted = burgs.sort((a, b) => a.name.localeCompare(b.name));
    
    // Limit to first 100 to avoid overwhelming the prompt
    const limited = sorted.slice(0, 100);
    
    return limited.map(b => {
      const stateName = pack.states[b.state]?.name || "Unknown";
      const distance = selectedRegiment 
        ? rn(Math.hypot(selectedRegiment.x - b.x, selectedRegiment.y - b.y) * distanceScale, 1)
        : "?";
      return `- ${b.name} (Cell ${b.cell}, State: ${stateName}, Distance: ${distance})`;
    }).join("\n") + (sorted.length > 100 ? `\n... and ${sorted.length - 100} more cities` : "");
  }
  
  /**
   * Get all burgs for name-based targeting
   */
  function getAllBurgs() {
    const allBurgs = [];
    pack.burgs.forEach((burg, i) => {
      if (!burg || burg.i === 0) return; // Skip invalid burgs
      allBurgs.push({
        id: i,
        name: burg.name,
        cell: burg.cell,
        x: burg.x,
        y: burg.y,
        state: burg.state,
        stateName: pack.states[burg.state]?.name || "Unknown"
      });
    });
    return allBurgs;
  }
  
  /**
   * Format available actions for prompt
   */
  function formatAvailableActions(actions) {
    return actions.map(a => `- ${a.name}: ${a.description}`).join("\n");
  }
  
  /**
   * Get context for a selected regiment
   */
  function getRegimentContext(regiment) {
    const nearbyTargets = findNearbyTargets(regiment);
    const allBurgs = getAllBurgs(); // All cities for name-based targeting
    const availableActions = getAvailableActions(regiment);
    
    return {
      selectedRegiment: {
        name: regiment.name,
        stateName: pack.states[regiment.state].name,
        cell: regiment.cell,
        x: regiment.x,
        y: regiment.y,
        a: regiment.a,
        state: regiment.state
      },
      nearbyTargets, // For relative targeting (nearby cities, regiments)
      allTargets: allBurgs, // For name-based targeting (all cities by name)
      availableActions
    };
  }
  
  /**
   * Find nearby targets (burgs, regiments, states)
   */
  function findNearbyTargets(regiment, maxDistance = 50) {
    const targets = [];
    const {cells, burgs, states} = pack;
    
    // Find nearby burgs
    burgs.forEach((burg, i) => {
      if (!burg || burg.i === 0) return;
      const distance = Math.hypot(regiment.x - burg.x, regiment.y - burg.y);
      if (distance <= maxDistance) {
        targets.push({
          type: "burg",
          id: i,
          name: burg.name,
          cell: burg.cell,
          distance: rn(distance * distanceScale, 1),
          state: burg.state
        });
      }
    });
    
    // Find nearby regiments (enemy)
    states.forEach(state => {
      if (!state.military || state.i === regiment.state) return;
      state.military.forEach(reg => {
        const distance = Math.hypot(regiment.x - reg.x, regiment.y - reg.y);
        if (distance <= maxDistance) {
          targets.push({
            type: "regiment",
            id: {state: state.i, regiment: reg.i},
            name: reg.name,
            cell: reg.cell,
            distance: rn(distance * distanceScale, 1),
            state: state.i,
            stateName: state.name
          });
        }
      });
    });
    
    // Find nearby state borders
    // (Implementation would check adjacent cells)
    
    return targets.sort((a, b) => a.distance - b.distance);
  }
  
  /**
   * Get available actions for regiment
   */
  function getAvailableActions(regiment) {
    const actions = [
      {name: "move", description: "Move regiment to a location"},
      {name: "attack", description: "Attack a target (regiment, burg, or cell)"},
      {name: "defend", description: "Prepare for defense at current location"},
      {name: "merge", description: "Merge with nearby friendly regiment"},
      {name: "split", description: "Split regiment into smaller units"},
      {name: "reinforce", description: "Reinforce regiment with troops"},
      {name: "retreat", description: "Retreat to friendly territory"}
    ];
    
    // Filter based on regiment state, game rules, etc.
    return actions;
  }
  
  return {
    interpretCommand,
    getRegimentContext
  };
})();
```

#### 4.2 UI Integration
**File:** `modules/ui/conquest-mode.js` (enhance)

Add command input to conquest UI:

```javascript
// Add to conquest panel HTML
<div class="separator">Voice Commands</div>
<div class="grid">
  <input 
    id="conquestCommandInput" 
    type="text" 
    placeholder="Enter command (e.g., 'attack the city to the north')"
    style="width: 100%"
  />
  <button id="conquestExecuteCommand">Execute Command</button>
</div>
<div id="conquestCommandFeedback" style="margin-top: 0.5em; font-style: italic;"></div>

// Add event listener
byId("conquestExecuteCommand").addEventListener("click", async function() {
  const command = byId("conquestCommandInput").value.trim();
  if (!command) return tip("Please enter a command", false, "error");
  
  const selectedRegiment = getSelectedRegiment();
  if (!selectedRegiment) {
    return tip("Please select a regiment first", false, "error");
  }
  
  const feedback = byId("conquestCommandFeedback");
  feedback.textContent = "Interpreting command...";
  feedback.style.color = "#666";
  
  try {
    const context = ConquestCommandInterpreter.getRegimentContext(selectedRegiment);
    const parsed = await ConquestCommandInterpreter.interpretCommand(command, context);
    
    if (parsed.action === "invalid") {
      feedback.textContent = `Unable to interpret: ${parsed.reasoning || "Invalid command"}`;
      feedback.style.color = "#d00";
      return;
    }
    
    feedback.textContent = `Interpreted: ${parsed.action} (confidence: ${parsed.confidence}%) - ${parsed.reasoning}`;
    feedback.style.color = "#060";
    
    // Execute the command
    await executeCommand(parsed, selectedRegiment);
    
    // Clear input
    byId("conquestCommandInput").value = "";
    feedback.textContent = "";
  } catch (error) {
    feedback.textContent = `Error: ${error.message}`;
    feedback.style.color = "#d00";
  }
});
```

#### 4.3 Command Execution
**File:** `modules/conquest/command-executor.js` (new)

```javascript
const ConquestCommandExecutor = (function() {
  /**
   * Execute a parsed command
   */
  async function executeCommand(parsed, regiment) {
    switch (parsed.action) {
      case "move":
        return executeMove(regiment, parsed.target);
      
      case "attack":
        return executeAttack(regiment, parsed.target);
      
      case "defend":
        return executeDefend(regiment);
      
      case "merge":
        return executeMerge(regiment, parsed.target);
      
      case "split":
        return executeSplit(regiment, parsed.parameters);
      
      case "reinforce":
        return executeReinforce(regiment, parsed.parameters);
      
      case "retreat":
        return executeRetreat(regiment);
      
      default:
        throw new Error(`Unknown action: ${parsed.action}`);
    }
  }
  
  function executeMove(regiment, target) {
    let targetCell = null;
    
    if (target.cellId) {
      targetCell = target.cellId;
    } else if (target.burgId !== null && target.burgId !== undefined) {
      // Named city target (by ID)
      const burg = pack.burgs[target.burgId];
      if (!burg) {
        throw new Error(`City with ID ${target.burgId} not found`);
      }
      targetCell = burg.cell;
    } else if (target.name) {
      // Named city target (by name) - find by name
      const burg = findBurgByName(target.name);
      if (!burg) {
        throw new Error(`City "${target.name}" not found`);
      }
      targetCell = burg.cell;
    } else if (target.coordinates) {
      // Find cell at coordinates
      targetCell = findCell(target.coordinates.x, target.coordinates.y);
    } else if (target.direction) {
      // Calculate direction from regiment position
      const direction = parseDirection(target.direction);
      const distance = target.parameters?.distance || 10;
      const newX = regiment.x + direction.x * distance;
      const newY = regiment.y + direction.y * distance;
      targetCell = findCell(newX, newY);
    }
    
    if (!targetCell || !ConquestMovement.canMove(regiment, targetCell)) {
      throw new Error("Cannot move to target location");
    }
    
    return ConquestMovement.moveRegiment(regiment, targetCell);
  }
  
  function executeAttack(regiment, target) {
    let targetRegiment = null;
    let targetCell = null;
    
    if (target.regimentId) {
      const targetState = pack.states[target.regimentId.state];
      targetRegiment = targetState.military.find(r => r.i === target.regimentId.regiment);
    } else if (target.burgId !== null && target.burgId !== undefined) {
      // Named city target (by ID)
      const burg = pack.burgs[target.burgId];
      if (!burg) {
        throw new Error(`City with ID ${target.burgId} not found`);
      }
      targetCell = burg.cell;
    } else if (target.name) {
      // Named city target (by name) - find by name
      const burg = findBurgByName(target.name);
      if (!burg) {
        throw new Error(`City "${target.name}" not found`);
      }
      targetCell = burg.cell;
    } else if (target.cellId !== null && target.cellId !== undefined) {
      targetCell = target.cellId;
    }
    
    if (targetRegiment) {
      // Initiate battle with regiment
      return new Battle(regiment, targetRegiment);
    } else if (targetCell) {
      // Attack cell (check for defenders)
      const defenders = findDefendersAtCell(targetCell);
      if (defenders.length > 0) {
        return new Battle(regiment, defenders[0]);
      } else {
        // Move to cell and capture
        ConquestMovement.moveRegiment(regiment, targetCell);
        ConquestTerritory.captureCell(targetCell, regiment.state);
      }
    }
  }
  
  function parseDirection(direction) {
    const dirs = {
      "north": {x: 0, y: -1},
      "south": {x: 0, y: 1},
      "east": {x: 1, y: 0},
      "west": {x: -1, y: 0},
      "northeast": {x: 0.707, y: -0.707},
      "northwest": {x: -0.707, y: -0.707},
      "southeast": {x: 0.707, y: 0.707},
      "southwest": {x: -0.707, y: 0.707}
    };
    return dirs[direction] || {x: 0, y: 0};
  }
  
  /**
   * Find a burg (city) by name with fuzzy matching
   * Supports exact match, case-insensitive match, and partial match
   * Used for name-based targeting in commands like "Attack Steelsburg"
   */
  function findBurgByName(name) {
    if (!name || typeof name !== "string") return null;
    
    const searchName = name.trim().toLowerCase();
    
    // First try exact match (case-insensitive)
    for (const burg of pack.burgs) {
      if (!burg || burg.i === 0) continue;
      if (burg.name.toLowerCase() === searchName) {
        return burg;
      }
    }
    
    // Then try partial match (contains) - e.g., "Steelsburg" matches "New Steelsburg"
    const partialMatches = [];
    for (const burg of pack.burgs) {
      if (!burg || burg.i === 0) continue;
      const burgNameLower = burg.name.toLowerCase();
      if (burgNameLower.includes(searchName) || searchName.includes(burgNameLower)) {
        partialMatches.push(burg);
      }
    }
    
    // If single partial match, return it
    if (partialMatches.length === 1) {
      return partialMatches[0];
    }
    
    // If multiple partial matches, return the one with shortest name (most specific)
    // e.g., "Steelsburg" prefers "Steelsburg" over "New Steelsburg"
    if (partialMatches.length > 1) {
      partialMatches.sort((a, b) => a.name.length - b.name.length);
      return partialMatches[0];
    }
    
    // Try fuzzy matching (Levenshtein distance) for typos
    // e.g., "Steelburg" might match "Steelsburg"
    let bestMatch = null;
    let bestScore = Infinity;
    const maxDistance = Math.max(3, Math.floor(searchName.length / 2)); // Allow up to half the name length difference
    
    for (const burg of pack.burgs) {
      if (!burg || burg.i === 0) continue;
      const score = levenshteinDistance(searchName, burg.name.toLowerCase());
      if (score < bestScore && score <= maxDistance) {
        bestScore = score;
        bestMatch = burg;
      }
    }
    
    return bestMatch;
  }
  
  /**
   * Simple Levenshtein distance for fuzzy matching
   */
  function levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }
  
  // Additional execution functions...
  
  return { executeCommand };
})();
```

#### 4.4 Configuration & Settings
**File:** `modules/ui/conquest-mode.js` (add settings)

```javascript
// Add to conquest settings
function getOllamaModel() {
  return localStorage.getItem("fmg-conquest-ollama-model") || "llama3.2";
}

function setOllamaModel(model) {
  localStorage.setItem("fmg-conquest-ollama-model", model);
}

// Add model selector to conquest panel
<div class="separator">AI Settings</div>
<div class="grid">
  <label>Ollama Model:</label>
  <input 
    id="conquestOllamaModel" 
    type="text" 
    value="${getOllamaModel()}"
    placeholder="llama3.2"
  />
  <button id="conquestTestOllama">Test Connection</button>
</div>
```

### Phase 5: Enhanced Military Features

#### 5.1 Movement System (Terrain, Supplies, Exhaustion)
**File:** `modules/conquest/movement.js` (new)

The movement system accounts for terrain difficulty, supply consumption, and unit exhaustion. Movement is calculated based on terrain costs, unit capabilities, and current state.

```javascript
const ConquestMovement = (function() {
  // Base movement points per day (before modifiers)
  const BASE_MOVEMENT_POINTS = 100;
  
  // Terrain movement costs (from biomesData.cost in biomes.js)
  // Lower cost = easier to traverse, higher = more difficult
  const TERRAIN_COSTS = {
    0: Infinity,      // Marine - impassable for land units
    1: 200,           // Hot desert - very difficult
    2: 150,           // Cold desert - difficult
    3: 60,            // Savanna - moderate
    4: 50,            // Grassland - easy
    5: 70,            // Tropical seasonal forest - moderate-difficult
    6: 70,            // Temperate deciduous forest - moderate-difficult
    7: 80,            // Tropical rainforest - difficult
    8: 90,            // Temperate rainforest - difficult
    9: 200,           // Taiga - very difficult
    10: 1000,         // Tundra - extremely difficult
    11: 5000,         // Glacier - nearly impassable
    12: 150           // Wetland - difficult
  };
  
  /**
   * Calculate movement cost for a cell based on terrain
   */
  function getTerrainCost(cellId, unitType) {
    const biomeId = pack.cells.biome[cellId];
    let baseCost = TERRAIN_COSTS[biomeId] || 100;
    
    // Height/elevation modifier (mountains are harder)
    const height = pack.cells.h[cellId];
    if (height >= 20) { // Land cells only
      const heightModifier = 1 + Math.max(height - 50, 0) / 50; // [1, ~3x]
      baseCost *= heightModifier;
    }
    
    // Unit type modifiers (some units handle terrain better)
    const unitTypeModifiers = {
      "mounted": 1.5,      // Horses struggle in difficult terrain
      "naval": Infinity,   // Naval units can't move on land
      "aviation": 1.0,     // Aircraft ignore most terrain
      "melee": 0.9,        // Infantry is versatile
      "ranged": 0.95,
      "nomadic": 0.8       // Nomadic units are good at rough terrain
    };
    
    const unitModifier = unitTypeModifiers[unitType] || 1.0;
    
    // Route bonuses are applied in getCellMovementCost() during pathfinding
    // This function returns base terrain cost only (without route modifiers)
    return baseCost * unitModifier;
  }
  
  /**
   * Calculate movement range for a regiment based on movement points
   * Accounts for exhaustion, supplies, and officer bonuses
   */
  function getMovementRange(regiment) {
    const baseMP = regiment.movementPoints || BASE_MOVEMENT_POINTS;
    
    // Reduce range if exhausted
    const exhaustionModifier = getExhaustionModifier(regiment);
    
    // Reduce range if low on supplies
    const supplyModifier = getSupplyModifier(regiment);
    
    // Apply officer movement bonus (if ConquestOfficers module is available)
    const officerBonus = ConquestOfficers ? ConquestOfficers.getMovementBonus(regiment) : 1.0;
    
    return baseMP * exhaustionModifier * supplyModifier * officerBonus;
  }
  
  /**
   * Calculate exhaustion modifier (0-1, lower = more exhausted)
   * Note: Officer bonuses are applied separately in getMovementRange()
   */
  function getExhaustionModifier(regiment) {
    if (!regiment.exhaustion) regiment.exhaustion = 0;
    
    // Exhaustion is 0-100, where 100 = fully exhausted
    if (regiment.exhaustion >= 100) return 0.1; // Can barely move
    if (regiment.exhaustion >= 80) return 0.3;  // Very slow
    if (regiment.exhaustion >= 60) return 0.5;  // Slow
    if (regiment.exhaustion >= 40) return 0.7;  // Reduced speed
    if (regiment.exhaustion >= 20) return 0.85; // Slightly reduced
    
    return 1.0; // Full speed
  }
  
  /**
   * Calculate supply modifier (0-1, lower = fewer supplies)
   */
  function getSupplyModifier(regiment) {
    if (!regiment.supplies) regiment.supplies = 100;
    
    // Supplies are 0-100, where 0 = no supplies
    if (regiment.supplies <= 0) return 0.2;  // Starving, very slow
    if (regiment.supplies <= 20) return 0.4; // Low supplies, slow
    if (regiment.supplies <= 40) return 0.6; // Moderate supplies, reduced speed
    if (regiment.supplies <= 60) return 0.8; // Adequate supplies, slight reduction
    
    return 1.0; // Full supplies, full speed
  }
  
  /**
   * Check if regiment can move to target cell
   */
  function canMove(regiment, targetCell) {
    // Check if target is valid (land for land units, water for naval)
    if (!isValidTarget(regiment, targetCell)) return false;
    
    // Calculate path cost to target
    const pathCost = calculatePathCost(regiment.cell, targetCell, regiment);
    
    // Check if regiment has enough movement points
    const movementRange = getMovementRange(regiment);
    if (pathCost > movementRange) return false;
    
    // Check borders (enemy territory may require different rules)
    if (!canEnterTerritory(regiment, targetCell)) return false;
    
    // Check supply lines (if required - can be disabled for short distances)
    if (pathCost > movementRange * 0.5 && !hasSupplyLine(regiment, targetCell)) {
      return false; // Long movements require supply lines
    }
    
    return true;
  }
  
  /**
   * Calculate cost of path from source to target cell
   * Uses A* pathfinding to find optimal route (prefers roads/trails)
   */
  function calculatePathCost(sourceCell, targetCell, regiment) {
    // Use A* pathfinding to find optimal path
    const path = findOptimalPath(sourceCell, targetCell, regiment);
    if (!path || path.length === 0) {
      // Fallback to direct distance if no path found
      const distance = Math.hypot(
        pack.cells.p[targetCell][0] - pack.cells.p[sourceCell][0],
        pack.cells.p[targetCell][1] - pack.cells.p[sourceCell][1]
      );
      const terrainCost = getTerrainCost(targetCell, regiment.primaryUnitType);
      return distance * (terrainCost / 100);
    }
    
    // Calculate total cost of path
    let totalCost = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const fromCell = path[i];
      const toCell = path[i + 1];
      totalCost += getCellMovementCost(fromCell, toCell, regiment);
    }
    
    return totalCost;
  }
  
  /**
   * Get movement cost for moving from one cell to another
   * Accounts for terrain, routes, and unit type
   */
  function getCellMovementCost(fromCell, toCell, regiment) {
    const distance = Math.hypot(
      pack.cells.p[toCell][0] - pack.cells.p[fromCell][0],
      pack.cells.p[toCell][1] - pack.cells.p[fromCell][1]
    );
    
    // Get base terrain cost
    const baseTerrainCost = getTerrainCost(toCell, regiment.primaryUnitType);
    
    // Check if route exists between cells
    const routeInfo = getRouteBetweenCells(fromCell, toCell);
    let routeModifier = 1.0;
    
    if (routeInfo) {
      // Prefer routes - different bonuses for roads vs trails
      if (routeInfo.group === "roads") {
        routeModifier = 0.25; // 75% cost reduction for roads (best)
      } else if (routeInfo.group === "trails") {
        routeModifier = 0.5;  // 50% cost reduction for trails (good)
      } else if (routeInfo.group === "searoutes") {
        routeModifier = 0.8;  // 20% cost reduction for sea routes (if naval)
      }
    }
    
    return distance * (baseTerrainCost / 100) * routeModifier;
  }
  
  /**
   * Get route information between two cells
   * Returns route object if connection exists, null otherwise
   */
  function getRouteBetweenCells(fromCell, toCell) {
    if (!pack.cells.routes || !pack.cells.routes[fromCell]) return null;
    
    const routeId = pack.cells.routes[fromCell][toCell];
    if (routeId === undefined) return null;
    
    // Find route in pack.routes
    const route = pack.routes.find(r => r.i === routeId);
    return route || null;
  }
  
  /**
   * Find optimal path using A* pathfinding algorithm
   * Prefers routes (roads > trails > no route) when advantageous
   */
  function findOptimalPath(sourceCell, targetCell, regiment) {
    // A* pathfinding
    const openSet = [sourceCell];
    const cameFrom = new Map();
    const gScore = new Map(); // Cost from start to cell
    const fScore = new Map(); // Estimated total cost
    
    gScore.set(sourceCell, 0);
    fScore.set(sourceCell, heuristic(sourceCell, targetCell));
    
    while (openSet.length > 0) {
      // Find cell in openSet with lowest fScore
      let current = openSet[0];
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if ((fScore.get(openSet[i]) || Infinity) < (fScore.get(current) || Infinity)) {
          current = openSet[i];
          currentIndex = i;
        }
      }
      
      // Remove current from openSet
      openSet.splice(currentIndex, 1);
      
      // Reached target
      if (current === targetCell) {
        // Reconstruct path
        const path = [targetCell];
        let node = targetCell;
        while (cameFrom.has(node)) {
          node = cameFrom.get(node);
          path.unshift(node);
        }
        return path;
      }
      
      // Check neighbors
      const neighbors = pack.cells.c[current];
      for (const neighbor of neighbors) {
        // Skip if invalid for this unit type
        if (!isValidTarget(regiment, neighbor)) continue;
        
        // Calculate tentative gScore
        const movementCost = getCellMovementCost(current, neighbor, regiment);
        const tentativeGScore = (gScore.get(current) || Infinity) + movementCost;
        
        // If this path to neighbor is better, record it
        if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentativeGScore);
          fScore.set(neighbor, tentativeGScore + heuristic(neighbor, targetCell));
          
          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor);
          }
        }
      }
      
      // Prevent infinite loops (max path length)
      if (openSet.length > 500) break;
    }
    
    // No path found
    return null;
  }
  
  /**
   * Heuristic function for A* (estimated distance to target)
   */
  function heuristic(cellA, cellB) {
    const [x1, y1] = pack.cells.p[cellA];
    const [x2, y2] = pack.cells.p[cellB];
    return Math.hypot(x2 - x1, y2 - y1);
  }
  
  /**
   * Check if target cell is valid for unit type
   */
  function isValidTarget(regiment, targetCell) {
    const height = pack.cells.h[targetCell];
    const isNaval = regiment.n === 1; // Naval unit flag
    
    if (isNaval) {
      // Naval units can only move in water
      return height < 20;
    } else {
      // Land units can only move on land
      return height >= 20;
    }
  }
  
  /**
   * Check if regiment can enter territory (diplomatic/border rules)
   */
  function canEnterTerritory(regiment, targetCell) {
    const targetState = ConquestTerritory.getCellOwner(targetCell);
    const regimentState = regiment.state;
    
    // Can always move in own territory
    if (targetState === regimentState) return true;
    
    // Check diplomatic relations
    const relations = pack.states[regimentState]?.conquest?.relations || {};
    const relation = relations[targetState] || "Unknown";
    
    // Can move through friendly/neutral territory
    if (relation === "Ally" || relation === "Friendly" || relation === "Neutral") {
      return true;
    }
    
    // Enemy territory requires declaration of war or ongoing conflict
    if (relation === "Enemy" || relation === "Rival") {
      return true; // Can enter during war
    }
    
    return false;
  }
  
  /**
   * Check if regiment has supply line to target
   */
  function hasSupplyLine(regiment, targetCell) {
    // Find nearest friendly supply source (burg, controlled territory, etc.)
    const supplySource = findNearestSupplySource(regiment, targetCell);
    
    if (!supplySource) return false;
    
    // Calculate distance to supply source
    const distance = calculatePathCost(targetCell, supplySource.cell, regiment);
    const maxSupplyRange = 50; // Maximum distance from supply source
    
    return distance <= maxSupplyRange;
  }
  
  /**
   * Find nearest friendly supply source
   */
  function findNearestSupplySource(regiment, targetCell) {
    let nearest = null;
    let nearestDistance = Infinity;
    
    // Check friendly burgs (cities provide supplies)
    pack.burgs.forEach(burg => {
      if (!burg || burg.i === 0) return;
      const burgState = pack.cells.state[burg.cell];
      if (burgState === regiment.state) {
        const distance = calculatePathCost(targetCell, burg.cell, regiment);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = {cell: burg.cell, type: "burg", distance};
        }
      }
    });
    
    // Check controlled territory (closer to controlled cells)
    const controlledCells = ConquestTerritory.getControlledCells(regiment.state);
    for (const cellId of controlledCells) {
      if (cellId === targetCell) continue;
      const distance = calculatePathCost(targetCell, cellId, regiment);
      if (distance < nearestDistance && distance < 30) {
        nearestDistance = distance;
        nearest = {cell: cellId, type: "territory", distance};
      }
    }
    
    return nearest;
  }
  
  /**
   * Move regiment to target cell (main movement function)
   */
  function moveRegiment(regiment, targetCell) {
    if (!canMove(regiment, targetCell)) {
      tip("Cannot move regiment to this location", false, "error");
      return false;
    }
    
    // Calculate movement cost
    const movementCost = calculatePathCost(regiment.cell, targetCell, regiment);
    
    // Consume movement points
    regiment.movementPoints = Math.max(0, (regiment.movementPoints || BASE_MOVEMENT_POINTS) - movementCost);
    
    // Increase exhaustion based on terrain difficulty
    const terrainCost = getTerrainCost(targetCell, regiment.primaryUnitType);
    const exhaustionIncrease = (terrainCost / 100) * 2; // Higher terrain = more exhaustion
    regiment.exhaustion = Math.min(100, (regiment.exhaustion || 0) + exhaustionIncrease);
    
    // Consume supplies based on movement (reduced by officer supply bonus)
    const baseSupplyConsumption = (movementCost / 100) * 5; // 5 supplies per 100 movement cost
    const supplyBonus = ConquestOfficers ? ConquestOfficers.getSupplyBonus(regiment) : 1.0;
    const supplyConsumption = baseSupplyConsumption / supplyBonus; // Higher bonus = less consumption
    regiment.supplies = Math.max(0, (regiment.supplies || 100) - supplyConsumption);
    
    // Update regiment position
    regiment.cell = targetCell;
    const [x, y] = pack.cells.p[targetCell];
    regiment.x = x;
    regiment.y = y;
    
    // Redraw regiment on map
    moveRegiment(regiment, x, y); // Use existing function from draw-military.js
    
    // Update regiment state
    regiment.lastMoveTime = FMG.State.Data.conquestDay;
    regiment.hasMoved = true;
    
    return true;
  }
  
  /**
   * Process ongoing regiment movements (called during time progression)
   */
  function processRegimentMovements() {
    // Process all regiments that have movement orders
    pack.states.forEach(state => {
      if (!state.military) return;
      
      state.military.forEach(regiment => {
        if (!regiment.movementOrder) return;
        
        // Check if regiment can continue moving
        if (regiment.movementPoints <= 0) {
          // Out of movement points, stop for the day
          regiment.movementOrder = null;
          return;
        }
        
        // Continue movement toward target
        if (regiment.movementTarget) {
          const nextStep = calculateNextStep(regiment, regiment.movementTarget);
          if (nextStep) {
            moveRegiment(regiment, nextStep);
          } else {
            // Reached target
            regiment.movementOrder = null;
            regiment.movementTarget = null;
          }
        }
      });
    });
  }
  
  /**
   * Calculate next step toward target (uses pathfinding that prefers routes)
   */
  function calculateNextStep(regiment, targetCell) {
    const currentCell = regiment.cell;
    
    // Find optimal path to target
    const path = findOptimalPath(currentCell, targetCell, regiment);
    
    if (!path || path.length < 2) {
      // No path found or already at target - try simple neighbor check
      const neighbors = pack.cells.c[currentCell];
      let bestCell = null;
      let bestCost = Infinity;
      
      for (const neighborId of neighbors) {
        if (!canMove(regiment, neighborId)) continue;
        
        const distanceToTarget = calculatePathCost(neighborId, targetCell, regiment);
        if (distanceToTarget < bestCost) {
          bestCost = distanceToTarget;
          bestCell = neighborId;
        }
      }
      
      return bestCell;
    }
    
    // Return next cell in optimal path (path[0] is current, path[1] is next)
    return path[1];
  }
  
  /**
   * Rest/recover regiment (reduces exhaustion, recovers movement points)
   */
  function restRegiment(regiment) {
    // Reduce exhaustion (resting helps recover)
    regiment.exhaustion = Math.max(0, (regiment.exhaustion || 0) - 10);
    
    // Recover some movement points if in friendly territory with supplies
    if (hasSupplyLine(regiment, regiment.cell)) {
      regiment.movementPoints = Math.min(
        BASE_MOVEMENT_POINTS,
        (regiment.movementPoints || 0) + 20
      );
    }
  }
  
  /**
   * Reset daily movement (called at start of each day)
   */
  function resetDailyMovement(regiment) {
    // Reset movement points
    regiment.movementPoints = BASE_MOVEMENT_POINTS;
    regiment.hasMoved = false;
    
    // Slight exhaustion recovery overnight
    regiment.exhaustion = Math.max(0, (regiment.exhaustion || 0) - 5);
    
    // Consume daily supplies
    const dailySupplyConsumption = 10; // Base consumption per day
    regiment.supplies = Math.max(0, (regiment.supplies || 100) - dailySupplyConsumption);
    
    // Rest if in friendly territory
    if (ConquestTerritory.getCellOwner(regiment.cell) === regiment.state) {
      restRegiment(regiment);
    }
  }
  
  return {
    canMove,
    moveRegiment,
    getMovementRange,
    getTerrainCost,
    getCellMovementCost,
    getRouteBetweenCells,
    findOptimalPath,
    getExhaustionModifier,
    getSupplyModifier,
    calculatePathCost,
    processRegimentMovements,
    restRegiment,
    resetDailyMovement
  };
})();
```

**Key Features:**

1. **Terrain Costs:**
   - Biome-based movement costs (desert = 200, grassland = 50, glacier = 5000)
   - Height/elevation modifiers (mountains are harder)
   - Road bonuses (70% cost reduction on routes)
   - Unit type modifiers (mounted units struggle, nomadic excel)

2. **Supply System:**
   - Supplies consumed during movement
   - Low supplies reduce movement speed
   - Supply lines required for long movements
   - Friendly cities and controlled territory provide supply sources
   - Daily supply consumption even when stationary

3. **Exhaustion System:**
   - Increases with movement (more on difficult terrain)
   - Reduces movement speed when high
   - Recovers when resting in friendly territory
   - Slight recovery overnight

4. **Movement Points:**
   - Daily movement point pool
   - Consumed based on terrain difficulty
   - Resets each day
   - Can be recovered by resting

5. **Time-Based Movement:**
   - Movements occur continuously during time progression
   - Regiments move toward targets automatically
   - Stop when movement points depleted
   - Multiple regiments can move simultaneously

#### 4.2 Territory Control (Cell-Based System)
**File:** `modules/conquest/territory.js` (new)

Territory control is **cell-based**: controlling a cell means controlling that territory. Each cell has an area property, so controlling multiple cells equals controlling X amount of territory.

```javascript
const ConquestTerritory = (function() {
  // Track which states control which cells
  // Key: cellId, Value: stateId
  // If a cell is not in the map, it belongs to its original state
  const cellControl = new Map(); // cellId -> stateId
  
  /**
   * Initialize territory control from original state ownership
   * Called when conquest mode is enabled
   */
  function initializeTerritoryControl() {
    cellControl.clear();
    // All cells initially controlled by their original state
    // We only track changes from original ownership
    // Original ownership is in pack.cells.state[cellId]
  }
  
  /**
   * Capture a cell for a state
   * @param {number} cellId - The cell to capture
   * @param {number} stateId - The state capturing the cell
   * @returns {boolean} - True if capture succeeded, false otherwise
   */
  function captureCell(cellId, stateId) {
    // Validate cell exists and is land
    if (cellId < 0 || cellId >= pack.cells.i.length) return false;
    if (pack.cells.h[cellId] < 20) return false; // Can't capture water cells
    
    const previousOwner = getCellOwner(cellId);
    cellControl.set(cellId, stateId);
    
    // Update statistics
    updateStateStatistics(stateId, cellId, "add");
    if (previousOwner && previousOwner !== stateId) {
      updateStateStatistics(previousOwner, cellId, "remove");
    }
    
    // Check for province/state capture (if controlling all cells in a province/state)
    checkForProvinceCapture(cellId, stateId);
    checkForStateCapture(stateId);
    
    return true;
  }
  
  /**
   * Get the current owner of a cell
   * @param {number} cellId - The cell ID
   * @returns {number} - The state ID that controls this cell
   */
  function getCellOwner(cellId) {
    // If cell has been captured, return conqueror
    if (cellControl.has(cellId)) {
      return cellControl.get(cellId);
    }
    // Otherwise return original state owner
    return pack.cells.state[cellId] || 0;
  }
  
  /**
   * Get all cells controlled by a state
   * @param {number} stateId - The state ID
   * @returns {Array<number>} - Array of cell IDs
   */
  function getControlledCells(stateId) {
    const controlled = [];
    
    // Check all cells
    for (const cellId of pack.cells.i) {
      if (getCellOwner(cellId) === stateId) {
        controlled.push(cellId);
      }
    }
    
    return controlled;
  }
  
  /**
   * Calculate total territory area controlled by a state
   * @param {number} stateId - The state ID
   * @returns {number} - Total area in square units
   */
  function getControlledArea(stateId) {
    const cells = getControlledCells(stateId);
    let totalArea = 0;
    
    for (const cellId of cells) {
      totalArea += pack.cells.area[cellId] || 0;
    }
    
    return totalArea;
  }
  
  /**
   * Calculate percentage of total map controlled by a state
   * @param {number} stateId - The state ID
   * @returns {number} - Percentage (0-100)
   */
  function getControlledPercentage(stateId) {
    const stateArea = getControlledArea(stateId);
    const totalLandArea = getTotalLandArea();
    
    if (totalLandArea === 0) return 0;
    return (stateArea / totalLandArea) * 100;
  }
  
  /**
   * Calculate total land area (all land cells)
   * @returns {number} - Total land area
   */
  function getTotalLandArea() {
    let total = 0;
    for (const cellId of pack.cells.i) {
      if (pack.cells.h[cellId] >= 20) { // Land cells only
        total += pack.cells.area[cellId] || 0;
      }
    }
    return total;
  }
  
  /**
   * Get number of cells controlled by a state
   * @param {number} stateId - The state ID
   * @returns {number} - Number of cells
   */
  function getControlledCellCount(stateId) {
    return getControlledCells(stateId).length;
  }
  
  /**
   * Update state statistics when territory changes
   */
  function updateStateStatistics(stateId, cellId, operation) {
    if (!pack.states[stateId]) return;
    
    // Initialize conquest stats if needed
    if (!pack.states[stateId].conquest) {
      pack.states[stateId].conquest = {
        controlledCells: [],
        controlledArea: 0,
        controlledPercentage: 0,
        originalArea: 0
      };
    }
    
    const cellArea = pack.cells.area[cellId] || 0;
    
    if (operation === "add") {
      if (!pack.states[stateId].conquest.controlledCells.includes(cellId)) {
        pack.states[stateId].conquest.controlledCells.push(cellId);
      }
      pack.states[stateId].conquest.controlledArea += cellArea;
    } else if (operation === "remove") {
      const index = pack.states[stateId].conquest.controlledCells.indexOf(cellId);
      if (index > -1) {
        pack.states[stateId].conquest.controlledCells.splice(index, 1);
      }
      pack.states[stateId].conquest.controlledArea = Math.max(0, 
        pack.states[stateId].conquest.controlledArea - cellArea);
    }
    
    // Update percentage
    pack.states[stateId].conquest.controlledPercentage = getControlledPercentage(stateId);
  }
  
  /**
   * Check if a state has captured an entire province
   */
  function checkForProvinceCapture(cellId, stateId) {
    const provinceId = pack.cells.province[cellId];
    if (!provinceId) return;
    
    // Get all cells in this province
    const provinceCells = pack.cells.i.filter(cid => pack.cells.province[cid] === provinceId);
    
    // Check if all province cells are controlled by this state
    const allControlled = provinceCells.every(cid => getCellOwner(cid) === stateId);
    
    if (allControlled) {
      // Province captured! Could trigger events, notifications, etc.
      tip(`Province "${pack.provinces[provinceId]?.name}" has been captured!`, true, "success");
    }
  }
  
  /**
   * Check if a state has been completely conquered
   */
  function checkForStateCapture(stateId) {
    const originalState = pack.states[stateId];
    if (!originalState || !originalState.area) return;
    
    // Get all cells that originally belonged to this state
    const originalCells = pack.cells.i.filter(cid => pack.cells.state[cid] === stateId);
    
    // Check if any cells still belong to original state
    const anyStillControlled = originalCells.some(cid => getCellOwner(cid) === stateId);
    
    if (!anyStillControlled) {
      // State completely conquered!
      tip(`State "${originalState.name}" has been completely conquered!`, true, "warning");
    }
  }
  
  /**
   * Get territory statistics for a state
   * @param {number} stateId - The state ID
   * @returns {Object} - Statistics object
   */
  function getStateStatistics(stateId) {
    const cells = getControlledCells(stateId);
    const area = getControlledArea(stateId);
    const percentage = getControlledPercentage(stateId);
    const cellCount = cells.length;
    
    return {
      cellCount,
      area: rn(area, 2),
      percentage: rn(percentage, 2),
      cells
    };
  }
  
  /**
   * Reset all territory control (for new game or reset)
   */
  function resetTerritoryControl() {
    cellControl.clear();
    // Reset all state conquest stats
    pack.states.forEach(state => {
      if (state.conquest) {
        state.conquest.controlledCells = [];
        state.conquest.controlledArea = 0;
        state.conquest.controlledPercentage = 0;
      }
    });
  }
  
  return {
    initializeTerritoryControl,
    captureCell,
    getCellOwner,
    getControlledCells,
    getControlledArea,
    getControlledPercentage,
    getControlledCellCount,
    getTotalLandArea,
    getStateStatistics,
    resetTerritoryControl
  };
})();
```

**Key Points:**
- **Cell-based control**: Each cell can be controlled by one state
- **Territory = sum of cell areas**: Total controlled territory is the sum of all controlled cell areas
- **Original ownership**: Cells start belonging to their original state (`pack.cells.state[cellId]`)
- **Conquest tracking**: Only track changes from original ownership in `cellControl` Map
- **Statistics**: Calculate area, percentage, cell count for each state
- **Province/State capture**: Check for complete province or state conquest

#### 4.3 Battle Integration
**File:** `modules/ui/battle-screen.js` (enhance existing)

**Evaluation of Existing Battle System:**

The existing battle simulation system (`modules/ui/battle-screen.js`) is **well-designed but requires significant enhancements** for Conquest Mode. Here's a detailed evaluation:

**✅ Strengths:**
1. **Robust Battle Mechanics:**
   - Multiple battle types (field, naval, siege, ambush, landing, air) with appropriate rules
   - Phase-based system with unit type effectiveness multipliers (e.g., ranged excel in skirmish, mounted in pursue)
   - Morale system that affects phase selection and battle outcomes
   - Distance-from-base affects morale (supply line simulation)
   - Iterative resolution allows for tactical depth
   - Battle type auto-detection based on terrain/units

2. **Good Mathematical Foundation:**
   - Power calculation: `sum(unit_count * unit_power * phase_multiplier) / adjuster`
   - Casualty calculation: `power * (die/10 + 0.4)` with phase-based modifiers
   - Morale degradation based on casualties
   - Phase selection logic based on power ratios and morale

3. **Comprehensive Unit Support:**
   - Supports all unit types (melee, ranged, mounted, machinery, naval, armored, aviation, magical)
   - Phase-specific multipliers for each unit type
   - Handles unit casualties and survivors correctly

4. **User Interface:**
   - Manual control for battle iteration (good for tactical gameplay)
   - Visual feedback with casualty/survivor tracking
   - Battle naming and historical marker generation

**❌ Limitations for Conquest Mode:**

1. **Manual Control Required:**
   - User must manually click "Run" to iterate battles
   - User must manually click "Apply" to accept results
   - Not suitable for automatic time-based gameplay
   - Battle dialog blocks other actions

2. **Missing Integration Points:**
   - No territory control integration (battles don't capture cells)
   - No officer bonus system integration
   - No supply/exhaustion system integration
   - No battle history tracking for conquest mode
   - No automatic result application

3. **Battle Triggering:**
   - Currently only triggered manually via regiment editor
   - No automatic detection when regiments meet
   - No range-of-battle detection for nearby regiments

4. **Time-Based Concerns:**
   - Manual iteration doesn't fit time-based gameplay model
   - Battle duration not tied to game time
   - No "fast resolution" mode for minor battles

5. **Missing Features:**
   - No retreat mechanics (regiments can't withdraw)
   - No surrender mechanics (only "surrendering" phase exists)
   - No reinforcement arrival during battle
   - Limited terrain effects (only ambush in forests/marshes)
   - No supply line effects during battle
   - Sieges may need longer duration handling for time-based gameplay

**Recommendations:**

1. **Create Two Battle Modes:**
   - **Manual Mode** (existing): Keep for tactical/strategic gameplay when player wants control
   - **Automatic Mode** (new): Fast resolution for conquest mode time-based gameplay

2. **Automatic Battle Resolution:**
   ```javascript
   // New method for automatic battle resolution
   Battle.prototype.resolveAutomatic(maxIterations = 50) {
     // Run battle until completion or max iterations
     // Return battle result without UI
     // Apply results immediately
   }
   ```

3. **Battle Detection System:**
   ```javascript
   // Detect when regiments should engage in battle
   function detectBattles() {
     // Check for enemy regiments in same or adjacent cells
     // Initiate battles automatically
   }
   ```

4. **Enhancements Needed:**
   - Integrate officer bonuses into power calculations
   - Integrate supply/exhaustion effects on morale and power
   - Add territory capture logic after battles
   - Track battle history in conquest mode
   - Add retreat/surrender mechanics
   - Consider terrain bonuses/penalties more deeply
   - Add reinforcement mechanics (regiments joining mid-battle)

5. **Power Calculation Enhancement:**
   ```javascript
   calculateStrength(side) {
     // Existing calculation
     let power = d3.sum(options.military.map(u => 
       (forces[u.name] || 0) * u.power * scheme[phase][u.type]
     )) / adjuster;
     
     // Apply officer bonuses per regiment
     this[side].regiments.forEach(regiment => {
       if (regiment.officer && regiment.officer.id) {
         const bonus = side === "attackers" 
           ? ConquestOfficers.getAttackBonus(regiment)
           : ConquestOfficers.getDefenseBonus(regiment);
         // Apply bonus proportionally to regiment's contribution
         power *= (1 + (bonus - 1) * (regimentPower / totalPower));
       }
     });
     
     // Apply supply/exhaustion modifiers
     const supplyModifier = getAverageSupplyModifier(this[side].regiments);
     const exhaustionModifier = getAverageExhaustionModifier(this[side].regiments);
     power *= supplyModifier * exhaustionModifier;
     
     this[side].power = power;
   }
   ```

**Implementation Strategy:**

1. **Phase 1: Enhance Existing System** (Recommended approach)
   - Add automatic resolution mode to existing Battle class
   - Add battle detection system
   - Integrate officer bonuses
   - Integrate supply/exhaustion
   - Add territory capture after battles
   - This preserves existing functionality while adding conquest features

2. **Phase 2: Optional Refactoring** (If needed)
   - Split Battle into ManualBattle and AutomaticBattle classes
   - Extract battle logic into shared BattleEngine
   - This provides cleaner separation but requires more work

**Conclusion:**

The existing battle system is **sufficient as a foundation** but needs enhancements for Conquest Mode. The core mechanics are solid, so we should **extend rather than replace** the system. The main work is adding automatic resolution, integration points, and conquest-specific features.

---

Enhance existing Battle class to:
- Add automatic battle resolution mode (for time-based gameplay)
- Add battle detection system (auto-trigger when regiments meet)
- Track results in conquest history
- Update territory control after battles
- Apply casualties to regiments
- Handle victory/defeat consequences
- Apply commanding officer bonuses to attack/defense calculations (see 4.4 Commanding Officer System)
- Apply supply/exhaustion modifiers to battle power
- Add retreat/surrender mechanics

**Officer Bonus Integration:**
In the `run()` method, where attack and defense are calculated:
```javascript
const attack = this.attackers.power * (this.attackers.die / 10 + 0.4);
const defense = this.defenders.power * (this.defenders.die / 10 + 0.4);
```

Apply officer bonuses by modifying the power calculation in `calculateStrength()`:
- Multiply each regiment's power contribution by `ConquestOfficers.getAttackBonus(regiment)` for attackers
- Multiply each regiment's power contribution by `ConquestOfficers.getDefenseBonus(regiment)` for defenders
- Call `ConquestOfficers.awardExperience(regiment, battleResult)` after battle resolution

#### 4.4 Commanding Officer System
**File:** `modules/conquest/officers.js` (new)

Each regiment can have a commanding officer assigned that provides various bonuses to combat, movement, and other attributes. Officers have ranks, traits, experience, and level up over time.

**Core Concepts:**
- **Officer Assignment**: One officer per regiment (can be reassigned)
- **Bonuses**: Percentage-based bonuses to attack, defense, movement, morale, supplies, tactics
- **Traits**: Special abilities that provide unique advantages
- **Experience & Leveling**: Officers gain experience from battles and level up
- **Officer Pool**: States have a pool of available officers to assign

```javascript
const ConquestOfficers = (function() {
  // Global officer registry (shared across all states)
  // Key: officerId, Value: officer object
  const officerRegistry = new Map();
  let nextOfficerId = 1;
  
  /**
   * Officer Data Structure
   */
  const createOfficer = function(name, rank = "captain", stateId = null) {
    const officer = {
      id: nextOfficerId++,
      name: name || generateOfficerName(),
      rank: rank, // "general" | "commander" | "captain" | "lieutenant"
      stateId: stateId, // State the officer belongs to
      bonuses: generateBonuses(rank),
      traits: generateTraits(rank),
      experience: 0, // 0-100
      level: 1, // 1-5
      battlesWon: 0,
      battlesLost: 0,
      regimentsCommanded: [] // Array of regiment IDs this officer has commanded
    };
    
    officerRegistry.set(officer.id, officer);
    return officer;
  };
  
  /**
   * Generate bonuses based on rank (higher rank = better bonuses)
   */
  function generateBonuses(rank) {
    const baseBonuses = {
      lieutenant: { attack: 5, defense: 5, movement: 5, morale: 5, supplies: 5, tactics: 5 },
      captain: { attack: 10, defense: 10, movement: 10, morale: 10, supplies: 10, tactics: 10 },
      commander: { attack: 15, defense: 15, movement: 15, morale: 15, supplies: 15, tactics: 15 },
      general: { attack: 20, defense: 20, movement: 20, morale: 20, supplies: 20, tactics: 20 }
    };
    
    const base = baseBonuses[rank] || baseBonuses.captain;
    
    // Add random variation (±25%)
    return {
      attack: Math.max(0, Math.min(50, base.attack + randomVariation(base.attack))),
      defense: Math.max(0, Math.min(50, base.defense + randomVariation(base.defense))),
      movement: Math.max(0, Math.min(50, base.movement + randomVariation(base.movement))),
      morale: Math.max(0, Math.min(50, base.morale + randomVariation(base.morale))),
      supplies: Math.max(0, Math.min(50, base.supplies + randomVariation(base.supplies))),
      tactics: Math.max(0, Math.min(50, base.tactics + randomVariation(base.tactics)))
    };
  }
  
  function randomVariation(value) {
    return (Math.random() - 0.5) * value * 0.5; // ±25% variation
  }
  
  /**
   * Generate traits based on rank (higher rank gets more/better traits)
   */
  function generateTraits(rank) {
    const allTraits = [
      // Combat traits
      "cavalry_specialist", // +10% attack bonus for cavalry units
      "infantry_master", // +10% attack bonus for infantry units
      "archer_commander", // +10% attack bonus for archers
      "artillery_expert", // +10% attack bonus for artillery
      "naval_commander", // +10% attack bonus for naval units
      "defensive_master", // +15% defense bonus
      "tactician", // +15% tactics bonus, better battle phases
      "berserker", // +20% attack, -10% defense
      
      // Movement traits
      "march_master", // +20% movement bonus, less exhaustion
      "terrain_expert", // Reduced terrain movement penalties
      "supply_master", // +20% supply efficiency, slower supply consumption
      
      // Leadership traits
      "inspirational", // +20% morale bonus
      "disciplinarian", // +15% morale, better troop organization
      "veteran_leader", // +10% to all bonuses
      
      // Special traits
      "strategist", // +10% to attack and defense
      "logistician", // +15% supplies, +10% movement
      "brave", // +10% morale, +5% attack
      "cautious" // +15% defense, -5% attack
    ];
    
    const traitCount = {
      lieutenant: 0, // No traits
      captain: 1,
      commander: 2,
      general: 3
    };
    
    const count = traitCount[rank] || 1;
    const selected = [];
    const available = [...allTraits];
    
    for (let i = 0; i < count && available.length > 0; i++) {
      const index = Math.floor(Math.random() * available.length);
      selected.push(available.splice(index, 1)[0]);
    }
    
    return selected;
  }
  
  /**
   * Assign an officer to a regiment
   */
  function assignOfficer(regiment, officerId) {
    if (!regiment) return false;
    
    // Unassign current officer if exists
    if (regiment.officer && regiment.officer.id) {
      unassignOfficer(regiment);
    }
    
    const officer = officerRegistry.get(officerId);
    if (!officer) return false;
    
    // Assign officer
    regiment.officer = {
      id: officer.id,
      name: officer.name,
      rank: officer.rank,
      bonuses: { ...officer.bonuses }, // Copy bonuses
      traits: [...officer.traits], // Copy traits
      experience: officer.experience,
      level: officer.level
    };
    
    // Track that this officer commanded this regiment
    const regimentKey = `${regiment.state}-${regiment.i}`;
    if (!officer.regimentsCommanded.includes(regimentKey)) {
      officer.regimentsCommanded.push(regimentKey);
    }
    
    return true;
  }
  
  /**
   * Unassign officer from regiment
   */
  function unassignOfficer(regiment) {
    if (!regiment.officer || !regiment.officer.id) return;
    
    const officerId = regiment.officer.id;
    regiment.officer = { id: null, name: null, rank: null, bonuses: {}, traits: [], experience: 0, level: 1 };
    
    return officerId;
  }
  
  /**
   * Apply officer bonuses to regiment's attack power
   * Used in battle calculations
   */
  function getAttackBonus(regiment) {
    if (!regiment.officer || !regiment.officer.id) return 1.0;
    
    let bonus = 1.0 + (regiment.officer.bonuses.attack / 100);
    
    // Apply trait bonuses
    if (regiment.officer.traits.includes("berserker")) bonus *= 1.2;
    if (regiment.officer.traits.includes("strategist")) bonus *= 1.1;
    if (regiment.officer.traits.includes("veteran_leader")) bonus *= 1.1;
    
    // Unit-specific bonuses
    const primaryUnitType = regiment.primaryUnitType || "infantry";
    if (regiment.officer.traits.includes(`${primaryUnitType}_specialist`) || 
        regiment.officer.traits.includes(`${primaryUnitType}_master`) ||
        regiment.officer.traits.includes(`${primaryUnitType}_commander`) ||
        regiment.officer.traits.includes(`${primaryUnitType}_expert`)) {
      bonus *= 1.1;
    }
    
    // Level bonus (5% per level above 1)
    bonus *= 1.0 + ((regiment.officer.level - 1) * 0.05);
    
    return bonus;
  }
  
  /**
   * Apply officer bonuses to regiment's defense power
   * Used in battle calculations
   */
  function getDefenseBonus(regiment) {
    if (!regiment.officer || !regiment.officer.id) return 1.0;
    
    let bonus = 1.0 + (regiment.officer.bonuses.defense / 100);
    
    // Apply trait bonuses
    if (regiment.officer.traits.includes("defensive_master")) bonus *= 1.15;
    if (regiment.officer.traits.includes("strategist")) bonus *= 1.1;
    if (regiment.officer.traits.includes("veteran_leader")) bonus *= 1.1;
    if (regiment.officer.traits.includes("cautious")) bonus *= 1.15;
    if (regiment.officer.traits.includes("berserker")) bonus *= 0.9; // Berserker penalty
    
    // Level bonus
    bonus *= 1.0 + ((regiment.officer.level - 1) * 0.05);
    
    return bonus;
  }
  
  /**
   * Apply officer bonuses to regiment's movement speed
   * Used in movement calculations
   */
  function getMovementBonus(regiment) {
    if (!regiment.officer || !regiment.officer.id) return 1.0;
    
    let bonus = 1.0 + (regiment.officer.bonuses.movement / 100);
    
    // Apply trait bonuses
    if (regiment.officer.traits.includes("march_master")) bonus *= 1.2;
    if (regiment.officer.traits.includes("logistician")) bonus *= 1.1;
    if (regiment.officer.traits.includes("veteran_leader")) bonus *= 1.1;
    
    // Level bonus
    bonus *= 1.0 + ((regiment.officer.level - 1) * 0.05);
    
    return bonus;
  }
  
  /**
   * Apply officer bonuses to regiment's morale
   * Used in battle and movement calculations
   */
  function getMoraleBonus(regiment) {
    if (!regiment.officer || !regiment.officer.id) return 1.0;
    
    let bonus = 1.0 + (regiment.officer.bonuses.morale / 100);
    
    // Apply trait bonuses
    if (regiment.officer.traits.includes("inspirational")) bonus *= 1.2;
    if (regiment.officer.traits.includes("disciplinarian")) bonus *= 1.15;
    if (regiment.officer.traits.includes("brave")) bonus *= 1.1;
    if (regiment.officer.traits.includes("veteran_leader")) bonus *= 1.1;
    
    // Level bonus
    bonus *= 1.0 + ((regiment.officer.level - 1) * 0.05);
    
    return bonus;
  }
  
  /**
   * Apply officer bonuses to supply efficiency
   * Reduces supply consumption rate
   */
  function getSupplyBonus(regiment) {
    if (!regiment.officer || !regiment.officer.id) return 1.0;
    
    let bonus = 1.0 + (regiment.officer.bonuses.supplies / 100);
    
    // Apply trait bonuses
    if (regiment.officer.traits.includes("supply_master")) bonus *= 1.2;
    if (regiment.officer.traits.includes("logistician")) bonus *= 1.15;
    if (regiment.officer.traits.includes("veteran_leader")) bonus *= 1.1;
    
    // Level bonus
    bonus *= 1.0 + ((regiment.officer.level - 1) * 0.05);
    
    return bonus;
  }
  
  /**
   * Apply officer bonuses to tactics (affects battle phase selection)
   */
  function getTacticsBonus(regiment) {
    if (!regiment.officer || !regiment.officer.id) return 1.0;
    
    let bonus = 1.0 + (regiment.officer.bonuses.tactics / 100);
    
    // Apply trait bonuses
    if (regiment.officer.traits.includes("tactician")) bonus *= 1.15;
    if (regiment.officer.traits.includes("strategist")) bonus *= 1.1;
    if (regiment.officer.traits.includes("veteran_leader")) bonus *= 1.1;
    
    // Level bonus
    bonus *= 1.0 + ((regiment.officer.level - 1) * 0.05);
    
    return bonus;
  }
  
  /**
   * Award experience to officer after battle
   */
  function awardExperience(regiment, battleResult) {
    if (!regiment.officer || !regiment.officer.id) return;
    
    const officer = officerRegistry.get(regiment.officer.id);
    if (!officer) return;
    
    let experienceGain = 0;
    if (battleResult === "victory") {
      experienceGain = 10;
      officer.battlesWon++;
    } else if (battleResult === "defeat") {
      experienceGain = 5; // Still learn from defeat
      officer.battlesLost++;
    } else if (battleResult === "draw") {
      experienceGain = 7;
    }
    
    // Adjust based on battle difficulty (can be enhanced later)
    officer.experience = Math.min(100, officer.experience + experienceGain);
    regiment.officer.experience = officer.experience;
    
    // Check for level up
    const newLevel = Math.floor(officer.experience / 20) + 1; // Level 1-5 based on experience
    if (newLevel > officer.level && newLevel <= 5) {
      officer.level = newLevel;
      regiment.officer.level = newLevel;
      
      // Increase bonuses on level up (5% per level)
      Object.keys(officer.bonuses).forEach(key => {
        officer.bonuses[key] = Math.min(50, officer.bonuses[key] + 5);
        regiment.officer.bonuses[key] = officer.bonuses[key];
      });
    }
  }
  
  /**
   * Generate random officer name
   */
  function generateOfficerName() {
    const firstNames = ["Marcus", "Aurelius", "Gaius", "Lucius", "Titus", "Cassius", "Decimus", "Flavius"];
    const lastNames = ["Valerius", "Julius", "Claudius", "Brutus", "Maximus", "Severus", "Antonius", "Augustus"];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }
  
  /**
   * Initialize officers for a state
   * Creates a pool of officers based on state size/power
   */
  function initializeStateOfficers(stateId) {
    const state = pack.states[stateId];
    if (!state || !state.military) return [];
    
    const regimentCount = state.military.length;
    const officerCount = Math.max(1, Math.ceil(regimentCount * 0.8)); // 80% of regiments can have officers
    
    const officers = [];
    for (let i = 0; i < officerCount; i++) {
      const rank = i === 0 ? "general" : i < 3 ? "commander" : i < 8 ? "captain" : "lieutenant";
      const officer = createOfficer(null, rank, stateId);
      officers.push(officer);
    }
    
    return officers;
  }
  
  /**
   * Get available officers for a state (not currently assigned)
   */
  function getAvailableOfficers(stateId) {
    const available = [];
    officerRegistry.forEach(officer => {
      if (officer.stateId === stateId) {
        // Check if officer is currently assigned to any regiment
        let isAssigned = false;
        pack.states.forEach(state => {
          if (state.military) {
            state.military.forEach(regiment => {
              if (regiment.officer && regiment.officer.id === officer.id) {
                isAssigned = true;
              }
            });
          }
        });
        
        if (!isAssigned) {
          available.push(officer);
        }
      }
    });
    return available;
  }
  
  /**
   * Get officer by ID
   */
  function getOfficer(officerId) {
    return officerRegistry.get(officerId);
  }
  
  return {
    createOfficer,
    assignOfficer,
    unassignOfficer,
    getAttackBonus,
    getDefenseBonus,
    getMovementBonus,
    getMoraleBonus,
    getSupplyBonus,
    getTacticsBonus,
    awardExperience,
    initializeStateOfficers,
    getAvailableOfficers,
    getOfficer
  };
})();
```

**Integration Points:**

1. **Battle System** (`modules/ui/battle-screen.js`):
   - Apply `getAttackBonus()` and `getDefenseBonus()` to power calculations
   - Call `awardExperience()` after battle resolution
   - Use `getTacticsBonus()` to influence battle phase selection

2. **Movement System** (`modules/conquest/movement.js`):
   - Apply `getMovementBonus()` to movement point calculations
   - Apply `getSupplyBonus()` to supply consumption calculations
   - Apply `getMoraleBonus()` to exhaustion recovery

3. **UI** (`modules/ui/regiment-editor.js`):
   - Add officer assignment dropdown/selector
   - Display officer name, rank, bonuses, traits
   - Show officer experience and level

4. **Initialization** (`modules/conquest/conquest-mode.js`):
   - Call `initializeStateOfficers()` when conquest mode starts
   - Auto-assign officers to regiments based on state preference

**Key Features:**
- **Rank System**: Lieutenant → Captain → Commander → General (better bonuses at higher ranks)
- **Trait System**: Special abilities that provide unique advantages (e.g., cavalry specialist, defensive master)
- **Experience & Leveling**: Officers gain experience from battles and level up (max level 5)
- **Bonus System**: Percentage-based bonuses to attack, defense, movement, morale, supplies, tactics
- **Officer Pool**: Each state has a pool of officers that can be assigned/reassigned
- **Level Bonuses**: Officers get +5% to all bonuses per level above 1

### Phase 5: Save/Load System

#### 5.1 Conquest Mode Data
**File:** `modules/io/save.js` (extend)

Add conquest mode data to save:

```javascript
function prepareMapData() {
  const data = {
    // ... existing data ...
    conquestMode: FMG.State.Data.conquestMode,
    conquestIsPlaying: FMG.State.Data.conquestIsPlaying,
    conquestDay: FMG.State.Data.conquestDay,
    conquestStage: FMG.State.Data.conquestStage,
    conquestStageProgress: FMG.State.Data.conquestStageProgress,
    conquestActiveState: FMG.State.Data.conquestActiveState,
    conquestHistory: FMG.State.Data.conquestHistory,
    // ... rest of data ...
  };
  return data;
}
```

#### 5.2 Load Validation
**File:** `modules/io/load.js` (extend)

When loading a map:
- Check if map was saved in conquest mode
- Restore conquest state
- Validate map is compatible (has military, states, etc.)

---

## UI/UX Design

### Visual Indicators

#### 1. Mode Indicator
- Top banner/notification when conquest mode is active
- Different color scheme or overlay
- "CONQUEST MODE" label

#### 2. Disabled UI Elements
- Gray out disabled buttons
- Show tooltip explaining why disabled
- Hide completely if preferred

#### 3. Conquest-Specific Overlays
- Movement range indicators
- Supply line visualization
- Territory control colors
- Attack/defense zones

### User Flow

1. **Enter Conquest Mode:**
   - User clicks "Enable Conquest Mode" button
   - Confirmation dialog appears
   - Mode activates, UI updates

2. **Play Game:**
   - Click "Play" to start time progression
   - Time automatically advances through daily stages (dawn → morning → afternoon → evening → night)
   - Units move, battles occur, events happen automatically
   - Click "Pause" to stop time and issue commands
   - Select regiment and issue command (natural language or button)
   - Click "Play" again to resume time progression

3. **Engage in Battle:**
   - Move regiment to enemy territory
   - Battle screen opens automatically
   - Resolve battle
   - Apply results to map

4. **Exit Conquest Mode:**
   - Click "Exit Conquest Mode"
   - Confirmation dialog
   - Mode deactivates, normal UI restored

---

## Data Model Extensions

### State Extensions
```javascript
// Add to pack.states[i]
{
  // ... existing state properties ...
  conquest: {
    controlledCells: [], // Array of cell IDs
    resources: {
      gold: 0,
      supplies: 0,
      population: 0
    },
    diplomacy: {
      relations: {}, // State ID -> diplomatic relation type ("allied" | "friendly" | "neutral" | "suspicious" | "rival" | "war")
      agreements: {
        alliances: [], // Array of state IDs we're allied with
        tradeAgreements: [], // Array of state IDs with trade agreements
        treaties: [], // Array of active treaties/peace agreements {type, stateId, startDay, duration, expiresDay}
        nonAggressionPacts: [] // Array of state IDs with non-aggression pacts
      },
      modifiers: {}, // Temporary diplomatic modifiers (e.g., +10 for recent trade) {value, reason, expiresDay}
      history: [] // Diplomatic event history
    }
    objectives: [] // Victory conditions
  }
}
```

### Regiment Extensions
```javascript
// Add to regiment object
{
  // ... existing regiment properties ...
  movementPoints: 10,
  maxMovementPoints: 10,
  supplies: 100,
  hasMoved: false,
  hasAttacked: false,
  exhaustion: 0, // 0-100
  primaryUnitType: "infantry", // Dominant unit type for terrain calculations
  movementOrder: null, // "move" | "attack" | "defend" | "retreat" | null
  movementTarget: null, // Target cell ID
  lastMoveTime: null, // Day when last moved
  
  // Commanding Officer
  officer: {
    id: null, // Unique officer ID (null = no officer assigned)
    name: null, // Officer name
    rank: null, // "general" | "commander" | "captain" | "lieutenant"
    bonuses: {
      attack: 0, // Percentage bonus (0-50)
      defense: 0, // Percentage bonus (0-50)
      movement: 0, // Percentage bonus (0-50)
      morale: 0, // Percentage bonus (0-50)
      supplies: 0, // Percentage bonus to supply efficiency (0-50)
      tactics: 0 // Percentage bonus to tactical advantage (0-50)
    },
    traits: [], // Array of trait names (e.g., ["cavalry_specialist", "defensive_master"])
    experience: 0, // 0-100, increases with battles won
    level: 1 // 1-5, increases with experience
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create conquest mode state management
- [ ] Create mode toggle function
- [ ] Implement UI disabling system
- [ ] Add guard functions to core generation/editing functions
- [ ] Create basic conquest mode UI panel
- [ ] Add mode indicator to UI

### Phase 2: Core Mechanics (Week 3-4)
- [ ] Implement time progression system (daily stages)
- [ ] Implement play/pause controls
- [ ] Implement time speed controls
- [ ] Implement movement validation
- [ ] Enhance regiment movement with rules
- [ ] Create territory control system
- [ ] Integrate with existing battle system
- [ ] Add conquest mode save/load support

### Phase 3: Natural Language Commands (Week 5)
- [ ] Review LLM capabilities analysis (see LLM_COMMAND_INTERPRETER_ANALYSIS.md)
- [ ] Create command interpreter module using Ollama
- [ ] Implement context gathering (regiments, targets, actions)
- [ ] Implement client-side validation and target resolution
- [ ] Create command executor module
- [ ] Integrate command UI into conquest panel
- [ ] Add Ollama model configuration and recommendations
- [ ] Implement error handling and UI fallback
- [ ] Test with various command types and edge cases
- [ ] Ensure system works without LLM (UI fallback)

### Phase 4: Gameplay Features (Week 6-7)
- [ ] Add supply line system
- [ ] Implement capture mechanics
- [ ] Implement diplomacy system (see DIPLOMACY_SYSTEM_DESIGN.md)
- [ ] Add diplomatic actions (declare war, form alliance, make peace, trade agreements)
- [ ] Integrate diplomacy with movement and battle systems
- [ ] Add AI diplomacy behavior (see AI_BEHAVIOR_DESIGN.md)
- [ ] Implement victory conditions (see VICTORY_CONDITIONS_DESIGN.md)
- [ ] Add battle history/log
- [ ] Implement resource management (supplies + basic economy)
- [ ] Add regiment reinforcement/recruitment system
- [ ] Implement basic AI behavior for non-player states
- [ ] Create commanding officer system (officer generation, assignment, bonuses)
- [ ] Integrate officer bonuses into battle calculations
- [ ] Integrate officer bonuses into movement calculations
- [ ] Implement officer experience and leveling
- [ ] Create officer assignment UI

### Phase 5: Polish & Testing (Week 8-9)
- [ ] UI/UX refinements
- [ ] Balance testing
- [ ] Bug fixes
- [ ] Documentation
- [ ] Tutorial/help system

---

## Open Questions & Considerations

### 1. Single Player vs Multiplayer
- **Initial:** Single player only
- **Future:** Multiplayer support (hotseat or online)

### 2. AI Behavior
- Should AI states act automatically?
- If yes, when? (between player turns, simultaneous, etc.)
- What AI difficulty levels?

### 3. Victory Conditions
- Control X% of map
- Eliminate all enemies
- Control specific provinces
- Reach X resource points
- Custom objectives

### 4. Map Requirements
- Should conquest mode require a map with military already generated?
- Can user enable conquest mode on any map?
- Validation requirements?

### 5. Editing Restrictions
- Should ANY editing be allowed? (e.g., notes, legends)
- Should style changes be allowed?
- Should viewing statistics/overviews be allowed?

### 6. Performance
- How to handle large maps with many regiments?
- Optimize movement calculations
- Optimize territory control updates

### 7. Integration Points
- How tightly coupled with existing battle system?
- Should it be a separate module or integrated?
- Can users switch between modes mid-session?

### 8. Ollama Integration Considerations
- **Model Selection**: Which Ollama models work best? (llama3.2, mistral, etc.)
- **Performance**: Response time acceptable for real-time gameplay?
- **Offline Requirement**: Should work without internet (Ollama is local)
- **Fallback**: What if Ollama is not running? Show error or disable feature?
- **Prompt Engineering**: How detailed should context be? Balance between accuracy and token count
- **Error Handling**: How to handle ambiguous commands? Ask for clarification or best guess?
- **Streaming**: Should use streaming (current implementation) or complete response (better for JSON parsing)?
- **Temperature**: Lower temperature (0.1-0.3) for deterministic parsing vs higher for creative interpretation

---

## Future Enhancements (Post-MVP)

1. **Advanced AI**
   - Smart AI decision-making
   - Different AI personalities/strategies
   - Difficulty scaling

2. **Multiplayer**
   - Online multiplayer
   - Turn-based async play
   - Real-time notifications

3. **Campaign System**
   - Pre-built scenarios
   - Campaign progression
   - Story integration

4. **Advanced Mechanics**
   - Siege warfare
   - Naval battles
   - Spies and espionage
   - Trade and economy
   - Technology tree

5. **Enhanced Natural Language Interface**
   - Voice input (speech-to-text integration)
   - Multi-step commands ("move north then attack the city")
   - Complex strategies ("form a defensive line between these two cities")
   - Tactical suggestions from AI ("I suggest attacking from the east")
   - Command history and learning from user preferences

6. **Customization**
   - Custom victory conditions
   - Custom unit types
   - Scenario editor (limited)

---

## File Structure

```
modules/
  conquest/                    # New directory for conquest mode
    movement.js               # Movement system
    territory.js              # Territory control
    diplomacy.js              # Diplomatic actions
    resources.js              # Resource management
    command-interpreter.js    # Ollama-based natural language command interpreter
    command-executor.js       # Executes parsed commands
    ai.js                     # AI behavior (future)
  
  ui/
    conquest-mode.js          # Main conquest mode UI controller
    conquest-panel.js         # Conquest panel UI
    conquest-overlays.js      # Visual overlays for conquest mode
```

---

## Testing Checklist

- [ ] Mode toggle works correctly
- [ ] All generation functions are disabled
- [ ] All editing functions are disabled
- [ ] Conquest UI appears when enabled
- [ ] Movement validation works
- [ ] Territory capture works
- [ ] Battles integrate correctly
- [ ] Save/load preserves conquest state
- [ ] Turn system works
- [ ] No errors when switching modes
- [ ] Performance is acceptable on large maps
- [ ] Natural language commands interpret correctly
- [ ] Command execution validates properly
- [ ] Ollama connection handling works (online/offline)
- [ ] Ambiguous commands handled gracefully

---

## Documentation Needs

1. **User Guide**
   - How to enable/disable conquest mode
   - How to play (movement, battles, turns)
   - Natural language commands (examples, syntax, tips)
   - Victory conditions
   - Tips and strategies
   - Ollama setup and configuration

2. **Developer Documentation**
   - Architecture overview
   - Extension points
   - Adding new features
   - Integration with existing systems

---

## Notes

- This is a **major feature addition** that transforms the nature of the application
- Consider creating a separate branch for development
- May want to get user feedback before full implementation
- Could start with a simplified "proof of concept" version
- Existing battle system is a good foundation to build upon
- Keep backward compatibility - maps should still work in normal mode

---

**Next Steps:**
1. Review and refine this plan
2. Create initial implementation branch
3. Start with Phase 1 (Foundation)
4. Iterate based on testing and feedback

