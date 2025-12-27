# Diplomacy System Design for Conquest Mode

## Overview

A comprehensive diplomacy system that allows states to form alliances, declare wars, make peace, and engage in various diplomatic actions. The system integrates with Conquest Mode gameplay and can leverage the DNA/Character system for diplomatic negotiations and character-driven diplomacy.

---

## Core Concepts

### 1. Diplomatic States

**Relationship Types:**

| State | Description | Movement Rules | Battle Rules | Trade | Visibility |
|-------|-------------|----------------|--------------|-------|------------|
| **Allied** | Formal alliance, mutual defense | Free movement | Cannot attack | Full trade | Shared intelligence |
| **Friendly** | Positive relations | Free movement | Cannot attack | Trade bonus | Partial intel |
| **Neutral** | No formal relationship | Neutral territory | Can attack | Normal trade | Limited intel |
| **Suspicious** | Tensions, mistrust | Restricted movement | Can attack | Trade penalty | Limited intel |
| **Rival** | Competition, hostility | Hostile territory | Can attack | No trade | No intel |
| **War** | Active conflict | Enemy territory | Can attack | No trade | No intel |
| **Peace Treaty** | Temporary peace | Neutral territory | Cannot attack (treaty duration) | Normal trade | Limited intel |
| **Truce** | Temporary ceasefire | Neutral territory | Cannot attack (truce duration) | Limited trade | Limited intel |

### 2. Diplomatic Actions

**Available Actions:**

1. **Declare War** → Changes relationship to "War"
2. **Make Peace** → Changes relationship to "Neutral" (requires both sides)
3. **Form Alliance** → Changes relationship to "Allied" (requires both sides)
4. **Break Alliance** → Changes relationship to "Rival" (one-sided)
5. **Propose Trade Agreement** → Enables trade bonuses (requires both sides)
6. **Cancel Trade Agreement** → Removes trade bonuses (one-sided)
7. **Propose Non-Aggression Pact** → Temporary "Peace Treaty" (requires both sides)
8. **Propose Truce** → Temporary ceasefire (requires both sides)
9. **Denounce** → Changes relationship to "Rival" (one-sided)
10. **Offer Tribute** → Improves relations (one-sided, costs resources)

---

## Data Model

### State Extensions

```javascript
// Add to pack.states[i].conquest
{
  // ... existing conquest properties ...
  
  diplomacy: {
    // Relations map: stateId -> diplomatic state
    relations: {
      1: "allied",      // State 1 is our ally
      2: "war",         // State 2 is at war with us
      3: "neutral",     // State 3 is neutral
      // ...
    },
    
    // Diplomatic agreements
    agreements: {
      // Alliance agreements
      alliances: [1, 5],  // State IDs we're allied with
      
      // Trade agreements
      tradeAgreements: [1, 3],
      
      // Active treaties
      treaties: [
        {
          type: "peace",
          stateId: 2,
          startDay: 10,
          duration: 30,  // Days
          expiresDay: 40
        },
        {
          type: "truce",
          stateId: 4,
          startDay: 5,
          duration: 10,
          expiresDay: 15
        }
      ],
      
      // Non-aggression pacts
      nonAggressionPacts: [3]
    },
    
    // Diplomatic modifiers (affect relationship changes)
    modifiers: {
      1: { value: +10, reason: "Recent trade", expiresDay: 25 },
      2: { value: -20, reason: "Border disputes", expiresDay: null }
    },
    
    // Diplomatic history
    history: [
      {
        day: 5,
        action: "declare_war",
        targetState: 2,
        initiatedBy: 1,
        result: "success"
      },
      {
        day: 10,
        action: "form_alliance",
        targetState: 3,
        initiatedBy: 1,
        result: "accepted"
      }
    ]
  }
}
```

---

## Diplomatic Actions Implementation

### 1. Declare War

