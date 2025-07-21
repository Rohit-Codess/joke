import React, { useState, useRef, useEffect } from 'react'
import { Upload, Download, RotateCcw, Type, Image as ImageIcon } from 'lucide-react'

const PhotoEditor = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFrame, setSelectedFrame] = useState('circle')
  const [text, setText] = useState('')
  const [textColor, setTextColor] = useState('#ffffff')
  const [textSize, setTextSize] = useState(24)
  const [generatedImage, setGeneratedImage] = useState(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

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


  const generateImage = () => {
    if (!selectedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 600;
    canvas.height = 700;

    // Create image object
    const img = new window.Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Calculate text height dynamically ---
      let textLines = [];
      let textHeight = 0;
      if (text.trim()) {
        ctx.font = `bold ${textSize}px Arial`;
        const maxTextWidth = canvas.width - 40;
        const words = text.split(' ');
        let line = '';
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxTextWidth && n > 0) {
            textLines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        textLines.push(line);
        textHeight = textLines.length * (textSize + 10);
      }

      // --- Calculate image area height based on text height ---
      const minImageArea = 0.3; // At least 30% for image
      const maxImageArea = 0.8; // At most 80% for image
      let imageAreaHeight = canvas.height * maxImageArea;
      if (textHeight > 0) {
        // Shrink image area if text is large
        imageAreaHeight = Math.max(canvas.height - textHeight - 40, canvas.height * minImageArea);
      }

      const maxWidth = 400;
      const maxHeight = imageAreaHeight - 40;
      let { width, height } = img;
      if (width > height) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      } else {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      const x = (canvas.width - width) / 2;
      const y = 20;

      // Apply frame mask
      ctx.save();
      ctx.beginPath();
      if (selectedFrame === 'circle') {
        ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
      } else if (selectedFrame === 'square') {
        ctx.rect(x, y, width, height);
      } else if (selectedFrame === 'triangle') {
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
      } else if (selectedFrame === 'hexagon') {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radius = Math.min(width, height) / 2;
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const px = centerX + radius * Math.cos(angle);
          const py = centerY + radius * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else if (selectedFrame === 'star') {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const outerRadius = Math.min(width, height) / 2;
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
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const size = Math.min(width, height) / 2;
        ctx.moveTo(centerX, centerY + size / 2);
        ctx.bezierCurveTo(centerX, centerY, centerX - size, centerY, centerX - size, centerY + size / 2);
        ctx.bezierCurveTo(centerX - size, centerY + size, centerX, centerY + size * 1.5, centerX, centerY + size * 1.5);
        ctx.bezierCurveTo(centerX, centerY + size, centerX + size, centerY + size, centerX + size, centerY + size / 2);
        ctx.bezierCurveTo(centerX + size, centerY, centerX, centerY, centerX, centerY + size / 2);
      } else if (selectedFrame === 'diamond') {
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height / 2);
        ctx.lineTo(x + width / 2, y + height);
        ctx.lineTo(x, y + height / 2);
        ctx.closePath();
      } else {
        ctx.rect(x, y, width, height);
      }
      ctx.clip();
      ctx.drawImage(img, x, y, width, height);
      ctx.restore();

      // Draw text in the remaining area
      if (text.trim()) {
        ctx.fillStyle = textColor;
        ctx.font = `bold ${textSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Calculate text area
        const textAreaY = imageAreaHeight + 10;
        let yPos = textAreaY + textSize / 2;
        for (let i = 0; i < textLines.length; i++) {
          ctx.fillText(textLines[i], canvas.width / 2, yPos);
          yPos += textSize + 10;
        }
      }

      setGeneratedImage(canvas.toDataURL('image/png'));
    };
    img.src = selectedImage;
  };

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
    setTextColor('#ffffff')
    setTextSize(24)
    setGeneratedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Auto-generate when image or settings change
  useEffect(() => {
    if (selectedImage) {
      generateImage();
    }
  }, [selectedImage, selectedFrame, text, textColor, textSize])

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
                  className="btn-primary px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform"
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
                className="flex-1 btn-secondary px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
              <button
                onClick={downloadImage}
                disabled={!generatedImage}
                className="flex-1 btn-primary px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="glass p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Preview</h2>
            <div className="flex items-center justify-center min-h-[500px] bg-gray-900 rounded-lg border border-gray-700">
              {generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated joke photo"
                  className="max-w-full max-h-[500px] rounded-lg shadow-lg"
                />
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