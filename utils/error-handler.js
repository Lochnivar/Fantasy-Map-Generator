"use strict";
/**
 * Error Handler Utility
 * 
 * Provides consistent error handling throughout the application.
 * Centralizes error logging and user notification.
 */

// Ensure FMG namespace exists
if (typeof window.FMG === 'undefined') {
  console.error('FMG namespace not initialized. Load core/namespace.js first.');
}

window.FMG.Utils = window.FMG.Utils || {};

window.FMG.Utils.Error = {
  /**
   * Handle an error with consistent logging and optional user notification
   * @param {Error|string} error - Error object or error message
   * @param {string} context - Context where error occurred (e.g., "generate", "rankCells")
   * @param {boolean} showDialog - Whether to show error dialog to user (default: false)
   * @param {Object} options - Additional options
   * @param {Function} options.onError - Callback function to execute on error
   * @returns {string} Parsed error message
   */
  handle(error, context, showDialog = false, options = {}) {
    const errorMessage = typeof error === 'string' ? error : this.parseError(error);
    const fullMessage = `[${context}] ${errorMessage}`;
    
    // Log error
    FMG.Utils.Logger.error(fullMessage, error);
    
    // Show dialog if requested
    if (showDialog) {
      FMG.Utils.Dialog.showError(error, `${context} Error`);
    }
    
    // Execute callback if provided
    if (options.onError && typeof options.onError === 'function') {
      try {
        options.onError(error, context);
      } catch (callbackError) {
        FMG.Utils.Logger.error(`[${context}] Error in error callback:`, callbackError);
      }
    }
    
    return errorMessage;
  },

  /**
   * Parse error object to string message
   * @param {Error|*} error - Error object
   * @returns {string} Error message
   */
  parseError(error) {
    if (typeof error === 'string') return error;
    if (error instanceof Error) {
      return error.message || error.toString();
    }
    if (error && typeof error === 'object') {
      try {
        return JSON.stringify(error);
      } catch {
        return String(error);
      }
    }
    return String(error);
  },

  /**
   * Wrap a function with error handling
   * @param {Function} fn - Function to wrap
   * @param {string} context - Context name for error messages
   * @param {boolean} showDialog - Whether to show error dialog
   * @returns {Function} Wrapped function
   */
  wrap(fn, context, showDialog = false) {
    return function(...args) {
      try {
        const result = fn.apply(this, args);
        // Handle async functions
        if (result instanceof Promise) {
          return result.catch(error => {
            FMG.Utils.Error.handle(error, context, showDialog);
            throw error; // Re-throw to maintain error propagation
          });
        }
        return result;
      } catch (error) {
        FMG.Utils.Error.handle(error, context, showDialog);
        throw error; // Re-throw to maintain error propagation
      }
    };
  },

  /**
   * Handle generation-specific errors
   * @param {Error} error - Error object
   */
  handleGenerationError(error) {
    FMG.Utils.Logger.error(error);
    clearMainTip();
    FMG.Utils.Dialog.showGenerationError(error);
  },

  /**
   * Handle calculation errors (non-critical, log only)
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   */
  handleCalculationError(error, context) {
    FMG.Utils.Logger.error(`[${context}] Calculation error:`, error);
    // Don't show dialog for calculation errors, just log
  }
};

// Backward compatibility: Create global Error handler reference
// This allows gradual migration
if (typeof window.ErrorHandler === 'undefined') {
  window.ErrorHandler = window.FMG.Utils.Error;
}

