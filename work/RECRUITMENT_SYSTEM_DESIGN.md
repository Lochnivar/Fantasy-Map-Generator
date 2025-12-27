# Regiment Recruitment & Reinforcement System

## Overview

System for states to recruit new regiments and reinforce existing ones, providing dynamic military growth and sustainability.

---

## Recruitment Mechanics

### 1. Recruitment Requirements

```javascript
function canRecruitRegiment(stateId, unitType) {
  const state = pack.states[stateId];
  
  // Population requirement
  const requiredPopulation = UNIT_TYPES[unitType].populationCost;
  if (state.conquest.resources.population < requiredPopulation) {
    return { canRecruit: false, reason: "Insufficient population" };
  }
  
  // Gold requirement
  const requiredGold = UNIT_TYPES[unitType].goldCost;
  if (state.conquest.resources.gold < requiredGold) {
    return { canRecruit: false, reason: "Insufficient gold" };
  }
  
  // Facility requirement
  const requiredFacility = UNIT_TYPES[unitType].facility;
  const hasFacility = checkFacilityAvailability(stateId, requiredFacility);
  if (!hasFacility) {
    return { canRecruit: false, reason: `Requires ${requiredFacility}` };
  }
  
  return { canRecruit: true };
}
```

### 2. Unit Type Definitions

```javascript
const UNIT_TYPES = {
  infantry: {
    name: "Infantry Regiment",
    populationCost: 1000,
    goldCost: 200,
    trainingTime: 10,  // Days to recruit
    facility: "barracks",
    baseStrength: 100,
    supplyConsumption: 2,
    movementCost: 1.0,
    terrainModifier: { forest: 0.8, mountain: 0.9, desert: 1.1 }
  },
  
  cavalry: {
    name: "Cavalry Regiment", 
    populationCost: 800,
    goldCost: 300,
    trainingTime: 15,
    facility: "stables",
    baseStrength: 80,
    supplyConsumption: 3,
    movementCost: 0.8,
    terrainModifier: { plains: 0.7, forest: 1.3, mountain: 1.5 }
  },
  
  archers: {
    name: "Archer Regiment",
    populationCost: 900,
    goldCost: 250,
    trainingTime: 12,
    facility: "archery_range",
    baseStrength: 70,
    supplyConsumption: 2.5,
    movementCost: 1.0,
    terrainModifier: { hills: 0.8, forest: 0.9, plains: 1.1 }
  },
  
  artillery: {
    name: "Artillery Regiment",
    populationCost: 600,
    goldCost: 400,
    trainingTime: 20,
    facility: "foundry",
    baseStrength: 50,
    supplyConsumption: 4,
    movementCost: 1.2,
    terrainModifier: { plains: 0.9, hills: 0.8, mountain: 1.4 }
  }
};
```

---

## Recruitment Process

### 1. Recruitment Queue

```javascript
// State conquest extension
{
  recruitment: {
    queue: [
      {
        unitType: "infantry",
        startDay: 15,
        completionDay: 25,
        cost: { gold: 200, population: 1000 },
        location: "burg_5"  // Burg ID where recruiting
      }
    ],
    maxQueueSize: 5,
    recruitmentRate: 1.0  // Multiplier for training speed
  }
}
```

### 2. Queue Management

```javascript
function addToRecruitmentQueue(stateId, unitType, location) {
  const state = pack.states[stateId];
  const unitDef = UNIT_TYPES[unitType];
  
  // Check queue capacity
  if (state.conquest.recruitment.queue.length >= state.conquest.recruitment.maxQueueSize) {
    return { success: false, reason: "Recruitment queue full" };
  }
  
  // Check requirements
  const canRecruit = canRecruitRegiment(stateId, unitType);
  if (!canRecruit.canRecruit) {
    return canRecruit;
  }
  
  // Check location validity
  if (!isValidRecruitmentLocation(stateId, location)) {
    return { success: false, reason: "Invalid recruitment location" };
  }
  
  // Deduct immediate costs
  state.conquest.resources.gold -= unitDef.goldCost;
  state.conquest.resources.population -= unitDef.populationCost;
  
  // Add to queue
  const startDay = FMG.State.Data.conquestDay;
  const completionDay = startDay + unitDef.trainingTime;
  
  state.conquest.recruitment.queue.push({
    unitType,
    startDay,
    completionDay,
    cost: { gold: unitDef.goldCost, population: unitDef.populationCost },
    location
  });
  
  return { success: true };
}
```

