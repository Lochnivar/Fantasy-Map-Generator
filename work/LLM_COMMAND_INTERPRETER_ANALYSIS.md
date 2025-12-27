# LLM Command Interpreter: Capability Analysis

## Overview

This document analyzes whether Ollama (or other LLMs) can reliably handle the complexity of natural language command interpretation for Conquest Mode, including both military and diplomatic actions.

---

## What We're Asking the LLM to Do

### 1. Military Commands
- **Actions**: move, attack, defend, merge, split, reinforce, retreat
- **Target Types**: cell, regiment, burg, state, direction
- **Examples**:
  - "Attack Steelsburg"
  - "Move north"
  - "Attack the city to the north"
  - "Reinforce the 3rd regiment"
  - "Merge with the southern army"

### 2. Diplomatic Commands
- **Actions**: declare war, form alliance, make peace, break alliance, propose trade, denounce, offer tribute
- **Target**: Always a state (by name)
- **Examples**:
  - "Form alliance with Steelsburg"
  - "Declare war on the eastern empire"
  - "Make peace with Rutarakia"
  - "Break alliance with Kutiograd"

### 3. Required Capabilities
- Parse natural language intent
- Identify action type from command
- Extract target (name or direction)
- Match state/city names (with fuzzy matching)
- Return structured JSON consistently
- Understand context (but we validate client-side)

---

## Potential Challenges

### 1. **Name Matching Accuracy**

**Problem:**
- LLM might hallucinate names that don't exist
- LLM might mis-match similar names ("Steelsburg" vs "Steelburg")
- Player might use abbreviations or nicknames

**Mitigation Strategy:**
```javascript
// Client-side name matching with fallbacks
function resolveTargetName(parsedCommand, context) {
  if (!parsedCommand.target.name) return null;
  
  // Strategy 1: Exact match (case-insensitive)
  let match = context.allStates.find(s => 
    s.name.toLowerCase() === parsedCommand.target.name.toLowerCase()
  );
  if (match) return match.id;
  
  // Strategy 2: Partial match
  match = context.allStates.find(s => 
    s.name.toLowerCase().includes(parsedCommand.target.name.toLowerCase()) ||
    parsedCommand.target.name.toLowerCase().includes(s.name.toLowerCase())
  );
  if (match) return match.id;
  
  // Strategy 3: Fuzzy match (Levenshtein distance)
  match = findBestFuzzyMatch(parsedCommand.target.name, context.allStates);
  if (match && match.confidence > 0.7) return match.id;
  
  // If no match, return null (validation will catch this)
  return null;
}
```

**Verdict:** ✅ **Manageable** - Client-side validation catches LLM errors

---

### 2. **JSON Output Reliability**

**Problem:**
- LLM might return malformed JSON
- LLM might add explanatory text outside JSON
- LLM might omit required fields

**Mitigation Strategy:**
```javascript
function parseCommandResponse(response) {
  // Extract JSON from response (handles markdown code blocks)
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }
  
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!parsed.action) {
      throw new Error("Missing 'action' field");
    }
    
    // Set defaults for missing optional fields
    return {
      action: parsed.action,
      targetType: parsed.targetType || null,
      target: {
        cellId: parsed.target?.cellId || null,
        burgId: parsed.target?.burgId || null,
        direction: parsed.target?.direction || null,
        name: parsed.target?.name || null,
        // ...
      },
      confidence: parsed.confidence || 0.8
    };
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
}
```

**Verdict:** ✅ **Manageable** - JSON extraction and validation handle most issues

---

### 3. **Context Understanding Limitations**

**Problem:**
- LLM might suggest invalid actions (e.g., "attack ally")
- LLM doesn't understand game rules deeply
- LLM might misinterpret ambiguous commands

**Mitigation Strategy:**
```javascript
// Client-side validation catches invalid actions
function validateCommand(parsedCommand, context) {
  // Check if action is valid for current context
  if (parsedCommand.action === "attack") {
    const targetState = resolveTargetState(parsedCommand);
    const relation = getDiplomaticRelation(context.selectedState, targetState);
    
    if (relation === "allied") {
      return {
        valid: false,
        reason: "Cannot attack allies. Break alliance first.",
        suggestion: "Did you mean to break alliance?"
      };
    }
  }
  
  // More validation rules...
  return { valid: true, command: parsedCommand };
}
```

**Verdict:** ✅ **Manageable** - Client-side validation enforces game rules

---