```javascript
function declareWar(stateId, targetStateId) {
  const state = pack.states[stateId];
  const targetState = pack.states[targetStateId];
  
  // Validate action
  if (!canDeclareWar(stateId, targetStateId)) {
    return { success: false, reason: "Cannot declare war (alliance/treaty active)" };
  }
  
  // Update relations
  state.conquest.diplomacy.relations[targetStateId] = "war";
  targetState.conquest.diplomacy.relations[stateId] = "war";
  
  // Break any existing agreements
  breakAgreement(stateId, targetStateId, "alliance");
  breakAgreement(stateId, targetStateId, "trade");
  breakAgreement(stateId, targetStateId, "peace");
  breakAgreement(stateId, targetStateId, "truce");
  
  // Add to history
  addDiplomaticHistory(stateId, {
    day: FMG.State.Data.conquestDay,
    action: "declare_war",
    targetState: targetStateId,
    initiatedBy: stateId,
    result: "success"
  });
  
  // Notification
  tip(`${state.name} declared war on ${targetState.name}!`, true, "error");
  
  return { success: true };
}

function canDeclareWar(stateId, targetStateId) {
  const state = pack.states[stateId];
  const relation = state.conquest.diplomacy.relations[targetStateId];
  
  // Cannot declare war if:
  // - Already at war
  if (relation === "war") return false;
  
  // - In alliance (must break alliance first)
  if (relation === "allied") return false;
  
  // - Active peace treaty
  const hasTreaty = state.conquest.diplomacy.agreements.treaties.some(
    t => t.stateId === targetStateId && t.type === "peace" && t.expiresDay > FMG.State.Data.conquestDay
  );
  if (hasTreaty) return false;
  
  // - Active truce
  const hasTruce = state.conquest.diplomacy.agreements.treaties.some(
    t => t.stateId === targetStateId && t.type === "truce" && t.expiresDay > FMG.State.Data.conquestDay
  );
  if (hasTruce) return false;
  
  return true;
}
```

### 2. Form Alliance

```javascript
function proposeAlliance(stateId, targetStateId) {
  const state = pack.states[stateId];
  const targetState = pack.states[targetStateId];
  
  // Check if already allied
  if (state.conquest.diplomacy.relations[targetStateId] === "allied") {
    return { success: false, reason: "Already allied" };
  }
  
  // Check if at war
  if (state.conquest.diplomacy.relations[targetStateId] === "war") {
    return { success: false, reason: "Cannot ally while at war (make peace first)" };
  }
  
  // Calculate acceptance chance (AI decision or player choice)
  const acceptanceChance = calculateAllianceAcceptance(stateId, targetStateId);
  
  if (isAIControlled(targetStateId)) {
    // AI decision
    const accepted = Math.random() < acceptanceChance;
    
    if (accepted) {
      formAlliance(stateId, targetStateId);
      return { success: true, accepted: true };
    } else {
      return { success: false, reason: "Alliance proposal rejected", accepted: false };
    }
  } else {
    // Player decision - show proposal dialog
    showAllianceProposalDialog(stateId, targetStateId, acceptanceChance);
    return { success: true, pending: true };
  }
}

function formAlliance(stateId, targetStateId) {
  const state = pack.states[stateId];
  const targetState = pack.states[targetStateId];
  
  // Update relations
  state.conquest.diplomacy.relations[targetStateId] = "allied";
  targetState.conquest.diplomacy.relations[stateId] = "allied";
  
  // Add to alliances list
  if (!state.conquest.diplomacy.agreements.alliances.includes(targetStateId)) {
    state.conquest.diplomacy.agreements.alliances.push(targetStateId);
  }
  if (!targetState.conquest.diplomacy.agreements.alliances.includes(stateId)) {
    targetState.conquest.diplomacy.agreements.alliances.push(stateId);
  }
  
  // Add to history
  addDiplomaticHistory(stateId, {
    day: FMG.State.Data.conquestDay,
    action: "form_alliance",
    targetState: targetStateId,
    initiatedBy: stateId,
    result: "accepted"
  });
  
  tip(`Alliance formed between ${state.name} and ${targetState.name}!`, true, "success");
}

function calculateAllianceAcceptance(stateId, targetStateId) {
  const state = pack.states[stateId];
  const targetState = pack.states[targetStateId];
  const relation = state.conquest.diplomacy.relations[targetStateId] || "neutral";
  
  // Base acceptance based on current relation
  let baseChance = 0.1; // 10% for neutral
  if (relation === "friendly") baseChance = 0.4;
  if (relation === "suspicious") baseChance = 0.05;
  if (relation === "rival") baseChance = 0.01;
  
  // Modifiers
  // - Shared enemies increase chance
  const sharedEnemies = getSharedEnemies(stateId, targetStateId);
  baseChance += sharedEnemies.length * 0.1;
  
  // - Recent positive actions (tribute, trade, etc.)
  const modifiers = state.conquest.diplomacy.modifiers[targetStateId] || { value: 0 };
  baseChance += modifiers.value / 100;
  
  // - Power balance (weaker states more likely to accept)
  const powerRatio = calculateStatePower(targetStateId) / calculateStatePower(stateId);
  if (powerRatio < 0.7) baseChance += 0.2; // Weaker state more likely to accept
  
  // - Geographic proximity (distant states less likely)
  const distance = calculateStateDistance(stateId, targetStateId);
  baseChance -= (distance / 100) * 0.05;
  
  return Math.max(0.05, Math.min(0.95, baseChance));
}
```

