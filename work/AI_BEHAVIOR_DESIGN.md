# AI Behavior Design for Conquest Mode

## Overview

AI system that controls non-player states, making strategic decisions for movement, combat, diplomacy, and resource management.

---

## AI Types & Personalities

### 1. AI Personalities

```javascript
const AI_PERSONALITIES = {
  aggressive: {
    name: "Aggressive",
    movement: 1.3,    // More likely to move/attack
    diplomacy: 0.5,   // Less likely to make peace
    expansion: 1.5,   // Seeks territory aggressively
    defense: 0.7      // Less defensive
  },
  
  defensive: {
    name: "Defensive",
    movement: 0.7,    // Less movement
    diplomacy: 1.2,   // More diplomatic
    expansion: 0.5,   // Conservative expansion
    defense: 1.5      // Strong defense focus
  },
  
  expansionist: {
    name: "Expansionist",
    movement: 1.1,
    diplomacy: 0.8,
    expansion: 2.0,   // Maximum expansion
    defense: 0.6      // Minimal defense
  },
  
  diplomatic: {
    name: "Diplomatic",
    movement: 0.8,
    diplomacy: 1.5,   // Very diplomatic
    expansion: 0.8,
    defense: 1.0
  }
};
```

### 2. AI Difficulty Levels

```javascript
const AI_DIFFICULTY = {
  easy: {
    decisionFrequency: 0.3,    // 30% chance to make decisions
    strategicDepth: 1,         // Basic strategy
    reactionTime: 5,           // 5 days to react
    resourceEfficiency: 0.8    // 80% resource efficiency
  },
  
  medium: {
    decisionFrequency: 0.6,
    strategicDepth: 2,
    reactionTime: 3,
    resourceEfficiency: 1.0
  },
  
  hard: {
    decisionFrequency: 0.8,
    strategicDepth: 3,
    reactionTime: 1,
    resourceEfficiency: 1.2    // 120% efficiency (advantage)
  }
};
```

---

## AI Decision Framework

### Decision Categories

1. **Strategic Decisions** (Daily)
   - Territory expansion targets
   - Long-term goals
   - Alliance preferences

2. **Tactical Decisions** (Per Stage)
   - Regiment movements
   - Battle engagements
   - Immediate threats

3. **Diplomatic Decisions** (Weekly)
   - Alliance offers
   - War declarations
   - Peace negotiations

4. **Economic Decisions** (Daily)
   - Resource allocation
   - Recruitment priorities
   - Trade decisions

---

## Strategic AI (Long-term Planning)

### Territory Expansion Strategy

```javascript
function calculateExpansionTargets(stateId) {
  const state = pack.states[stateId];
  const ai = state.conquest.ai;
  
  // Find high-value targets
  const targets = [];
  
  // Priority 1: Neighboring enemy cells
  const neighborCells = getNeighboringCells(stateId);
  targets.push(...neighborCells.filter(cell => 
    ConquestTerritory.getCellOwner(cell) !== stateId
  ));
  
  // Priority 2: Cities and resources
  const nearbyBurgs = getNearbyBurgs(stateId, 20);
  targets.push(...nearbyBurgs.filter(burg => 
    burg.state !== stateId
  ));
  
  // Priority 3: Strategic locations
  const strategicCells = getStrategicCells(stateId);
  targets.push(...strategicCells);
  
  // Weight targets by value and distance
  return targets.map(target => ({
    target,
    value: calculateTargetValue(target, stateId),
    distance: calculateDistanceToState(target, stateId),
    threat: calculateThreatLevel(target, stateId)
  })).sort((a, b) => 
    (b.value / b.distance) - (a.value / a.distance)
  );
}
```

### Threat Assessment

```javascript
function calculateThreatLevel(target, stateId) {
  const targetOwner = ConquestTerritory.getCellOwner(target);
  const relation = getDiplomaticRelation(stateId, targetOwner);
  
  let threat = 0;
  
  // Diplomatic threat
  if (relation === "war") threat += 3;
  else if (relation === "rival") threat += 2;
  else if (relation === "suspicious") threat += 1;
  
  // Military threat
  const enemyRegiments = getRegimentsNearTarget(target, 10);
  threat += enemyRegiments.length * 0.5;
  
  // Power imbalance threat
  const statePower = calculateStatePower(stateId);
  const enemyPower = calculateStatePower(targetOwner);
  if (enemyPower > statePower * 1.2) {
    threat += 2;
  }
  
  return threat;
}
```

