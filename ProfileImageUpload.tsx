import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface ProfileImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  fallbackSeed?: string;
}

export const ProfileImageUpload = ({ value, onChange, className, fallbackSeed }: ProfileImageUploadProps) => {
  const [imageMenuOpen, setImageMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setImageMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
        setImageMenuOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomAvatar = () => {
    const seeds = ['Felix', 'Aneka', 'Coco', 'Sasha', 'Bear', 'Jack', 'Luna', 'Lily', 'Muffin'];
    const seed = seeds[Math.floor(Math.random() * seeds.length)] + '_' + Math.floor(Math.random() * 1000);
    onChange(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
    setImageMenuOpen(false);
  };

  const currentImage = value || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fallbackSeed || 'default'}`;

  return (
    <div className={cn("relative flex flex-col items-center", className)} ref={menuRef}>
      <div 
        className="relative group cursor-pointer" 
        onClick={() => setImageMenuOpen(!imageMenuOpen)}
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#A8E6CF] to-[#A0C4FF] p-1 shadow-lg transition-transform group-hover:scale-105 active:scale-95">
          <div className="bg-white rounded-[22px] w-full h-full flex items-center justify-center overflow-hidden">
            <img 
              src={currentImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className={cn(
          "absolute inset-x-1 bottom-1 top-1 bg-black/30 rounded-[22px] flex items-center justify-center transition-all",
          imageMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <Camera className="text-white w-6 h-6" />
        </div>
      </div>

      <AnimatePresence>
        {imageMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden"
          >
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Upload className="w-4 h-4 text-blue-500" />
              Browse Files
            </button>
            <button 
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-green-500" />
              Open Camera
            </button>
            <button 
              type="button"
              onClick={generateRandomAvatar}
              className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-orange-500" />
              Random Avatar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        className="hidden" 
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
      />
    </div>
  );
};