### 3. Make Peace

```javascript
function proposePeace(stateId, targetStateId) {
  const state = pack.states[stateId];
  const targetState = pack.states[targetStateId];
  
  // Can only make peace if at war
  if (state.conquest.diplomacy.relations[targetStateId] !== "war") {
    return { success: false, reason: "Not at war with this state" };
  }
  
  // Calculate acceptance chance
  const acceptanceChance = calculatePeaceAcceptance(stateId, targetStateId);
  
  if (isAIControlled(targetStateId)) {
    const accepted = Math.random() < acceptanceChance;
    
    if (accepted) {
      makePeace(stateId, targetStateId);
      return { success: true, accepted: true };
    } else {
      return { success: false, reason: "Peace proposal rejected", accepted: false };
    }
  } else {
    showPeaceProposalDialog(stateId, targetStateId, acceptanceChance);
    return { success: true, pending: true };
  }
}

function makePeace(stateId, targetStateId) {
  const state = pack.states[stateId];
  const targetState = pack.states[targetStateId];
  
  // Update relations to neutral
  state.conquest.diplomacy.relations[targetStateId] = "neutral";
  targetState.conquest.diplomacy.relations[stateId] = "neutral";
  
  // Add to history
  addDiplomaticHistory(stateId, {
    day: FMG.State.Data.conquestDay,
    action: "make_peace",
    targetState: targetStateId,
    initiatedBy: stateId,
    result: "accepted"
  });
  
  tip(`Peace treaty signed between ${state.name} and ${targetState.name}`, true, "success");
}

function calculatePeaceAcceptance(stateId, targetStateId) {
  // AI more likely to accept peace if:
  // - Losing the war (losing territory, casualties)
  // - Stronger enemy
  // - Long war duration (war weariness)
  // - Economic strain
  
  const warStats = calculateWarStatistics(stateId, targetStateId);
  const statePower = calculateStatePower(stateId);
  const enemyPower = calculateStatePower(targetStateId);
  
  let baseChance = 0.3; // 30% base
  
  // Losing territory decreases acceptance
  if (warStats.territoryLost > 0) {
    baseChance += 0.2;
  }
  
  // Power imbalance
  if (enemyPower > statePower * 1.5) {
    baseChance += 0.3; // Much stronger enemy
  }
  
  // War duration (war weariness)
  const warDuration = FMG.State.Data.conquestDay - warStats.startDay;
  if (warDuration > 30) baseChance += 0.1;
  if (warDuration > 60) baseChance += 0.1;
  
  return Math.max(0.1, Math.min(0.9, baseChance));
}
```

### 4. Propose Trade Agreement

