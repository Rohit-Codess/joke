import React from 'react';

const TextOverlay = ({ 
  text, 
  color = '#ffffff', 
  size = 24, 
  position = 'bottom',
  className = '' 
}) => {
  if (!text) return null;

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return 'top-4 left-4 right-4'
      case 'center':
        return 'top-1/2 left-4 right-4 transform -translate-y-1/2'
      case 'bottom':
        return 'bottom-4 left-4 right-4'
      default:
        return 'bottom-4 left-4 right-4'
    };
  };

  return (
    <div className={`absolute ${getPositionStyle()} ${className}`}>
      <div
        className="text-center font-bold break-words"
        style={{
          color: color,
          fontSize: `${size}px`,
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default TextOverlay;