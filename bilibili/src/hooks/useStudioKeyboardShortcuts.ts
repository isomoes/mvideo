import { useEffect, useCallback } from "react";

export interface StudioShortcutHandlers {
  // Playback
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onStepForwardLarge: () => void;
  onStepBackwardLarge: () => void;
  onPause: () => void;
  onSkipToStart: () => void;
  onSkipToEnd: () => void;

  // Tools
  onSelectTool: () => void;
  onRazorTool: () => void;
  onHandTool: () => void;

  // Timeline
  onToggleSnap: () => void;
  onToggleRipple: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;

  // Edit
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;

  // Marks
  onMarkIn: () => void;
  onMarkOut: () => void;
  onClearMarks: () => void;

  // Save
  onSave: () => void;
}

const defaultHandlers: StudioShortcutHandlers = {
  onPlayPause: () => {},
  onStepForward: () => {},
  onStepBackward: () => {},
  onStepForwardLarge: () => {},
  onStepBackwardLarge: () => {},
  onPause: () => {},
  onSkipToStart: () => {},
  onSkipToEnd: () => {},
  onSelectTool: () => {},
  onRazorTool: () => {},
  onHandTool: () => {},
  onToggleSnap: () => {},
  onToggleRipple: () => {},
  onZoomIn: () => {},
  onZoomOut: () => {},
  onZoomFit: () => {},
  onUndo: () => {},
  onRedo: () => {},
  onDelete: () => {},
  onCut: () => {},
  onCopy: () => {},
  onPaste: () => {},
  onSelectAll: () => {},
  onMarkIn: () => {},
  onMarkOut: () => {},
  onClearMarks: () => {},
  onSave: () => {},
};

export const useStudioKeyboardShortcuts = (
  handlers: Partial<StudioShortcutHandlers>
) => {
  const mergedHandlers = { ...defaultHandlers, ...handlers };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const { key, code, ctrlKey, metaKey, shiftKey } = event;
      const modKey = ctrlKey || metaKey;

      // Playback shortcuts
      if (code === "Space" && !modKey) {
        event.preventDefault();
        mergedHandlers.onPlayPause();
        return;
      }

      if (code === "ArrowLeft" && !modKey) {
        event.preventDefault();
        if (shiftKey) {
          mergedHandlers.onStepBackwardLarge();
        } else {
          mergedHandlers.onStepBackward();
        }
        return;
      }

      if (code === "ArrowRight" && !modKey) {
        event.preventDefault();
        if (shiftKey) {
          mergedHandlers.onStepForwardLarge();
        } else {
          mergedHandlers.onStepForward();
        }
        return;
      }

      if (code === "Home" && !modKey) {
        event.preventDefault();
        mergedHandlers.onSkipToStart();
        return;
      }

      if (code === "End" && !modKey) {
        event.preventDefault();
        mergedHandlers.onSkipToEnd();
        return;
      }

      // JKL playback (industry standard)
      const lowerKey = key.toLowerCase();
      if (lowerKey === "j" && !modKey) {
        event.preventDefault();
        mergedHandlers.onStepBackwardLarge();
        return;
      }

      if (lowerKey === "k" && !modKey) {
        event.preventDefault();
        mergedHandlers.onPause();
        return;
      }

      if (lowerKey === "l" && !modKey) {
        event.preventDefault();
        mergedHandlers.onStepForwardLarge();
        return;
      }

      // Tool shortcuts
      if (lowerKey === "v" && !modKey) {
        event.preventDefault();
        mergedHandlers.onSelectTool();
        return;
      }

      if (lowerKey === "c" && !modKey) {
        event.preventDefault();
        mergedHandlers.onRazorTool();
        return;
      }

      if (lowerKey === "h" && !modKey) {
        event.preventDefault();
        mergedHandlers.onHandTool();
        return;
      }

      // Timeline shortcuts
      if (lowerKey === "s" && !modKey) {
        event.preventDefault();
        mergedHandlers.onToggleSnap();
        return;
      }

      if (lowerKey === "r" && !modKey) {
        event.preventDefault();
        mergedHandlers.onToggleRipple();
        return;
      }

      if ((code === "Equal" || code === "NumpadAdd") && !modKey) {
        event.preventDefault();
        mergedHandlers.onZoomIn();
        return;
      }

      if ((code === "Minus" || code === "NumpadSubtract") && !modKey) {
        event.preventDefault();
        mergedHandlers.onZoomOut();
        return;
      }

      if (lowerKey === "f" && shiftKey && !modKey) {
        event.preventDefault();
        mergedHandlers.onZoomFit();
        return;
      }

      // Edit shortcuts (with modifier)
      if (lowerKey === "z" && modKey && !shiftKey) {
        event.preventDefault();
        mergedHandlers.onUndo();
        return;
      }

      if ((lowerKey === "z" && modKey && shiftKey) || (lowerKey === "y" && modKey)) {
        event.preventDefault();
        mergedHandlers.onRedo();
        return;
      }

      if ((code === "Delete" || code === "Backspace") && !modKey) {
        event.preventDefault();
        mergedHandlers.onDelete();
        return;
      }

      if (lowerKey === "x" && modKey) {
        event.preventDefault();
        mergedHandlers.onCut();
        return;
      }

      if (lowerKey === "c" && modKey) {
        event.preventDefault();
        mergedHandlers.onCopy();
        return;
      }

      if (lowerKey === "v" && modKey) {
        event.preventDefault();
        mergedHandlers.onPaste();
        return;
      }

      if (lowerKey === "a" && modKey) {
        event.preventDefault();
        mergedHandlers.onSelectAll();
        return;
      }

      // Mark shortcuts
      if (lowerKey === "i" && !modKey) {
        event.preventDefault();
        mergedHandlers.onMarkIn();
        return;
      }

      if (lowerKey === "o" && !modKey) {
        event.preventDefault();
        mergedHandlers.onMarkOut();
        return;
      }

      if (lowerKey === "x" && !modKey) {
        event.preventDefault();
        mergedHandlers.onClearMarks();
        return;
      }

      // Save
      if (lowerKey === "s" && modKey) {
        event.preventDefault();
        mergedHandlers.onSave();
        return;
      }
    },
    [mergedHandlers]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

// Keyboard shortcut reference for UI display
export const KEYBOARD_SHORTCUTS = {
  playback: [
    { key: "Space", description: "Play/Pause" },
    { key: "Left/Right", description: "Step 1 frame" },
    { key: "Shift+Left/Right", description: "Step 5 frames" },
    { key: "J/K/L", description: "Backward/Pause/Forward" },
    { key: "Home/End", description: "Go to start/end" },
  ],
  tools: [
    { key: "V", description: "Select tool" },
    { key: "C", description: "Razor tool" },
    { key: "H", description: "Hand tool" },
  ],
  timeline: [
    { key: "S", description: "Toggle snap" },
    { key: "R", description: "Toggle ripple" },
    { key: "+/-", description: "Zoom in/out" },
    { key: "Shift+F", description: "Zoom to fit" },
  ],
  edit: [
    { key: "Ctrl+Z", description: "Undo" },
    { key: "Ctrl+Shift+Z", description: "Redo" },
    { key: "Delete", description: "Delete selected" },
    { key: "Ctrl+X/C/V", description: "Cut/Copy/Paste" },
    { key: "Ctrl+A", description: "Select all" },
  ],
  marks: [
    { key: "I", description: "Mark in point" },
    { key: "O", description: "Mark out point" },
    { key: "X", description: "Clear marks" },
  ],
};