```javascript
function proposeTradeAgreement(stateId, targetStateId) {
  const state = pack.states[stateId];
  const targetState = pack.states[targetStateId];
  const relation = state.conquest.diplomacy.relations[targetStateId];
  
  // Cannot trade if at war or rivals
  if (relation === "war" || relation === "rival") {
    return { success: false, reason: "Cannot trade with enemies" };
  }
  
  // Check if already have trade agreement
  if (state.conquest.diplomacy.agreements.tradeAgreements.includes(targetStateId)) {
    return { success: false, reason: "Already have trade agreement" };
  }
  
  const acceptanceChance = calculateTradeAcceptance(stateId, targetStateId);
  
  if (isAIControlled(targetStateId)) {
    const accepted = Math.random() < acceptanceChance;
    
    if (accepted) {
      formTradeAgreement(stateId, targetStateId);
      return { success: true, accepted: true };
    } else {
      return { success: false, reason: "Trade proposal rejected", accepted: false };
    }
  } else {
    showTradeProposalDialog(stateId, targetStateId, acceptanceChance);
    return { success: true, pending: true };
  }
}

function formTradeAgreement(stateId, targetStateId) {
  const state = pack.states[stateId];
  const targetState = pack.states[targetStateId];
  
  // Add to trade agreements
  if (!state.conquest.diplomacy.agreements.tradeAgreements.includes(targetStateId)) {
    state.conquest.diplomacy.agreements.tradeAgreements.push(targetStateId);
  }
  if (!targetState.conquest.diplomacy.agreements.tradeAgreements.includes(stateId)) {
    targetState.conquest.diplomacy.agreements.tradeAgreements.push(stateId);
  }
  
  // Improve relations
  adjustDiplomaticModifier(stateId, targetStateId, +5, "Trade agreement", 30);
  
  tip(`Trade agreement established between ${state.name} and ${targetState.name}`, true, "success");
}
```

---

## Gameplay Effects

### 1. Movement Restrictions

```javascript
// In movement.js
function canEnterTerritory(regiment, targetCell) {
  const targetOwner = ConquestTerritory.getCellOwner(targetCell);
  
  // Own territory - always allowed
  if (targetOwner === regiment.state) return true;
  
  // Check diplomatic relation
  const relation = getDiplomaticRelation(regiment.state, targetOwner);
  
  switch (relation) {
    case "allied":
    case "friendly":
      return true; // Free movement
    
    case "neutral":
      return true; // Can enter, but may be seen as aggressive
    
    case "suspicious":
      return false; // Restricted
    
    case "rival":
    case "war":
      return false; // Enemy territory, need to attack
    
    default:
      return false;
  }
}
```

### 2. Battle Restrictions

```javascript
// In battle detection
function canAttack(attackerState, defenderState) {
  const relation = getDiplomaticRelation(attackerState, defenderState);
  
  // Cannot attack allies
  if (relation === "allied") return false;
  
  // Cannot attack during peace treaty/truce
  const hasActiveTreaty = checkActiveTreaty(attackerState, defenderState);
  if (hasActiveTreaty) return false;
  
  // Can attack in other cases (war, neutral, rival, etc.)
  return true;
}
```

### 3. Trade Effects

```javascript
// Resource generation modifiers
function getTradeBonus(stateId, resourceType) {
  const state = pack.states[stateId];
  const tradeAgreements = state.conquest.diplomacy.agreements.tradeAgreements || [];
  
  // Each trade agreement provides +5% resource generation
  const tradeBonus = 1 + (tradeAgreements.length * 0.05);
  
  return tradeBonus;
}

// Apply to resource generation
function generateResources(stateId) {
  const state = pack.states[stateId];
  const baseGold = calculateBaseGold(stateId);
  const tradeBonus = getTradeBonus(stateId, "gold");
  
  state.conquest.resources.gold += baseGold * tradeBonus;
}
```

### 4. Intelligence/Visibility

```javascript
function getIntelligenceLevel(stateId, targetStateId) {
  const relation = getDiplomaticRelation(stateId, targetStateId);
  
  switch (relation) {
    case "allied":
      return "full"; // See all regiments, resources, plans
    case "friendly":
      return "high"; // See most regiments, basic resources
    case "neutral":
      return "medium"; // See some regiments
    case "suspicious":
    case "rival":
      return "low"; // Limited visibility
    case "war":
      return "minimal"; // Only visible regiments
    default:
      return "none";
  }
}
```