### 3. Recruitment Completion

```javascript
function processRecruitmentQueue(stateId) {
  const state = pack.states[stateId];
  const queue = state.conquest.recruitment.queue;
  const currentDay = FMG.State.Data.conquestDay;
  
  // Process completed recruitments
  for (let i = queue.length - 1; i >= 0; i--) {
    const recruitment = queue[i];
    
    if (currentDay >= recruitment.completionDay) {
      // Create new regiment
      const regiment = createRegiment(stateId, recruitment.unitType, recruitment.location);
      
      // Remove from queue
      queue.splice(i, 1);
      
      // Notification
      tip(`New ${recruitment.unitType} regiment recruited in ${getBurgName(recruitment.location)}`, true, "success");
    }
  }
}
```

---

## Reinforcement System

### 1. Reinforcement Requirements

```javascript
function canReinforceRegiment(regiment) {
  // Must be in friendly territory
  const cellOwner = ConquestTerritory.getCellOwner(regiment.cell);
  if (cellOwner !== regiment.state) {
    return { canReinforce: false, reason: "Must be in friendly territory" };
  }
  
  // Must be at a city with recruitment facilities
  const nearbyBurg = findNearbyBurg(regiment.cell, 2);
  if (!nearbyBurg || !hasRecruitmentFacilities(nearbyBurg, regiment.primaryUnitType)) {
    return { canReinforce: false, reason: "No suitable recruitment facilities nearby" };
  }
  
  // Must have supplies
  if (regiment.supplies < 50) {
    return { canReinforce: false, reason: "Insufficient supplies for reinforcement" };
  }
  
  // Must have gold
  const reinforcementCost = calculateReinforcementCost(regiment);
  const state = pack.states[regiment.state];
  if (state.conquest.resources.gold < reinforcementCost) {
    return { canReinforce: false, reason: "Insufficient gold for reinforcement" };
  }
  
  return { canReinforce: true };
}
```

### 2. Reinforcement Process

```javascript
function reinforceRegiment(regimentId, targetStrength) {
  const regiment = getRegiment(regimentId);
  const currentStrength = regiment.a;
  const maxStrength = regiment.maxStrength || 100;
  
  // Calculate reinforcement needed
  const reinforcementNeeded = Math.min(targetStrength, maxStrength) - currentStrength;
  if (reinforcementNeeded <= 0) {
    return { success: false, reason: "Regiment already at target strength" };
  }
  
  // Calculate costs
  const goldCost = reinforcementNeeded * 2; // 2 gold per troop
  const supplyCost = reinforcementNeeded * 0.5; // 0.5 supplies per troop
  
  // Check resources
  const state = pack.states[regiment.state];
  if (state.conquest.resources.gold < goldCost) {
    return { success: false, reason: "Insufficient gold" };
  }
  if (regiment.supplies < supplyCost) {
    return { success: false, reason: "Insufficient supplies" };
  }
  
  // Apply reinforcement
  regiment.a += reinforcementNeeded;
  state.conquest.resources.gold -= goldCost;
  regiment.supplies -= supplyCost;
  
  // Reset exhaustion (reinforcements are fresh)
  regiment.exhaustion = Math.max(0, regiment.exhaustion - 20);
  
  return { success: true, reinforced: reinforcementNeeded };
}
```

---

## Facilities & Infrastructure

### 1. Recruitment Facilities

```javascript
const FACILITIES = {
  barracks: {
    name: "Barracks",
    description: "Allows recruitment of infantry regiments",
    buildCost: { gold: 500, population: 200 },
    buildTime: 30,
    maintenance: 10,  // Gold per day
    allows: ["infantry"]
  },
  
  stables: {
    name: "Stables",
    description: "Allows recruitment of cavalry regiments", 
    buildCost: { gold: 400, population: 150 },
    buildTime: 25,
    maintenance: 8,
    allows: ["cavalry"]
  },
  
  archery_range: {
    name: "Archery Range",
    description: "Allows recruitment of archer regiments",
    buildCost: { gold: 350, population: 100 },
    buildTime: 20,
    maintenance: 6,
    allows: ["archers"]
  },
  
  foundry: {
    name: "Foundry",
    description: "Allows recruitment of artillery regiments",
    buildCost: { gold: 800, population: 300 },
    buildTime: 45,
    maintenance: 15,
    allows: ["artillery"]
  }
};
```

