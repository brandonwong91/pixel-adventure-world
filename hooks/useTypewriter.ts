
import { useState, useEffect } from 'react';

export const useTypewriter = <T,>(text: T, speed: number = 30) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (typeof text !== 'string') return;
    setDisplayText(''); // Reset on text change
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prevText => prevText + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => {
      clearInterval(typingInterval);
    };
  }, [text, speed]);

  return displayText;
};