---

## Natural Language Command Integration

### Command Examples

```javascript
// Natural language commands for diplomacy
"Form alliance with Steelsburg"
"Declare war on the northern state"
"Make peace with Rutarakia"
"Break alliance with Kutiograd"
"Propose trade agreement with all friendly states"
"Denounce the eastern empire"
```

### Command Interpreter Integration

```javascript
// In command-interpreter.js
const diplomaticActions = [
  {name: "form_alliance", aliases: ["ally", "alliance", "join forces"]},
  {name: "declare_war", aliases: ["war", "attack", "invade"]},
  {name: "make_peace", aliases: ["peace", "ceasefire", "truce"]},
  {name: "break_alliance", aliases: ["break alliance", "leave alliance"]},
  {name: "propose_trade", aliases: ["trade", "trade agreement"]},
  {name: "denounce", aliases: ["denounce", "condemn"]}
];

// Interpret diplomatic commands
function interpretDiplomaticCommand(command, context) {
  // Parse command to extract:
  // - Action (form alliance, declare war, etc.)
  // - Target (state name or ID)
  
  // Return structured command for execution
  return {
    action: "form_alliance",
    targetType: "state",
    targetStateId: 5,
    confidence: 0.9
  };
}
```

---

## AI Diplomacy Behavior

### AI Decision Making

```javascript
function processAIDiplomacy(stateId) {
  const state = pack.states[stateId];
  if (!isAIControlled(stateId)) return;
  
  // Evaluate diplomatic opportunities
  pack.states.forEach((otherState, otherId) => {
    if (otherId === stateId || !otherState || otherState.removed) return;
    
    const relation = state.conquest.diplomacy.relations[otherId] || "neutral";
    
    // AI decision logic
    if (relation === "neutral" || relation === "friendly") {
      // Consider forming alliance
      if (shouldFormAlliance(stateId, otherId)) {
        proposeAlliance(stateId, otherId);
      }
      
      // Consider trade agreement
      if (shouldProposeTrade(stateId, otherId)) {
        proposeTradeAgreement(stateId, otherId);
      }
    }
    
    if (relation === "war") {
      // Consider peace if losing
      if (shouldProposePeace(stateId, otherId)) {
        proposePeace(stateId, otherId);
      }
    }
    
    if (relation === "rival" || relation === "suspicious") {
      // Consider declaring war
      if (shouldDeclareWar(stateId, otherId)) {
        declareWar(stateId, otherId);
      }
    }
  });
}

function shouldFormAlliance(stateId, otherId) {
  // AI forms alliances if:
  // - Shared enemies
  // - Friendly relations
  // - Complementary strengths
  // - Geographic proximity
  
  const sharedEnemies = getSharedEnemies(stateId, otherId);
  if (sharedEnemies.length >= 2) return true;
  
  const relation = getDiplomaticRelation(stateId, otherId);
  if (relation === "friendly" && Math.random() < 0.3) return true;
  
  return false;
}

function shouldDeclareWar(stateId, otherId) {
  // AI declares war if:
  // - Much stronger than target
  // - Border disputes (adjacent territories)
  // - Expansionist personality
  // - Resources needed
  
  const statePower = calculateStatePower(stateId);
  const targetPower = calculateStatePower(otherId);
  
  if (statePower > targetPower * 1.5 && Math.random() < 0.4) {
    return true;
  }
  
  // Expansionist states more aggressive
  const expansionism = pack.states[stateId].expansionism || 0.5;
  if (expansionism > 0.7 && Math.random() < 0.2) {
    return true;
  }
  
  return false;
}
```

---

## Character-Driven Diplomacy (Optional Enhancement)

### Using Officers/Characters for Diplomacy

If DNA/Character system is integrated, diplomatic actions can use character abilities:

