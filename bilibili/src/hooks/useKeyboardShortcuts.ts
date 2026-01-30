import { useEffect } from "react";

interface ShortcutHandlers {
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onStepForwardLarge: () => void;
  onStepBackwardLarge: () => void;
  onPause: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (event.code) {
        case "Space":
          event.preventDefault();
          handlers.onPlayPause();
          break;
        case "ArrowLeft":
          event.preventDefault();
          handlers.onStepBackward();
          break;
        case "ArrowRight":
          event.preventDefault();
          handlers.onStepForward();
          break;
      }

      switch (event.key.toLowerCase()) {
        case "j":
          event.preventDefault();
          handlers.onStepBackwardLarge();
          break;
        case "l":
          event.preventDefault();
          handlers.onStepForwardLarge();
          break;
        case "k":
          event.preventDefault();
          handlers.onPause();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
};