---

## Tactical AI (Short-term Actions)

### Movement Decisions

```javascript
function decideMovement(stateId) {
  const state = pack.states[stateId];
  const regiments = getStateRegiments(stateId);
  
  for (const regiment of regiments) {
    if (!canRegimentMove(regiment)) continue;
    
    // Check for immediate threats
    const threats = getNearbyThreats(regiment, 5);
    if (threats.length > 0) {
      // Defensive movement
      const retreatTarget = findSafePosition(regiment, threats);
      if (retreatTarget) {
        moveRegiment(regiment, retreatTarget);
        continue;
      }
    }
    
    // Check for opportunities
    const opportunities = getNearbyOpportunities(regiment, 8);
    if (opportunities.length > 0) {
      // Aggressive movement
      const bestOpportunity = opportunities[0]; // Already sorted by value
      moveRegiment(regiment, bestOpportunity.target);
      continue;
    }
    
    // Strategic movement toward expansion targets
    const expansionTargets = state.conquest.ai.expansionTargets;
    if (expansionTargets && expansionTargets.length > 0) {
      const target = findPathToExpansionTarget(regiment, expansionTargets);
      if (target) {
        moveRegiment(regiment, target);
        continue;
      }
    }
    
    // Default: Consolidate or patrol
    consolidateRegiment(regiment);
  }
}
```

### Battle Decisions

```javascript
function decideBattleEngagement(attackerRegiment, defenderRegiment) {
  const attackerState = attackerRegiment.state;
  const defenderState = defenderRegiment.state;
  
  // Check diplomatic relations
  const relation = getDiplomaticRelation(attackerState, defenderState);
  if (relation === "allied" || relation === "friendly") {
    return "avoid"; // Don't attack allies
  }
  
  // Calculate battle odds
  const odds = calculateBattleOdds(attackerRegiment, defenderRegiment);
  
  // AI personality affects risk tolerance
  const ai = pack.states[attackerState].conquest.ai;
  const riskTolerance = ai.personality.aggressive * ai.difficulty.strategicDepth;
  
  // Decision thresholds
  if (odds > 2.0 && riskTolerance > 1.5) {
    return "attack"; // Very favorable odds, aggressive AI
  } else if (odds > 1.5 && riskTolerance > 1.0) {
    return "attack"; // Good odds
  } else if (odds > 1.2) {
    return "attack"; // Slight advantage
  } else if (odds < 0.8) {
    return "avoid"; // Bad odds
  } else {
    return "wait"; // Uncertain, wait for better position
  }
}
```

---

## Diplomatic AI

### Alliance Decisions

```javascript
function decideAllianceProposal(stateId, targetStateId) {
  const state = pack.states[stateId];
  const ai = state.conquest.ai;
  
  // Base factors
  let desire = 0;
  
  // Shared enemies increase desire
  const sharedEnemies = getSharedEnemies(stateId, targetStateId);
  desire += sharedEnemies.length * 20;
  
  // Power balance
  const statePower = calculateStatePower(stateId);
  const targetPower = calculateStatePower(targetStateId);
  const powerRatio = targetPower / statePower;
  
  if (powerRatio > 1.5) {
    desire += 30; // Much stronger ally
  } else if (powerRatio > 1.2) {
    desire += 15; // Stronger ally
  }
  
  // Current threats
  const threats = getCurrentThreats(stateId);
  if (threats.length > 0) {
    desire += 25; // Under threat, seek allies
  }
  
  // AI personality
  desire *= ai.personality.diplomacy;
  
  // Random factor
  desire += (Math.random() - 0.5) * 20;
  
  // Decision threshold
  const threshold = ai.difficulty === "hard" ? 60 : 
                   ai.difficulty === "medium" ? 70 : 80;
  
  return desire > threshold;
}
```

### War Decisions

