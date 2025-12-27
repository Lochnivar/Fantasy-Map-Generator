# 🚀 START HERE - How to Run the Application

## Quick Start (Windows)

**Easiest way:** Double-click `run_python_server.bat`

This will:
1. Start a local web server on port 8000
2. The server will keep running (don't close the window)
3. Open your browser to: **http://localhost:8000**

---

## Manual Start (Any OS)

### Step 1: Open Terminal/Command Prompt

Navigate to the project folder:
```bash
cd "C:\Users\MichaelL\Documents\Personal\Fantasy-Map-Generator"
```

### Step 2: Start the Server

**Python 3:**
```bash
python3 -m http.server 8000
```

**Or Python 2:**
```bash
python -m http.server 8000
```

### Step 3: Open Browser

Go to: **http://localhost:8000**

---

## ⚠️ Important Notes

1. **You MUST use a web server** - opening `index.html` directly won't work
2. **Keep the server running** - don't close the terminal window
3. **The entry point is `index.html`** - the server will serve it automatically

---

## Testing the Namespace Changes

Once the app is running:

1. **Open Browser Console** (Press F12)
2. **Check the namespace:**
   ```javascript
   console.log(window.FMG);
   ```
3. **Test a module:**
   ```javascript
   // Both should work:
   console.log(Biomes);                    // Old way
   console.log(FMG.Modules.Biomes);        // New way
   ```
4. **Generate a map** - Click "►" then "New Map!"

---

## Need Help?

See `QUICK_START.md` for more detailed instructions and troubleshooting.

