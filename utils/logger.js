"use strict";
/**
 * Logger Utility
 * 
 * Provides consistent logging interface with conditional logging support.
 * Replaces the pattern: ERROR && console.error(...) with FMG.Utils.Logger.error(...)
 */

// Ensure FMG namespace exists
if (typeof window.FMG === 'undefined') {
  console.error('FMG namespace not initialized. Load core/namespace.js first.');
}

window.FMG.Utils = window.FMG.Utils || {};

window.FMG.Utils.Logger = {
  /**
   * Log an error message
   * @param {...any} args - Arguments to pass to console.error
   */
  error(...args) {
    if (window.FMG?.Config?.Constants?.ERROR) {
      console.error(...args);
    }
  },

  /**
   * Log an info message
   * @param {...any} args - Arguments to pass to console.info
   */
  info(...args) {
    if (window.FMG?.Config?.Constants?.INFO) {
      console.info(...args);
    }
  },

  /**
   * Log a warning message
   * @param {...any} args - Arguments to pass to console.warn
   */
  warn(...args) {
    if (window.FMG?.Config?.Constants?.WARN) {
      console.warn(...args);
    }
  },

  /**
   * Start a timer
   * @param {string} label - Timer label
   */
  time(label) {
    if (window.FMG?.Config?.Constants?.TIME) {
      console.time(label);
    }
  },

  /**
   * End a timer
   * @param {string} label - Timer label
   */
  timeEnd(label) {
    if (window.FMG?.Config?.Constants?.TIME) {
      console.timeEnd(label);
    }
  },

  /**
   * Start a console group
   * @param {...any} args - Arguments to pass to console.group
   */
  group(...args) {
    if (window.FMG?.Config?.Constants?.INFO) {
      console.group(...args);
    }
  },

  /**
   * End a console group
   * @param {...any} args - Arguments to pass to console.groupEnd
   */
  groupEnd(...args) {
    if (window.FMG?.Config?.Constants?.INFO) {
      console.groupEnd(...args);
    }
  },

  /**
   * Log a debug message (always logs, not conditional)
   * @param {...any} args - Arguments to pass to console.log
   */
  debug(...args) {
    console.log(...args);
  }
};

// Backward compatibility: Create global Logger reference
// This allows gradual migration
if (typeof window.Logger === 'undefined') {
  window.Logger = window.FMG.Utils.Logger;
}

