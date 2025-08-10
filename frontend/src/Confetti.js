import React, { useEffect } from 'react';
import './Confetti.css';

const Confetti = React.memo(({ show }) => {
  useEffect(() => {
    if (!show) return;

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const confettiElements = [];

    // Create confetti pieces
    for (let i = 0; i < 150; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.cssText = `
        position: fixed;
        width: ${8 + Math.random() * 6}px;
        height: ${8 + Math.random() * 6}px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        z-index: 10000;
        pointer-events: none;
        animation: confetti-fall ${1.5 + Math.random() * 4}s linear forwards;
        transform: rotate(${Math.random() * 360}deg);
        border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
      `;
      
      document.body.appendChild(confetti);
      confettiElements.push(confetti);
    }

    // Clean up confetti after animation
    const cleanup = setTimeout(() => {
      confettiElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    }, 5000);

    return () => {
      clearTimeout(cleanup);
      confettiElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [show]);

  return null;
});

export default Confetti;