### 4. **Model Performance Variability**

**Problem:**
- Smaller local models (7B-13B) might be less reliable
- Response times vary by model size
- Some models struggle with structured output

**Mitigation Strategy:**
```javascript
// Use appropriate model based on complexity
function getRecommendedModel() {
  // Recommend larger models for better reliability
  const recommendations = {
    "llama3.3:70b": "Best for accuracy (slow)",
    "llama3.1:70b": "Very good (slow)",
    "llama3.1:8b": "Good balance (fast)",
    "llama3:8b": "Acceptable (very fast)"
  };
  
  // Check user's available models
  return localStorage.getItem("ollamaModel") || "llama3.1:8b";
}

// Provide fallback to UI-based commands if LLM fails
function handleCommandError(error, originalCommand) {
  tip(`LLM command failed: ${error.message}. Use UI buttons instead.`, false, "error");
  
  // Optionally suggest UI alternative
  showCommandAlternative(originalCommand);
}
```

**Verdict:** ⚠️ **Depends on model** - Larger models more reliable, but slower

---

### 5. **Prompt Complexity**

**Problem:**
- Large context (all states, all cities) might confuse smaller models
- Long prompts = slower responses
- Information overload might reduce accuracy

**Mitigation Strategy:**
```javascript
// Provide relevant context only
function buildCommandPrompt(command, context) {
  // Include only nearby/relevant targets (not all states/cities)
  const relevantTargets = getRelevantTargets(context.selectedRegiment, 10); // 10 closest
  
  return `You are a command interpreter for a fantasy military simulation.

Selected Unit:
- Location: Cell ${context.selectedRegiment.cell}
- State: ${context.selectedRegiment.stateName}

Nearby Targets (within 10 cells):
${formatNearbyTargets(relevantTargets)}

All State Names (for reference):
${context.allStates.map(s => s.name).join(", ")}

Available Actions: move, attack, defend, merge, split, reinforce, retreat

User Command: "${command}"

Return ONLY JSON:
{
  "action": "move" | "attack" | "defend" | "merge" | "split" | "reinforce" | "retreat" | "invalid",
  "targetType": "cell" | "burg" | "state" | "direction" | null,
  "target": {
    "name": string | null,
    "direction": "north" | "south" | "east" | "west" | null
  }
}`;
}
```

**Verdict:** ✅ **Optimizable** - Can reduce prompt size significantly

---

## Recommended Approach: Hybrid System

### Primary: LLM for Natural Language
- Use LLM to parse natural language intent
- Extract action and target from command
- Return structured data

