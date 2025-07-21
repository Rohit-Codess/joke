import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, Download, RotateCcw, Type, Image as ImageIcon } from 'lucide-react'

const PhotoEditor = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFrame, setSelectedFrame] = useState('circle')
  const [text, setText] = useState('')
  const [debouncedText, setDebouncedText] = useState('') // Add debounced text state
  const [textColor, setTextColor] = useState('#ffffff')
  const [textSize, setTextSize] = useState(24)
  const [textPosition, setTextPosition] = useState({ x: 300, y: 350 }) // Default center position
  const [isDragging, setIsDragging] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const previewCanvasRef = useRef(null)

  const frameOptions = [
    { id: 'circle', name: 'Circle', icon: '⭕' },
    { id: 'square', name: 'Square', icon: '⬜' },
    { id: 'triangle', name: 'Triangle', icon: '🔺' },
    { id: 'hexagon', name: 'Hexagon', icon: '⬡' },
    { id: 'star', name: 'Star', icon: '⭐' },
    { id: 'heart', name: 'Heart', icon: '❤️' },
    { id: 'diamond', name: 'Diamond', icon: '💎' },
    { id: 'none', name: 'No Frame', icon: '📷' }
  ]

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result)
        setGeneratedImage(null) // Reset generated image when new image is uploaded
      }
      reader.readAsDataURL(file)
    }
  }


  const downloadImage = () => {
    if (!generatedImage) return
    
    const link = document.createElement('a')
    link.download = 'joke-photo.png'
    link.href = generatedImage
    link.click()
  }

  const resetEditor = () => {
    setSelectedImage(null)
    setSelectedFrame('circle')
    setText('')
    setDebouncedText('') // Reset debounced text as well
    setTextColor('#ffffff')
    setTextSize(24)
    setTextPosition({ x: 300, y: 350 }) // Reset to center
    setIsDragging(false)
    setGeneratedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Debounce text input to prevent excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [text]);

  // Mouse event handlers for dragging text
  const handleMouseDown = (e) => {
    if (!text.trim()) return; // Don't drag if no text
    
    const canvas = previewCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert mouse coordinates to canvas coordinates
    const scaleX = 600 / rect.width;
    const scaleY = 700 / rect.height;
    const canvasX = mouseX * scaleX;
    const canvasY = mouseY * scaleY;
    
    // Check if click is near text position (within 50px in canvas coordinates)
    const distance = Math.sqrt((canvasX - textPosition.x) ** 2 + (canvasY - textPosition.y) ** 2);
    if (distance <= 50) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Convert mouse coordinates to canvas coordinates
      const scaleX = 600 / rect.width;
      const scaleY = 700 / rect.height;
      const canvasX = mouseX * scaleX;
      const canvasY = mouseY * scaleY;
      
      // Clamp position to canvas bounds
      const clampedX = Math.max(30, Math.min(570, canvasX));
      const clampedY = Math.max(30, Math.min(670, canvasY));
      
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setTextPosition({ x: clampedX, y: clampedY });
      });
    }
  }, [isDragging]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Auto-generate when image or settings change (but not text position during dragging)
  useEffect(() => {
    if (!selectedImage) return;
    if (isDragging) return; // Don't regenerate while dragging for performance

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 600;
    canvas.height = 700;

    // Create image object
    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw image at full canvas size (100% width and height)
      const { width: canvasWidth, height: canvasHeight } = canvas;
      
      // Apply frame mask first if needed
      if (selectedFrame !== 'none') {
        ctx.save();
        ctx.beginPath();
        
        if (selectedFrame === 'circle') {
          const radius = Math.min(canvasWidth, canvasHeight) / 2;
          ctx.arc(canvasWidth / 2, canvasHeight / 2, radius, 0, 2 * Math.PI);
        } else if (selectedFrame === 'square') {
          ctx.rect(0, 0, canvasWidth, canvasHeight);
        } else if (selectedFrame === 'triangle') {
          ctx.moveTo(canvasWidth / 2, 0);
          ctx.lineTo(0, canvasHeight);
          ctx.lineTo(canvasWidth, canvasHeight);
          ctx.closePath();
        } else if (selectedFrame === 'hexagon') {
          const centerX = canvasWidth / 2;
          const centerY = canvasHeight / 2;
          const radius = Math.min(canvasWidth, canvasHeight) / 2;
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const px = centerX + radius * Math.cos(angle);
            const py = centerY + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        } else if (selectedFrame === 'star') {
          const centerX = canvasWidth / 2;
          const centerY = canvasHeight / 2;
          const outerRadius = Math.min(canvasWidth, canvasHeight) / 2;
          const innerRadius = outerRadius * 0.4;
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = centerX + radius * Math.cos(angle);
            const py = centerY + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        } else if (selectedFrame === 'heart') {
          const centerX = canvasWidth / 2;
          const centerY = canvasHeight / 2;
          const size = Math.min(canvasWidth, canvasHeight) / 2;
          ctx.moveTo(centerX, centerY + size / 2);
          ctx.bezierCurveTo(centerX, centerY, centerX - size, centerY, centerX - size, centerY + size / 2);
          ctx.bezierCurveTo(centerX - size, centerY + size, centerX, centerY + size * 1.5, centerX, centerY + size * 1.5);
          ctx.bezierCurveTo(centerX, centerY + size, centerX + size, centerY + size, centerX + size, centerY + size / 2);
          ctx.bezierCurveTo(centerX + size, centerY, centerX, centerY, centerX, centerY + size / 2);
        } else if (selectedFrame === 'diamond') {
          ctx.moveTo(canvasWidth / 2, 0);
          ctx.lineTo(canvasWidth, canvasHeight / 2);
          ctx.lineTo(canvasWidth / 2, canvasHeight);
          ctx.lineTo(0, canvasHeight / 2);
          ctx.closePath();
        }
        
        ctx.clip();
      }
      
      // Draw image to fill entire canvas
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      
      if (selectedFrame !== 'none') {
        ctx.restore();
      }

      // Draw moveable text at specified position
      if (debouncedText.trim()) {
        ctx.fillStyle = textColor;
        ctx.font = `bold ${textSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Wrap text if too long
        const maxTextWidth = canvasWidth - 40;
        const words = debouncedText.split(' ');
        let lines = [];
        let currentLine = '';
        
        for (let word of words) {
          const testLine = currentLine + word + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxTextWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        
        // Draw text lines at the specified position
        const lineHeight = textSize + 10;
        const startY = textPosition.y - (lines.length - 1) * lineHeight / 2;
        
        lines.forEach((line, index) => {
          ctx.fillText(line, textPosition.x, startY + index * lineHeight);
        });
      }

      setGeneratedImage(canvas.toDataURL('image/png'));
    };
    img.src = selectedImage;
  }, [selectedImage, selectedFrame, debouncedText, textColor, textSize, textPosition.x, textPosition.y, isDragging])

  // Update preview canvas with interaction overlay
  const updatePreviewCanvas = useCallback(() => {
    if (!generatedImage || !previewCanvasRef.current) return;
    
    const previewCanvas = previewCanvasRef.current;
    const previewCtx = previewCanvas.getContext('2d');
    
    // Clear the preview canvas
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    // Draw the generated image
    const img = new Image();
    img.onload = () => {
      previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
      
      // Draw text position indicator if text exists (use immediate text for interactive feedback)
      if (text.trim()) {
        previewCtx.strokeStyle = isDragging ? '#00ff00' : '#ffffff';
        previewCtx.lineWidth = 2;
        previewCtx.setLineDash([5, 5]);
        previewCtx.beginPath();
        previewCtx.arc(textPosition.x, textPosition.y, 25, 0, 2 * Math.PI);
        previewCtx.stroke();
        previewCtx.setLineDash([]);
        
        // Draw drag handle
        previewCtx.fillStyle = isDragging ? '#00ff00' : '#ffffff';
        previewCtx.beginPath();
        previewCtx.arc(textPosition.x, textPosition.y, 4, 0, 2 * Math.PI);
        previewCtx.fill();
      }
    };
    img.src = generatedImage;
  }, [generatedImage, text, textPosition, isDragging]);

  // Update preview canvas when generated image changes (not during dragging)
  useEffect(() => {
    if (!isDragging) {
      updatePreviewCanvas();
    }
  }, [updatePreviewCanvas, isDragging]);

  // Separate effect for drag state changes to update overlay smoothly
  useEffect(() => {
    if (isDragging && generatedImage && previewCanvasRef.current && text.trim()) {
      const previewCanvas = previewCanvasRef.current;
      const previewCtx = previewCanvas.getContext('2d');
      
      // Redraw just the overlay without regenerating the whole image
      const img = new Image();
      img.onload = () => {
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewCtx.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
        
        // Draw updated text position indicator
        previewCtx.strokeStyle = '#00ff00';
        previewCtx.lineWidth = 2;
        previewCtx.setLineDash([5, 5]);
        previewCtx.beginPath();
        previewCtx.arc(textPosition.x, textPosition.y, 25, 0, 2 * Math.PI);
        previewCtx.stroke();
        previewCtx.setLineDash([]);
        
        // Draw drag handle
        previewCtx.fillStyle = '#00ff00';
        previewCtx.beginPath();
        previewCtx.arc(textPosition.x, textPosition.y, 4, 0, 2 * Math.PI);
        previewCtx.fill();
      };
      img.src = generatedImage;
    }
  }, [textPosition, isDragging, generatedImage, text]);

  // Regenerate final image when dragging stops
  useEffect(() => {
    if (!isDragging && selectedImage && textPosition) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new window.Image();
        
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw image at full canvas size
          const { width: canvasWidth, height: canvasHeight } = canvas;
          
          // Apply frame mask if needed
          if (selectedFrame !== 'none') {
            ctx.save();
            ctx.beginPath();
            
            if (selectedFrame === 'circle') {
              const radius = Math.min(canvasWidth, canvasHeight) / 2;
              ctx.arc(canvasWidth / 2, canvasHeight / 2, radius, 0, 2 * Math.PI);
            } else if (selectedFrame === 'square') {
              ctx.rect(0, 0, canvasWidth, canvasHeight);
            } else if (selectedFrame === 'triangle') {
              ctx.moveTo(canvasWidth / 2, 0);
              ctx.lineTo(0, canvasHeight);
              ctx.lineTo(canvasWidth, canvasHeight);
              ctx.closePath();
            } else if (selectedFrame === 'hexagon') {
              const centerX = canvasWidth / 2;
              const centerY = canvasHeight / 2;
              const radius = Math.min(canvasWidth, canvasHeight) / 2;
              for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const px = centerX + radius * Math.cos(angle);
                const py = centerY + radius * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
            } else if (selectedFrame === 'star') {
              const centerX = canvasWidth / 2;
              const centerY = canvasHeight / 2;
              const outerRadius = Math.min(canvasWidth, canvasHeight) / 2;
              const innerRadius = outerRadius * 0.4;
              for (let i = 0; i < 10; i++) {
                const angle = (i * Math.PI) / 5;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const px = centerX + radius * Math.cos(angle);
                const py = centerY + radius * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
            } else if (selectedFrame === 'heart') {
              const centerX = canvasWidth / 2;
              const centerY = canvasHeight / 2;
              const size = Math.min(canvasWidth, canvasHeight) / 2;
              ctx.moveTo(centerX, centerY + size / 2);
              ctx.bezierCurveTo(centerX, centerY, centerX - size, centerY, centerX - size, centerY + size / 2);
              ctx.bezierCurveTo(centerX - size, centerY + size, centerX, centerY + size * 1.5, centerX, centerY + size * 1.5);
              ctx.bezierCurveTo(centerX, centerY + size, centerX + size, centerY + size, centerX + size, centerY + size / 2);
              ctx.bezierCurveTo(centerX + size, centerY, centerX, centerY, centerX, centerY + size / 2);
            } else if (selectedFrame === 'diamond') {
              ctx.moveTo(canvasWidth / 2, 0);
              ctx.lineTo(canvasWidth, canvasHeight / 2);
              ctx.lineTo(canvasWidth / 2, canvasHeight);
              ctx.lineTo(0, canvasHeight / 2);
              ctx.closePath();
            }
            
            ctx.clip();
          }
          
          // Draw image to fill entire canvas
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
          
          if (selectedFrame !== 'none') {
            ctx.restore();
          }

          // Draw text at final position
          if (debouncedText.trim()) {
            ctx.fillStyle = textColor;
            ctx.font = `bold ${textSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            const maxTextWidth = canvasWidth - 40;
            const words = debouncedText.split(' ');
            let lines = [];
            let currentLine = '';
            
            for (let word of words) {
              const testLine = currentLine + word + ' ';
              const metrics = ctx.measureText(testLine);
              
              if (metrics.width > maxTextWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word + ' ';
              } else {
                currentLine = testLine;
              }
            }
            lines.push(currentLine);
            
            const lineHeight = textSize + 10;
            const startY = textPosition.y - (lines.length - 1) * lineHeight / 2;
            
            lines.forEach((line, index) => {
              ctx.fillText(line, textPosition.x, startY + index * lineHeight);
            });
          }

          setGeneratedImage(canvas.toDataURL('image/png'));
        };
        
        img.src = selectedImage;
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isDragging, selectedImage, selectedFrame, debouncedText, textColor, textSize, textPosition]);

  // Clear data when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear any stored data
      localStorage.removeItem('jokePhotoData')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🎭 Joke Photo Generator
          </h1>
          <p className="text-xl text-gray-300">
            Upload an image, choose a frame, add your joke text, and download!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="glass p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Upload Image
              </h2>
              <div className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
                >
                  Choose Image
                </button>
                <p className="text-gray-400 mt-2">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            {/* Frame Selection */}
            <div className="glass p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6" />
                Choose Frame
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {frameOptions.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedFrame === frame.id
                        ? 'border-blue-400 bg-blue-400/20'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">{frame.icon}</div>
                    <div className="text-sm text-white">{frame.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="glass p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Type className="w-6 h-6" />
                Add Your Joke Text
              </h2>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your funny caption here..."
                className="w-full p-4 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 resize-none"
                rows={4}
              />
              
              {/* Text Customization */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-white mb-2">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Text Size</label>
                  <input
                    type="range"
                    min="16"
                    max="48"
                    value={textSize}
                    onChange={(e) => setTextSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-gray-400 text-sm">{textSize}px</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={resetEditor}
                className="flex-1 btn-secondary text-red-700 px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
              <button
                onClick={downloadImage}
                disabled={!generatedImage}
                className="flex-1 btn-primary text-green-400 px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="glass p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Preview</h2>
            <div className="flex items-center justify-center min-h-[500px] bg-gray-900 rounded-lg border border-gray-700 relative">
              {generatedImage ? (
                <>
                  {/* Interactive Canvas for Text Dragging and Display */}
                  <canvas
                    ref={previewCanvasRef}
                    width={600}
                    height={700}
                    className="max-w-full max-h-[500px] rounded-lg shadow-lg cursor-crosshair"
                    style={{ objectFit: 'contain' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                  {/* Instructions */}
                  <div className="absolute bottom-2 left-2 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">
                    Click and drag to move text
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Upload an image to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Canvas for Image Generation */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}

export default PhotoEditor 