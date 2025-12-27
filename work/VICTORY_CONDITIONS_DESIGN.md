# Victory Conditions Design for Conquest Mode

## Overview

Comprehensive victory condition system that determines when games end and how players win or lose.

---

## Victory Types

### 1. Territory Control Victory
- **Description**: Control a percentage of the total map territory
- **Thresholds**:
  - 50% (Standard Conquest)
  - 75% (Domination)
  - 100% (Total Conquest)
- **Calculation**: Based on controlled cells / total cells
- **Special Rules**: 
  - State capitals count double
  - Coastal cells may have modifiers
  - Mountain/desert cells may have reduced value

### 2. Elimination Victory
- **Description**: Destroy all enemy states
- **Requirements**: All other states eliminated (no territory or regiments)
- **Variations**:
  - Full Elimination: All states destroyed
  - Regional: All states in specific region destroyed
  - Rival Elimination: Specific rival states destroyed

### 3. Capital Control Victory
- **Description**: Capture and hold all enemy state capitals
- **Requirements**: Control all capitals for X days
- **Duration**: 30 days minimum control period
- **Special**: Capitals can be recaptured

### 4. Objective-Based Victory
- **Description**: Achieve specific objectives set at game start
- **Examples**:
  - Control X major cities
  - Control trade routes
  - Achieve economic dominance
  - Survive for X days
- **Custom Objectives**: Player can define custom goals

### 5. Score-Based Victory
- **Description**: Highest score after time limit
- **Score Components**:
  - Territory controlled (points per cell)
  - Battles won (points per victory)
  - Cities captured (bonus points)
  - Resources accumulated (points per gold/supply)
  - Officers promoted (points per level)
- **Time Limit**: 100-500 days

---

## Victory Tracking & Display

### Real-Time Progress
```javascript
function updateVictoryProgress() {
  const progress = {
    territoryPercent: calculateTerritoryPercentage(playerState),
    controlledCapitals: countControlledCapitals(playerState),
    eliminatedStates: countEliminatedStates(),
    score: calculatePlayerScore(playerState),
    daysRemaining: maxDays - currentDay
  };
  
  // Update UI
  updateVictoryDisplay(progress);
  
  // Check for victory
  if (checkVictoryCondition(progress)) {
    triggerVictory();
  }
}
```

### Victory Progress UI
```html
<div class="victory-progress">
  <div class="victory-condition">
    <label>Territory Control:</label>
    <div class="progress-bar">
      <div class="progress-fill" style="width: 65%"></div>
    </div>
    <span>65% / 75%</span>
  </div>
  
  <div class="victory-condition">
    <label>Capitals Controlled:</label>
    <span>3 / 5</span>
  </div>
  
  <div class="victory-condition">
    <label>Score:</label>
    <span>2,450 / 3,000</span>
  </div>
</div>
```

---

## Defeat Conditions

### 1. State Elimination
- **Trigger**: Lose all territory and regiments
- **Grace Period**: 10 days to recapture capital
- **Consequences**: Game over, final statistics

### 2. Capital Loss
- **Trigger**: Enemy controls your capital for 30 days
- **Recovery**: Can recapture capital to continue
- **Auto-Defeat**: If capital lost and no regiments remaining

### 3. Resource Starvation
- **Trigger**: Resources drop below critical threshold for 30 days
- **Threshold**: Gold < 100, Supplies < 50
- **Recovery**: Possible if trade agreements restore flow

### 4. Time Limit Exceeded
- **Trigger**: Game reaches maximum day limit without victory
- **Resolution**: Highest score wins, or draw if tie

---

## Game End Handling

### Victory Sequence
```javascript
async function handleVictory(winner, victoryType) {
  // Pause game
  pauseGame();
  
  // Show victory screen
  showVictoryScreen({
    winner: winner,
    victoryType: victoryType,
    statistics: compileGameStatistics(),
    achievements: checkAchievements()
  });
  
  // Options: Play Again, Main Menu, Share Results
  await showVictoryOptions();
}
```

### Statistics Compilation
```javascript
function compileGameStatistics() {
  return {
    totalDays: currentDay,
    battlesFought: battleHistory.length,
    battlesWon: battleHistory.filter(b => b.winner === playerState).length,
    territoryControlled: calculateTerritoryPercentage(playerState),
    resourcesGenerated: totalResourcesGenerated,
    officersPromoted: officers.filter(o => o.level > 1).length,
    regimentsLost: regimentsDestroyed,
    score: calculateFinalScore()
  };
}
```

---

## Multiplayer Considerations (Future)

### Shared Victory
- **Team Victory**: Allies share victory conditions
- **Divided Victory**: Different conditions for different players
- **Competitive**: Last player standing

### Victory Negotiation
- **Peace Agreements**: Players can negotiate end conditions
- **Surrender Terms**: Losers can negotiate terms
- **Draw Conditions**: Mutual agreement to end game

