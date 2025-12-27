# Quick Start Guide

## Running the Application Locally

This application **requires** an HTTP server - it cannot run from `file://` protocol due to browser security restrictions.

### Option 1: Python (Recommended - Easiest)

**Windows:**
```bash
# Double-click this file, or run in terminal:
run_python_server.bat
```

**Mac/Linux:**
```bash
# Run this script, or run directly:
./run_python_server.sh

# Or manually:
python3 -m http.server 8000
```

Then open your browser to: **http://localhost:8000**

### Option 2: Python Manual Command

Open a terminal in the project directory and run:

```bash
# Python 3
python3 -m http.server 8000

# Or Python 2 (if Python 3 not available)
python -m http.server 8000
```

Then open: **http://localhost:8000**

### Option 3: Node.js (if you have it)

```bash
npx http-server -p 8000
```

Then open: **http://localhost:8000**

### Option 4: PHP (if you have it)

```bash
php -S localhost:8000
```

Then open: **http://localhost:8000**

---

## Testing the Namespace Changes

After starting the server:

1. **Open browser console** (F12 or Right-click → Inspect → Console)
2. **Check namespace exists:**
   ```javascript
   console.log(window.FMG);
   ```
   Should show the namespace structure with Modules, Utils, State, etc.

3. **Test a migrated module:**
   ```javascript
   // Old way (should still work)
   console.log(Biomes);
   
   // New way
   console.log(FMG.Modules.Biomes);
   
   // Both should be the same object
   console.log(Biomes === FMG.Modules.Biomes); // true
   ```

4. **Generate a map:**
   - Click the "►" button to open the menu
   - Click "New Map!" to generate a map
   - Verify it generates correctly

5. **Check for errors:**
   - Look in console for any errors
   - Map should generate with countries, cities, roads, etc.

---

## Entry Point

The main entry point is: **`index.html`**

This file:
- Loads all dependencies (jQuery, D3.js, etc.)
- Loads core namespace files (`core/namespace.js`, `config/constants.js`, `core/state.js`)
- Loads all utility files
- Loads all module files
- Loads `main.js` which initializes the application

---

## Troubleshooting

### "Cannot GET /" or 404 errors
- Make sure you're running the server from the project root directory
- The server should be serving `index.html` as the default file

### CORS errors or module loading issues
- You MUST use an HTTP server (not `file://`)
- Make sure all files are in the correct directories

### Map doesn't generate
- Check browser console for JavaScript errors
- Verify all files loaded correctly (check Network tab)
- Try refreshing the page

### Namespace not found
- Check that `core/namespace.js` loaded first
- Check browser console for any script loading errors
- Verify the script tags in `index.html` are in the correct order

---

## What to Test

After our namespace migration:

✅ **Verify backward compatibility:**
- Old code like `Biomes.define()` should still work
- Old code like `Rivers.generate()` should still work

✅ **Verify new namespace:**
- `FMG.Modules.Biomes.define()` should work
- `FMG.Modules.Rivers.generate()` should work

✅ **Verify map generation:**
- Generate a new map
- Check that all features work (countries, cities, rivers, etc.)
- Verify no console errors

---

## Quick Test Script

Open browser console and run:

```javascript
// Test namespace structure
console.log('FMG namespace:', window.FMG);
console.log('Modules:', Object.keys(window.FMG.Modules));

// Test backward compatibility
console.log('Biomes (old):', window.Biomes);
console.log('Biomes (new):', window.FMG.Modules.Biomes);
console.log('Same object?', window.Biomes === window.FMG.Modules.Biomes);

// Test a module function
if (window.FMG.Modules.Biomes) {
  const biomes = window.FMG.Modules.Biomes.getDefault();
  console.log('Biomes loaded:', biomes ? '✅' : '❌');
}
```

All tests should pass! ✅