### 2. Facility Management

```javascript
function buildFacility(burgId, facilityType) {
  const burg = pack.burgs[burgId];
  const facility = FACILITIES[facilityType];
  const state = pack.states[burg.state];
  
  // Check requirements
  if (state.conquest.resources.gold < facility.buildCost.gold) {
    return { success: false, reason: "Insufficient gold" };
  }
  if (burg.population < facility.buildCost.population) {
    return { success: false, reason: "Insufficient local population" };
  }
  
  // Deduct costs
  state.conquest.resources.gold -= facility.buildCost.gold;
  burg.population -= facility.buildCost.population;
  
  // Add to construction queue
  if (!burg.construction) burg.construction = [];
  burg.construction.push({
    type: "facility",
    facilityType,
    startDay: FMG.State.Data.conquestDay,
    completionDay: FMG.State.Data.conquestDay + facility.buildTime
  });
  
  return { success: true };
}
```

---

## Population & Resource Dynamics

### 1. Population Growth

```javascript
function processPopulationGrowth(stateId) {
  const state = pack.states[stateId];
  
  // Base growth rate (1% per day)
  const baseGrowth = 0.01;
  
  // Factors affecting growth
  let growthModifier = 1.0;
  
  // Food availability
  const foodRatio = state.conquest.resources.food / state.conquest.resources.population;
  if (foodRatio > 1.5) growthModifier *= 1.2;  // Surplus food increases growth
  else if (foodRatio < 0.8) growthModifier *= 0.5; // Food shortage reduces growth
  
  // War reduces growth
  const atWar = Object.values(state.conquest.diplomacy.relations).includes("war");
  if (atWar) growthModifier *= 0.7;
  
  // Calculate growth
  const growth = state.conquest.resources.population * baseGrowth * growthModifier;
  state.conquest.resources.population += Math.floor(growth);
  
  // Cap at carrying capacity
  const territoryCells = getControlledCells(stateId).length;
  const carryingCapacity = territoryCells * 50; // 50 people per cell
  state.conquest.resources.population = Math.min(
    state.conquest.resources.population, 
    carryingCapacity
  );
}
```

### 2. Resource Generation

```javascript
function generateStateResources(stateId) {
  const state = pack.states[stateId];
  const controlledCells = getControlledCells(stateId);
  
  // Gold from cities and trade
  let goldIncome = 0;
  controlledCells.forEach(cellId => {
    const burg = findBurgInCell(cellId);
    if (burg) {
      goldIncome += calculateBurgIncome(burg);
    }
  });
  
  // Supplies from territory
  let supplyIncome = controlledCells.length * 5; // 5 supplies per cell
  
  // Trade bonuses
  const tradeBonus = getTradeBonus(stateId);
  goldIncome *= tradeBonus;
  supplyIncome *= tradeBonus;
  
  // Apply to state
  state.conquest.resources.gold += goldIncome;
  state.conquest.resources.supplies += supplyIncome;
}
```

---

## AI Recruitment Behavior

### 1. AI Recruitment Strategy

```javascript
function processAIRecruitment(stateId) {
  const state = pack.states[stateId];
  const ai = state.conquest.ai;
  
  // Skip if AI not active
  if (!isAIControlled(stateId)) return;
  
  // Check if we need more regiments
  const currentRegiments = getStateRegiments(stateId).length;
  const optimalRegiments = calculateOptimalRegimentCount(stateId);
  
  if (currentRegiments >= optimalRegiments) return;
  
  // Determine what to recruit
  const recruitmentPriority = calculateRecruitmentPriority(stateId);
  
  // Try to recruit highest priority unit
  for (const unitType of recruitmentPriority) {
    if (canRecruitRegiment(stateId, unitType).canRecruit) {
      const location = findBestRecruitmentLocation(stateId, unitType);
      if (location) {
        addToRecruitmentQueue(stateId, unitType, location);
        break; // Only recruit one at a time
      }
    }
  }
}
```

