import { useCallback } from 'react';
import { useKeyboardSound } from './useKeyboardSound';

export function useMechanicalClick() {
  const { playKeySound, createKeyboardClick } = useKeyboardSound();

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    
    // Play mechanical click sound
    playKeySound();
    
    // Add visual feedback
    element.style.transform = 'scale(0.95) translateY(2px)';
    element.style.boxShadow = '0 0 0 2px rgba(0, 255, 65, 0.8), inset 0 2px 4px rgba(0, 0, 0, 0.5)';
    
    // Reset after animation
    setTimeout(() => {
      element.style.transform = '';
      element.style.boxShadow = '';
    }, 150);
  }, [playKeySound]);

  const handleClickStrong = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    
    // Play stronger mechanical click sound
    createKeyboardClick();
    
    // Add stronger visual feedback
    element.style.transform = 'scale(0.92) translateY(3px)';
    element.style.boxShadow = '0 0 0 3px rgba(0, 255, 65, 1), inset 0 3px 6px rgba(0, 0, 0, 0.7)';
    
    // Reset after animation
    setTimeout(() => {
      element.style.transform = '';
      element.style.boxShadow = '';
    }, 200);
  }, [createKeyboardClick]);

  return { handleClick, handleClickStrong };
}