### Secondary: Client-Side Validation & Resolution
- Validate parsed command against game rules
- Resolve names to IDs (with fuzzy matching)
- Enforce game constraints (can't attack allies, etc.)
- Provide helpful error messages

### Fallback: Traditional UI
- Always available as backup
- User can use buttons/click interface
- LLM is a convenience feature, not required

---

## Implementation Strategy

### Phase 1: Basic LLM Integration (MVP)
```javascript
// Simple command interpreter
async function interpretCommand(command, context) {
  try {
    // Build focused prompt
    const prompt = buildSimplePrompt(command, context);
    
    // Call LLM
    const response = await callOllama(prompt);
    
    // Parse JSON
    const parsed = parseJSON(response);
    
    // Validate and resolve
    const validated = validateCommand(parsed, context);
    const resolved = resolveTargets(validated, context);
    
    return resolved;
  } catch (error) {
    // Fallback: suggest UI alternative
    handleLLMError(error, command);
    return null;
  }
}
```

**Scope:**
- Support basic actions: move, attack
- Support named targets (cities/states)
- Support directions (north, south, etc.)
- Simple error handling

### Phase 2: Enhanced LLM Integration
- Add diplomatic commands
- Add complex actions (merge, split, reinforce)
- Better error messages
- Confidence scoring

### Phase 3: Advanced Features
- Multi-step commands ("attack then retreat")
- Conditional commands ("if successful, then...")
- Context memory (reference previous commands)

---

## Testing Strategy

### Test Cases

**1. Name Matching:**
- ✅ "Attack Steelsburg" → matches "Steelsburg"
- ✅ "Attack Steel" → fuzzy matches "Steelsburg"
- ✅ "Attack the Steel City" → partial matches "Steelsburg"
- ❌ "Attack Steelburg" → should suggest "Did you mean Steelsburg?"

**2. Action Recognition:**
- ✅ "Form alliance with Steelsburg" → action: "form_alliance"
- ✅ "Declare war on the eastern state" → action: "declare_war"
- ✅ "Make peace with Rutarakia" → action: "make_peace"

**3. Invalid Commands:**
- ✅ "Attack ally Steelsburg" → validation: "Cannot attack allies"
- ✅ "Move to invalid location" → validation: "Invalid target"
- ✅ "Gibberish command" → validation: "Command not understood"

**4. Edge Cases:**
- ✅ Empty command
- ✅ Very long command
- ✅ Command with typos
- ✅ Command in different language (if supported)

---

## Model Recommendations

### Minimum Requirements
- **Model Size**: 7B+ parameters (llama3:8b, llama3.1:8b)
- **Format**: JSON mode support (or very reliable structured output)
- **Speed**: < 3 seconds for command parsing

### Recommended Models
1. **llama3.1:70b** - Best accuracy, slower
2. **llama3.1:8b** - Good balance
3. **mistral:7b** - Good structured output
4. **qwen2.5:7b** - Fast, reliable

### Model Selection UI
```html
<select id="ollamaModel">
  <option value="llama3.1:70b">llama3.1:70b (Best quality, slower)</option>
  <option value="llama3.1:8b" selected>llama3.1:8b (Recommended)</option>
  <option value="llama3:8b">llama3:8b (Fast, acceptable quality)</option>
  <option value="mistral:7b">mistral:7b (Good structured output)</option>
</select>
```

---

## Expected Success Rates

### With Good Model (llama3.1:8b+)
- **Simple Commands**: 90-95% success ("Attack Steelsburg")
- **Complex Commands**: 80-85% success ("Form alliance with the eastern state")
- **Ambiguous Commands**: 70-75% success (requires clarification)

### With Smaller Model (llama3:8b)
- **Simple Commands**: 80-85% success
- **Complex Commands**: 65-75% success
- **Ambiguous Commands**: 50-60% success

### Mitigation
- Client-side validation catches most errors
- User can always use UI as fallback
- Error messages guide user to correct command

---

## Alternative Approaches

### Option 1: Pattern Matching + LLM Fallback
```javascript
// Try pattern matching first (faster, more reliable for simple cases)
function interpretCommand(command) {
  // Simple regex patterns for common commands
  const patterns = [
    { regex: /attack\s+(.+)/i, action: "attack", extract: (m) => m[1] },
    { regex: /move\s+(north|south|east|west)/i, action: "move", extract: (m) => m[1] },
    // ...
  ];
  
  for (const pattern of patterns) {
    const match = command.match(pattern.regex);
    if (match) {
      return { action: pattern.action, target: pattern.extract(match) };
    }
  }
  
  // If no pattern matches, use LLM
  return interpretWithLLM(command);
}
```

**Pros:** Faster, more reliable for simple commands
**Cons:** Limited flexibility, requires maintenance

### Option 2: LLM Only (Current Design)
**Pros:** Maximum flexibility, handles any command
**Cons:** Slower, less reliable, requires good model

### Option 3: Hybrid (Recommended)
**Pros:** Best of both worlds
**Cons:** More complex implementation

---

## Conclusion

### Can the LLM Handle This? **YES, with caveats:**

✅ **What LLM Does Well:**
- Natural language understanding
- Intent extraction
- Flexible command parsing
- Handling variations in phrasing

⚠️ **What Needs Client-Side Support:**
- Name matching (with fuzzy fallbacks)
- Game rule validation
- Error handling
- Target resolution

❌ **What LLM Can't Do:**
- Enforce game rules (validate client-side)
- Guarantee 100% accuracy (provide UI fallback)
- Handle edge cases perfectly (validate and correct)

### Recommendation: **Hybrid Approach**

1. **Use LLM** for natural language parsing (primary)
2. **Use Client-Side Logic** for validation and resolution (critical)
3. **Provide UI Fallback** for when LLM fails (essential)

This approach:
- ✅ Gives users the convenience of natural language
- ✅ Maintains reliability through validation
- ✅ Provides fallback when needed
- ✅ Works with various model sizes (with different quality levels)

### Implementation Priority

1. **Phase 1**: Basic LLM integration with strong validation (MVP)
2. **Phase 2**: Enhanced LLM with better prompts and error handling
3. **Phase 3**: Pattern matching hybrid for common commands (optimization)

The LLM is a **convenience feature**, not a core requirement. The system should work well even if LLM interpretation is disabled.

