"use strict";
/**
 * Dialog Utility
 * 
 * Provides consistent dialog interface for error messages, confirmations, and alerts.
 * Replaces duplicated error dialog patterns throughout the codebase.
 */

// Ensure FMG namespace exists
if (typeof window.FMG === 'undefined') {
  console.error('FMG namespace not initialized. Load core/namespace.js first.');
}

window.FMG.Utils = window.FMG.Utils || {};

window.FMG.Utils.Dialog = {
  /**
   * Show an error dialog with standardized formatting
   * @param {Error|string} error - Error object or error message
   * @param {string} title - Dialog title (default: "Error")
   * @param {Object} buttons - Custom buttons object (optional)
   * @param {string} message - Custom error message (optional, uses parseError if not provided)
   */
  showError(error, title = "Error", buttons = {}, message = null) {
    const parsedError = typeof error === 'string' ? error : parseError(error);
    const errorMessage = message || parsedError;
    
    alertMessage.innerHTML = /* html */ `
      An error has occurred. ${errorMessage}
      <p id="errorBox">${parsedError}</p>
    `;

    const defaultButtons = {
      OK: function () {
        $(this).dialog("close");
      }
    };

    $("#alert").dialog({
      resizable: false,
      title: title,
      width: "32em",
      buttons: {...defaultButtons, ...buttons},
      position: {my: "center", at: "center", of: "svg"}
    });
  },

  /**
   * Show a generation error dialog
   * @param {Error} error - Error object
   */
  showGenerationError(error) {
    this.showError(
      error,
      "Generation error",
      {
        "Clear cache": () => cleanupData(),
        Regenerate: function () {
          regenerateMap("generation error");
          $(this).dialog("close");
        },
        Ignore: function () {
          $(this).dialog("close");
        }
      }
    );
  },

  /**
   * Show a loading error dialog
   * @param {Error} error - Error object
   * @param {string} mapVersion - Map version string
   */
  showLoadingError(error, mapVersion) {
    const parsedError = typeof parseError !== 'undefined' ? parseError(error) : String(error);
    alertMessage.innerHTML = /* html */ `
      An error is occured on map loading. Select a different file to load, <br>generate a new random map or cancel the loading.<br>Map version: ${mapVersion}. Generator version: ${VERSION}.
      <p id="errorBox">${parsedError}</p>
    `;

    $("#alert").dialog({
      resizable: false,
      title: "Loading error",
      maxWidth: "40em",
      buttons: {
        "Clear cache": () => cleanupData(),
        "Select file": function () {
          $(this).dialog("close");
          mapToLoad.click();
        },
        "New map": function () {
          $(this).dialog("close");
          regenerateMap("loading error");
        },
        Cancel: function () {
          $(this).dialog("close");
        }
      },
      position: {my: "center", at: "center", of: "svg"}
    });
  },

  /**
   * Show a saving error dialog
   * @param {Error} error - Error object
   */
  showSavingError(error) {
    const parsedError = typeof parseError !== 'undefined' ? parseError(error) : String(error);
    alertMessage.innerHTML = /* html */ `
      An error is occured on map saving. If the issue persists, please copy the message below and report it on ${link(
        "https://github.com/Azgaar/Fantasy-Map-Generator/issues",
        "GitHub"
      )}. 
      <p id="errorBox">${parsedError}</p>
    `;

    $("#alert").dialog({
      resizable: false,
      title: "Saving error",
      width: "28em",
      buttons: {
        Retry: function () {
          $(this).dialog("close");
          saveMap(method);
        },
        Close: function () {
          $(this).dialog("close");
        }
      },
      position: {my: "center", at: "center", of: "svg"}
    });
  },

  /**
   * Show a confirmation dialog
   * @param {string} message - Confirmation message
   * @param {Function} onConfirm - Callback when confirmed
   * @param {Function} onCancel - Callback when cancelled (optional)
   * @param {string} title - Dialog title (default: "Confirm")
   */
  showConfirm(message, onConfirm, onCancel = null, title = "Confirm") {
    alertMessage.innerHTML = message;
    
    const buttons = {
      OK: function () {
        $(this).dialog("close");
        if (onConfirm) onConfirm();
      },
      Cancel: function () {
        $(this).dialog("close");
        if (onCancel) onCancel();
      }
    };

    $("#alert").dialog({
      resizable: false,
      title: title,
      width: "28em",
      buttons: onCancel ? buttons : {OK: buttons.OK},
      position: {my: "center", at: "center", of: "svg"}
    });
  }
};

// Backward compatibility: Create global Dialog reference
// This allows gradual migration
if (typeof window.Dialog === 'undefined') {
  window.Dialog = window.FMG.Utils.Dialog;
}

