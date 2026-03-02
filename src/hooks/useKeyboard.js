import { useEffect } from 'react';
import useGameStore from './useGameStore';

export default function useKeyboard() {
  const setDirection = useGameStore((state) => state.setDirection);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); setDirection('UP'); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); setDirection('DOWN'); break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); setDirection('LEFT'); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); setDirection('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDirection]);
}
