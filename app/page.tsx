'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Showreel() {
  const [content, setContent] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    fetch('/api/content').then(r => r.json()).then(data => {
      setContent(data);
      setTimeout(() => setShowContent(true), 1000);
    });
  }, []);

  useEffect(() => {
    if (!content?.images?.length) return;
    const interval = setInterval(() => {
      setCurrentImage(i => (i + 1) % content.images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [content]);

  useEffect(() => {
    if (!showContent || !content?.text) return;
    const interval = setInterval(() => {
      setTextIndex(i => {
        if (i >= content.text.length) return i;
        return i + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [showContent, content]);

  if (!content) return <div className="min-h-screen bg-pink-50" />;

  const themeColors = {
    'cherry-blossom': 'bg-pink-100 text-pink-900',
    'lavender-dream': 'bg-purple-100 text-purple-900',
    'cream-puff': 'bg-orange-50 text-orange-900'
  };

  return (
    <div className={`min-h-screen ${themeColors[content.theme as keyof typeof themeColors] || themeColors['cherry-blossom']} font-serif overflow-hidden`}>
      {/* Audio */}
      {content.musicUrl && showContent && (
        <audio autoPlay loop src={content.musicUrl} className="hidden" />
      )}

      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotateX: 90 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative max-w-2xl w-full bg-white shadow-2xl rounded-lg overflow-hidden"
          style={{ minHeight: '600px' }}
        >
          {/* Stationery Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          
          {/* Content */}
          <div className="relative p-12 md:p-16">
            {/* Header */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-8"
            >
              <div className="text-4xl mb-2">✨</div>
            </motion.div>

            {/* Slideshow */}
            {content.images?.length > 0 && (
              <motion.div 
                className="relative h-64 mb-8 rounded-lg overflow-hidden shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {content.images.map((img: string, i: number) => (
                  <motion.img
                    key={i}
                    src={img}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={false}
                    animate={{ 
                      opacity: i === currentImage ? 1 : 0,
                      scale: i === currentImage ? 1.1 : 1 
                    }}
                    transition={{ duration: 4 }}
                  />
                ))}
              </motion.div>
            )}

            {/* Letter Text */}
            <div className="prose prose-lg max-w-none">
              <p className="text-xl leading-relaxed whitespace-pre-wrap font-medium">
                {content.text?.slice(0, textIndex)}
                <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-0.5 h-6 bg-current ml-1 align-middle"
                />
              </p>
            </div>

            {/* Signature */}
            {textIndex >= (content.text?.length || 0) && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-right"
              >
                <p className="text-2xl font-bold italic">{content.signature}</p>
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="inline-block mt-2"
                >
                  🌸
                </motion.div>
              </motion.div>
            )}

            {/* Share Button */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-12 text-center"
            >
              <button 
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="bg-white/50 backdrop-blur px-6 py-3 rounded-full border-2 border-current hover:scale-105 transition transform"
              >
                🔗 Copy Link to Share
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