```javascript
function calculateDiplomaticSuccess(stateId, targetStateId, action) {
  const baseChance = calculateDiplomaticAcceptance(stateId, targetStateId, action);
  
  // If using character system, add diplomat abilities
  const diplomat = getStateDiplomat(stateId);
  if (diplomat && diplomat.derived_abilities) {
    const diplomacyBonus = diplomat.derived_abilities.diplomacy / 100;
    return Math.min(0.95, baseChance + (diplomacyBonus * 0.3));
  }
  
  return baseChance;
}

// Assign characters as diplomats
function assignDiplomat(stateId, characterId) {
  pack.states[stateId].conquest.diplomacy.diplomat = characterId;
}

// Diplomatic missions improve character abilities
function completeDiplomaticMission(characterId, success) {
  const character = loadCharacter(characterId);
  if (success) {
    character.derived_abilities.diplomacy += 2;
    character.experience += 5;
  }
  saveCharacter(character);
}
```

---

## UI Design

### Diplomacy Panel

```html
<div id="conquestDiplomacyPanel" class="tabcontent">
  <div class="separator">Diplomatic Relations</div>
  
  <!-- Relations List -->
  <div id="diplomacyRelationsList" class="diplomacy-list">
    <!-- Generated dynamically for each state -->
  </div>
  
  <!-- Action Buttons -->
  <div class="separator">Diplomatic Actions</div>
  <div class="grid">
    <button id="diplomacyDeclareWar">Declare War</button>
    <button id="diplomacyProposeAlliance">Form Alliance</button>
    <button id="diplomacyProposePeace">Make Peace</button>
    <button id="diplomacyProposeTrade">Trade Agreement</button>
    <button id="diplomacyBreakAlliance">Break Alliance</button>
    <button id="diplomacyDenounce">Denounce</button>
  </div>
  
  <!-- Diplomatic History -->
  <div class="separator">Diplomatic History</div>
  <div id="diplomacyHistory" class="diplomacy-history">
    <!-- Recent diplomatic events -->
  </div>
</div>
```

### Relations Display

```javascript
function renderDiplomaticRelations(stateId) {
  const state = pack.states[stateId];
  const list = byId("diplomacyRelationsList");
  list.innerHTML = "";
  
  pack.states.forEach((otherState, otherId) => {
    if (otherId === stateId || !otherState || otherState.removed) return;
    
    const relation = state.conquest.diplomacy.relations[otherId] || "neutral";
    const relationColor = getRelationColor(relation);
    
    const item = document.createElement("div");
    item.className = "diplomacy-relation-item";
    item.innerHTML = `
      <div class="state-info">
        <fill-box fill="${otherState.color}"></fill-box>
        <span>${otherState.name}</span>
      </div>
      <div class="relation-badge" style="background: ${relationColor}">
        ${capitalize(relation)}
      </div>
      <div class="relation-actions">
        ${getAvailableActions(stateId, otherId, relation)}
      </div>
    `;
    
    list.appendChild(item);
  });
}

function getRelationColor(relation) {
  const colors = {
    allied: "#00aa00",
    friendly: "#88cc88",
    neutral: "#888888",
    suspicious: "#cc8844",
    rival: "#cc4444",
    war: "#aa0000"
  };
  return colors[relation] || "#888888";
}
```

---

## Integration Points

### 1. Conquest Mode Initialization

```javascript
function initializeConquestMode() {
  // ... other initialization ...
  
  // Initialize diplomacy from existing state relations
  pack.states.forEach((state, stateId) => {
    if (!state.conquest) state.conquest = {};
    if (!state.conquest.diplomacy) {
      state.conquest.diplomacy = {
        relations: {},
        agreements: {
          alliances: [],
          tradeAgreements: [],
          treaties: [],
          nonAggressionPacts: []
        },
        modifiers: {},
        history: []
      };
    }
    
    // Convert existing FMG diplomatic states to conquest relations
    initializeDiplomaticRelations(stateId);
  });
}

function initializeDiplomaticRelations(stateId) {
  const state = pack.states[stateId];
  
  // Use existing pack.states[].diplomacy if available
  // Or default to neutral for all states
  pack.states.forEach((otherState, otherId) => {
    if (otherId === stateId) return;
    
    // Map existing relations or default to neutral
    const existingRelation = state.diplomacy?.[otherId] || "Neutral";
    state.conquest.diplomacy.relations[otherId] = mapExistingRelation(existingRelation);
  });
}
```