---

## Balance Considerations

### Victory Difficulty Scaling
```javascript
function getVictoryThreshold(difficulty) {
  const thresholds = {
    easy: { territory: 0.5, score: 2000 },
    medium: { territory: 0.75, score: 3000 },
    hard: { territory: 0.9, score: 4000 }
  };
  return thresholds[difficulty] || thresholds.medium;
}
```

### Map Size Adjustments
- Small maps: Lower territory thresholds
- Large maps: Higher thresholds, longer time limits
- Many states: Focus on elimination rather than territory

---

## Implementation Priority

### Phase 1: Basic Victory (MVP)
- Territory control victory (75%)
- State elimination victory
- Basic defeat conditions
- Victory/defeat screens

### Phase 2: Enhanced Victory
- Multiple victory types
- Score-based victory
- Custom objectives
- Achievement system

### Phase 3: Advanced Features
- Time-based victories
- Complex scoring
- Multiplayer victory
- Victory negotiation

---

## Integration Points

### Conquest Mode Initialization
```javascript
function initializeVictoryConditions() {
  const victorySettings = {
    type: "territory_control", // or "elimination", "score_based", etc.
    territoryThreshold: 0.75,
    maxDays: 365,
    allowCustomObjectives: false
  };
  
  FMG.State.Data.victorySettings = victorySettings;
  FMG.State.Data.gameStartDay = currentDay;
}
```

### Daily Victory Check
```javascript
// In conquest-mode.js - processDailyEvents
function checkVictoryConditions() {
  // Only check every few days for performance
  if (currentDay % 5 !== 0) return;
  
  const progress = calculateVictoryProgress();
  
  // Check each victory condition
  if (progress.territoryPercent >= victorySettings.territoryThreshold) {
    triggerVictory("territory_control");
  }
  
  if (progress.eliminatedStates === totalStates - 1) {
    triggerVictory("elimination");
  }
  
  // Check defeat conditions
  if (checkDefeatConditions()) {
    triggerDefeat();
  }
}
```

---

## UI Integration

### Victory Settings (Pre-Game)
```html
<div class="victory-settings">
  <h3>Victory Conditions</h3>
  
  <div class="setting-group">
    <label>Primary Victory:</label>
    <select id="victoryType">
      <option value="territory_control">Territory Control (75%)</option>
      <option value="elimination">Elimination</option>
      <option value="capital_control">Capital Control</option>
      <option value="score_based">Score Based</option>
    </select>
  </div>
  
  <div class="setting-group">
    <label>Time Limit:</label>
    <input type="range" id="maxDays" min="100" max="1000" value="365" step="50" />
    <span id="maxDaysValue">365 days</span>
  </div>
</div>
```

### Victory Screen
```html
<div id="victoryScreen" class="modal">
  <div class="victory-content">
    <h2>Victory!</h2>
    <p>You achieved victory through <strong>Territory Control</strong></p>
    
    <div class="victory-stats">
      <div class="stat">Days Played: <strong>127</strong></div>
      <div class="stat">Battles Won: <strong>23/31</strong></div>
      <div class="stat">Territory Controlled: <strong>78%</strong></div>
      <div class="stat">Final Score: <strong>3,450</strong></div>
    </div>
    
    <div class="victory-actions">
      <button onclick="playAgain()">Play Again</button>
      <button onclick="returnToMenu()">Main Menu</button>
      <button onclick="shareResults()">Share Results</button>
    </div>
  </div>
</div>
```

---

## Testing Scenarios

1. **Territory Victory**: Player captures 75%+ of map
2. **Elimination Victory**: Player destroys all enemy states
3. **Defeat by Elimination**: Player loses all territory
4. **Capital Loss Defeat**: Enemy captures player capital for 30 days
5. **Time Limit Draw**: Game ends with no clear winner
6. **Score Victory**: Highest score after time limit
7. **Custom Objectives**: Player achieves defined goals

---

## Future Enhancements

1. **Dynamic Victory Conditions**: Conditions that change based on game events
2. **Multiple Victory Paths**: Different ways to win the same game
3. **Victory Points**: Accumulate points toward different victory types
4. **Historical Victories**: Famous victories as templates
5. **Campaign Mode**: Linked scenarios with cumulative victory conditions
6. **Achievement System**: Unlockable achievements and rewards

---

## Summary

The victory system provides:

✅ **Clear Win/Loss Conditions**: Multiple victory types with clear requirements
✅ **Real-Time Tracking**: Progress display throughout the game
✅ **Flexible Configuration**: Adjustable thresholds and time limits
✅ **Comprehensive Statistics**: Detailed game outcome analysis
✅ **Balanced Gameplay**: Prevents endless games, encourages decisive action
✅ **Extensible Design**: Easy to add new victory types and conditions

This ensures games have clear endings and meaningful objectives.