```javascript
function decideWarDeclaration(stateId, targetStateId) {
  const state = pack.states[stateId];
  const ai = state.conquest.ai;
  
  // Base factors
  let aggression = 0;
  
  // Power advantage
  const statePower = calculateStatePower(stateId);
  const targetPower = calculateStatePower(targetStateId);
  const powerRatio = statePower / targetPower;
  
  if (powerRatio > 2.0) aggression += 50; // Much stronger
  else if (powerRatio > 1.5) aggression += 30;
  else if (powerRatio > 1.2) aggression += 10;
  
  // Territorial disputes
  const borderTension = calculateBorderTension(stateId, targetStateId);
  aggression += borderTension * 10;
  
  // Recent provocations
  const recentActions = getRecentDiplomaticActions(targetStateId, 30);
  aggression += recentActions.filter(a => a.aggressive).length * 5;
  
  // Expansion goals
  if (ai.expansionTargets.some(t => 
    ConquestTerritory.getCellOwner(t.target) === targetStateId
  )) {
    aggression += 20;
  }
  
  // AI personality
  aggression *= ai.personality.aggressive;
  
  // Random factor
  aggression += (Math.random() - 0.5) * 15;
  
  // Decision threshold (lower for harder AI)
  const threshold = ai.difficulty === "hard" ? 40 : 
                   ai.difficulty === "medium" ? 50 : 60;
  
  return aggression > threshold;
}
```

---

## Economic AI

### Resource Management

```javascript
function manageResources(stateId) {
  const state = pack.states[stateId];
  const ai = state.conquest.ai;
  
  // Allocate resources based on priorities
  const priorities = {
    military: ai.personality.expansion > 1.0 ? 0.6 : 0.4,
    economy: ai.personality.diplomacy > 1.0 ? 0.4 : 0.3,
    defense: ai.personality.defense > 1.0 ? 0.3 : 0.2
  };
  
  // Military spending
  const militaryBudget = state.resources.gold * priorities.military;
  allocateMilitarySpending(stateId, militaryBudget);
  
  // Economic development
  const economicBudget = state.resources.gold * priorities.economy;
  allocateEconomicSpending(stateId, economicBudget);
  
  // Defensive improvements
  const defenseBudget = state.resources.gold * priorities.defense;
  allocateDefenseSpending(stateId, defenseBudget);
}
```

### Recruitment Decisions

```javascript
function decideRecruitment(stateId) {
  const state = pack.states[stateId];
  const ai = state.conquest.ai;
  
  // Check if we can afford recruitment
  if (state.resources.gold < 100) return;
  
  // Calculate desired army size
  const currentSize = getStateRegiments(stateId).length;
  const territorySize = getControlledCells(stateId).length;
  const desiredSize = Math.ceil(territorySize / 50); // 1 regiment per 50 cells
  
  if (currentSize >= desiredSize) return;
  
  // Prioritize unit types
  const priorities = {
    infantry: 0.4,
    cavalry: ai.personality.expansion > 1.0 ? 0.3 : 0.2,
    archers: 0.2,
    artillery: ai.personality.defense > 1.0 ? 0.2 : 0.1
  };
  
  // Recruit based on priorities
  const unitType = weightedRandomChoice(priorities);
  recruitRegiment(stateId, unitType);
}
```

---

## AI State Management

### AI State Structure

```javascript
// Add to pack.states[i].conquest
{
  ai: {
    personality: "aggressive",     // AI personality type
    difficulty: "medium",          // AI difficulty level
    
    // Strategic state
    expansionTargets: [],          // Current expansion goals
    threatAssessment: {},          // Threat levels by state
    alliancePreferences: {},       // Alliance desirability by state
    
    // Tactical state
    lastDecisionDay: 0,            // Last time strategic decisions were made
    reactionTimer: 0,              // Days until next reaction
    
    // Economic state
    resourcePriorities: {
      military: 0.5,
      economic: 0.3,
      defense: 0.2
    },
    
    // Memory
    recentEvents: [],              // Recent events affecting decisions
    grudges: {},                   // Long-term grudges against states
    favors: {}                     // Diplomatic favors owed/received
  }
}
```

### Decision Timing