### 2. AI Reinforcement Strategy

```javascript
function processAIReinforcement(stateId) {
  const state = pack.states[stateId];
  const regiments = getStateRegiments(stateId);
  
  // Reinforce under-strength regiments
  for (const regiment of regiments) {
    if (regiment.a < regiment.maxStrength * 0.8) { // Below 80% strength
      if (canReinforceRegiment(regiment).canReinforce) {
        const targetStrength = Math.min(
          regiment.maxStrength, 
          regiment.a + 20 // Reinforce by 20 troops
        );
        reinforceRegiment(regiment.id, targetStrength);
      }
    }
  }
}
```

---

## UI Implementation

### Recruitment Interface

```html
<div id="recruitmentPanel" class="panel">
  <h3>Recruitment - <span id="recruitmentStateName"></span></h3>
  
  <!-- Current Resources -->
  <div class="resource-display">
    <div>Gold: <span id="recruitmentGold"></span></div>
    <div>Population: <span id="recruitmentPopulation"></span></div>
  </div>
  
  <!-- Recruitment Queue -->
  <div class="recruitment-queue">
    <h4>Recruitment Queue (<span id="queueCount">0</span>/<span id="maxQueue">5</span>)</h4>
    <div id="queueList" class="queue-list">
      <!-- Dynamic queue items -->
    </div>
  </div>
  
  <!-- Available Units -->
  <div class="available-units">
    <h4>Available Units</h4>
    
    <div class="unit-card" data-unit="infantry">
      <h5>Infantry Regiment</h5>
      <div class="unit-cost">Cost: 200 Gold, 1000 Population</div>
      <div class="unit-time">Time: 10 days</div>
      <button class="recruit-btn" onclick="recruitUnit('infantry')">Recruit</button>
    </div>
    
    <div class="unit-card" data-unit="cavalry">
      <h5>Cavalry Regiment</h5>
      <div class="unit-cost">Cost: 300 Gold, 800 Population</div>
      <div class="unit-time">Time: 15 days</div>
      <button class="recruit-btn" onclick="recruitUnit('cavalry')">Recruit</button>
    </div>
    
    <!-- More unit cards -->
  </div>
</div>
```

---

## Balance Considerations

### Economic Balance

1. **Recruitment Costs**: Should scale with game progress
2. **Training Times**: Longer for advanced units
3. **Resource Competition**: Gold vs supplies vs population
4. **Facility Requirements**: Prevents early game spam

### Military Balance

1. **Unit Effectiveness**: Different units for different situations
2. **Reinforcement Speed**: Faster for basic units
3. **Supply Requirements**: Advanced units need more supplies
4. **Terrain Compatibility**: Units have strengths/weaknesses

### Population Balance

1. **Growth Rate**: Slow enough to be meaningful
2. **Carrying Capacity**: Based on territory size
3. **Recruitment Impact**: Significant population reduction
4. **Recovery Time**: Population grows back over time

---

## Implementation Phases

### Phase 1: Basic Recruitment
- ✅ Simple recruitment (no queue, instant)
- ✅ Basic unit types (infantry, cavalry)
- ✅ Population and gold costs
- ✅ Facility requirements

### Phase 2: Advanced Recruitment
- ✅ Recruitment queue system
- ✅ Multiple unit types
- ✅ Reinforcement system
- ✅ Training times

### Phase 3: Full System
- ✅ Population dynamics
- ✅ Facility construction
- ✅ AI recruitment behavior
- ✅ Economic balancing

---

## Summary

The recruitment and reinforcement system provides:

✅ **Dynamic Military Growth**: States can expand their armies over time
✅ **Resource Management**: Population, gold, and facilities as constraints
✅ **Strategic Depth**: Different unit types with unique capabilities
✅ **Economic Integration**: Recruitment affects state economy
✅ **AI Integration**: AI states recruit and reinforce intelligently
✅ **Balance Controls**: Costs and times prevent exploitation

This creates a sustainable military system where states must manage resources and infrastructure to maintain their armies.
