import { useEffect } from 'react';

type UseSpacebarProps = {
  onPress: () => void;
  onRelease: () => void;
};

export function useSpacebar({ onPress, onRelease }: UseSpacebarProps) {
  useEffect(() => {
    function isTyping(event: KeyboardEvent) {
      const target = event.target;

      return (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      );
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.code !== 'Space' || event.repeat || isTyping(event)) {
        return;
      }

      event.preventDefault();
      onPress();
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.code !== 'Space' || isTyping(event)) {
        return;
      }

      event.preventDefault();
      onRelease();
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onPress, onRelease]);
}