```javascript
function shouldAIDecide(stateId) {
  const ai = pack.states[stateId].conquest.ai;
  const daysSinceDecision = FMG.State.Data.conquestDay - ai.lastDecisionDay;
  
  // Decision frequency based on difficulty and personality
  const baseFrequency = ai.difficulty.decisionFrequency;
  const personalityModifier = ai.personality.aggressive * 0.2; // Aggressive AIs decide more
  const frequency = Math.min(1.0, baseFrequency + personalityModifier);
  
  return Math.random() < (frequency * daysSinceDecision / 7); // Weekly average
}
```

---

## Implementation Phases

### Phase 1: Basic AI (MVP)
- ✅ Simple reactive movement (respond to threats)
- ✅ Basic attack decisions (favorable odds)
- ✅ No diplomacy (fixed relations)
- ✅ Minimal resource management

### Phase 2: Intermediate AI
- ✅ Strategic movement (expansion targets)
- ✅ Better battle decisions (odds calculation)
- ✅ Basic diplomacy (alliance offers, war declarations)
- ✅ Resource allocation (military vs economy)

### Phase 3: Advanced AI
- ✅ Personality-driven behavior
- ✅ Long-term planning and grudges
- ✅ Complex diplomacy (peace negotiations, trade)
- ✅ Economic optimization
- ✅ Adaptive tactics

---

## Performance Considerations

### Optimization Strategies

1. **Decision Batching**: Don't process all AI states every frame
2. **Priority Queue**: Process most active AI states first
3. **Simplified Calculations**: Use approximations for distant states
4. **Memory Limits**: Limit AI memory of past events
5. **Parallel Processing**: Process AI decisions in web workers

### Performance Targets
- AI decision time: < 500ms per state
- Total AI processing: < 2 seconds per day
- Memory usage: < 10MB for AI state
- No frame drops during AI processing

---

## Testing & Balancing

### AI Testing Framework

```javascript
function testAIDecisions(stateId, scenarios) {
  const results = {};
  
  for (const scenario of scenarios) {
    // Set up scenario
    setupTestScenario(scenario);
    
    // Run AI decision
    const decision = runAIDecision(stateId, scenario.type);
    
    // Evaluate decision
    results[scenario.name] = {
      decision,
      expected: scenario.expected,
      quality: evaluateDecisionQuality(decision, scenario.expected)
    };
  }
  
  return results;
}
```

### Test Scenarios

1. **Threat Response**: Enemy regiment approaches - should retreat or counter
2. **Opportunity Recognition**: Weak enemy nearby - should attack
3. **Alliance Evaluation**: Powerful neighbor offers alliance - should accept/reject
4. **War Declaration**: Weaker neighbor - should declare war?
5. **Peace Negotiation**: Losing war - should offer peace?

---

## Debug & Monitoring

### AI Debug UI

```html
<div id="aiDebugPanel" class="debug-panel">
  <h3>AI Debug - State: <span id="debugStateName"></span></h3>
  
  <div class="debug-section">
    <h4>Strategic State</h4>
    <div>Personality: <span id="debugPersonality"></span></div>
    <div>Expansion Targets: <span id="debugTargets"></span></div>
    <div>Threat Assessment: <pre id="debugThreats"></pre></div>
  </div>
  
  <div class="debug-section">
    <h4>Recent Decisions</h4>
    <div id="debugDecisions"></div>
  </div>
  
  <div class="debug-section">
    <h4>Performance Metrics</h4>
    <div>Decision Time: <span id="debugDecisionTime"></span>ms</div>
    <div>Actions This Day: <span id="debugActionCount"></span></div>
  </div>
</div>
```

---

## Summary

The AI system provides:

✅ **Strategic Depth**: Long-term planning and goal setting
✅ **Tactical Flexibility**: Responsive to changing battlefield conditions  
✅ **Diplomatic Intelligence**: Makes reasonable alliance and war decisions
✅ **Economic Management**: Allocates resources based on priorities
✅ **Personality Variation**: Different AI behaviors for replayability
✅ **Performance Optimized**: Efficient processing for large numbers of states
✅ **Debuggable**: Tools for monitoring and improving AI behavior

This creates challenging and varied opponents that make Conquest Mode engaging and replayable.
