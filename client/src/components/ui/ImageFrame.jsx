import React from 'react';

const ImageFrame = ({ frameType, children, className = '' }) => {
  const getFrameStyle = () => {
    switch (frameType) {
      case 'circle':
        return 'rounded-full overflow-hidden'
      case 'square':
        return 'rounded-lg overflow-hidden'
      case 'triangle':
        return 'clip-triangle'
      case 'hexagon':
        return 'clip-hexagon'
      case 'star':
        return 'clip-star'
      case 'heart':
        return 'clip-heart'
      case 'diamond':
        return 'clip-diamond'
      default:
        return 'rounded-lg overflow-hidden'
    };
  };

  return (
    <div className={`${getFrameStyle()} ${className}`}>
      {children}
    </div>
  );
};

export default ImageFrame;