### 2. Daily Processing

```javascript
// In conquest-mode.js - processDailyEvents
function processDiplomaticEvents() {
  // Process treaty/truce expiration
  pack.states.forEach((state, stateId) => {
    const treaties = state.conquest.diplomacy.agreements.treaties || [];
    treaties.forEach((treaty, index) => {
      if (treaty.expiresDay === FMG.State.Data.conquestDay) {
        expireTreaty(stateId, treaty);
        treaties.splice(index, 1);
      }
    });
  });
  
  // Process diplomatic modifiers expiration
  pack.states.forEach((state, stateId) => {
    Object.keys(state.conquest.diplomacy.modifiers).forEach(targetStateId => {
      const modifier = state.conquest.diplomacy.modifiers[targetStateId];
      if (modifier.expiresDay && modifier.expiresDay === FMG.State.Data.conquestDay) {
        delete state.conquest.diplomacy.modifiers[targetStateId];
      }
    });
  });
  
  // Process AI diplomacy
  pack.states.forEach((state, stateId) => {
    if (isAIControlled(stateId)) {
      processAIDiplomacy(stateId);
    }
  });
}
```

---

## Save/Load Integration

```javascript
// In save.js
function prepareConquestData() {
  return {
    // ... other conquest data ...
    diplomacy: pack.states.map(state => ({
      relations: state.conquest.diplomacy.relations,
      agreements: state.conquest.diplomacy.agreements,
      modifiers: state.conquest.diplomacy.modifiers,
      history: state.conquest.diplomacy.history
    }))
  };
}

// In load.js
function loadConquestDiplomacy(data) {
  data.diplomacy.forEach((diplomacyData, stateId) => {
    const state = pack.states[stateId];
    if (!state.conquest) state.conquest = {};
    state.conquest.diplomacy = diplomacyData;
  });
}
```

---

## Testing Scenarios

1. **Form Alliance:** Two neutral states → Alliance formed
2. **Declare War:** Neutral state → War state (cannot attack ally)
3. **Make Peace:** War state → Neutral state
4. **Break Alliance:** Allied state → Rival state (one-sided)
5. **Trade Agreement:** Neutral/Friendly states → Trade bonuses
6. **Peace Treaty Expiry:** Treaty expires → Can declare war again
7. **AI Diplomacy:** AI states make diplomatic decisions
8. **Movement Restrictions:** Cannot enter enemy/restricted territory
9. **Battle Restrictions:** Cannot attack allies/treaty-bound states
10. **Natural Language:** "Form alliance with [state name]"

---

## Future Enhancements

1. **Vassalage/Suzerainty:** Hierarchical relationships
2. **Tributary States:** Economic dependence
3. **Defensive Pacts:** Mutual defense without full alliance
4. **Non-Aggression Pacts:** Extended peace agreements
5. **Trade Routes:** Specific trade route bonuses
6. **Cultural Diplomacy:** Cultural similarity affects relations
7. **Marriage Alliances:** Character marriages for political alliances
8. **Diplomatic Incidents:** Border disputes, trade conflicts
9. **Alliance Networks:** Multi-state alliance systems
10. **Diplomatic Victory:** Win condition based on alliances

---

## Summary

The diplomacy system provides:

✅ **Clear Relationship Types:** Allied, Friendly, Neutral, Suspicious, Rival, War
✅ **Diplomatic Actions:** Declare War, Form Alliance, Make Peace, Trade, etc.
✅ **Gameplay Effects:** Movement restrictions, battle rules, trade bonuses
✅ **AI Behavior:** AI states make diplomatic decisions
✅ **Natural Language Integration:** Voice commands for diplomacy
✅ **Character Integration:** Optional character-driven diplomacy (if DNA system integrated)
✅ **Persistent State:** Diplomacy state saved/loaded with game
✅ **History Tracking:** Diplomatic events logged for reference

This creates a rich diplomatic layer that significantly enhances Conquest Mode gameplay beyond simple military conquest.

