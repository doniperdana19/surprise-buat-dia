"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Globe, Star, Sparkles } from 'lucide-react';

// Konfigurasi jumlah partikel
const PARTICLE_COUNT = 100;

const ParticleScene = () => {
  const [scene, setScene] = useState('none'); // 'love', 'earth', 'galaxy', 'text'

  // Fungsi untuk menghasilkan koordinat bentuk
  const getLayout = (type: string, index: number) => {
    const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
    
    switch (type) {
      case 'love': // Bentuk Hati (Parametric Heart Equation)
        const t = (index / PARTICLE_COUNT) * Math.PI * 2;
        const xH = 16 * Math.pow(Math.sin(t), 3);
        const yH = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        return { x: xH * 15, y: yH * 15 };

      case 'earth': // Bentuk Lingkaran
        return {
          x: Math.cos(angle) * 200,
          y: Math.sin(angle) * 200
        };

      case 'galaxy': // Bentuk Spiral
        const radius = index * 2;
        return {
          x: Math.cos(angle * 3) * radius,
          y: Math.sin(angle * 3) * radius
        };

      default: // Random / Berhamburan
        return {
          x: (Math.random() - 0.5) * 800,
          y: (Math.random() - 0.5) * 600
        };
    }
  };

  return (
    <div className="relative h-screen w-full bg-black flex items-center justify-center overflow-hidden">
      {/* Kumpulan Partikel/Icon */}
      <div className="relative">
        {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
          const targetPos = getLayout(scene, i);
          return (
            <motion.div
              key={i}
              className="absolute text-purple-400"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ 
                x: targetPos.x, 
                y: targetPos.y, 
                opacity: 1,
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                type: "spring", 
                stiffness: 50, 
                damping: 20, 
                delay: i * 0.005 
              }}
            >
              <Sparkles size={12} />
            </motion.div>
          );
        })}
      </div>

      {/* Menu Navigasi (Sesuai gambar kamu) */}
      <div className="absolute left-10 top-1/3 flex flex-col gap-4 z-50">
        <button onClick={() => setScene('love')} className="text-white hover:text-purple-500 flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10 transition-all">
          <Heart size={18} /> 1: Cinta
        </button>
        <button onClick={() => setScene('earth')} className="text-white hover:text-blue-500 flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10 transition-all">
          <Globe size={18} /> 2: Bumi
        </button>
        <button onClick={() => setScene('galaxy')} className="text-white hover:text-yellow-500 flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10 transition-all">
          <Star size={18} /> 3: Galaxy
        </button>
      </div>

      {/* Teks di Tengah */}
      <AnimatePresence>
        {scene !== 'none' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-24 text-center"
          >
            <h1 className="text-white text-2xl font-light tracking-widest italic">
              {scene === 'love' && "all forms of the solar system are a reflection of my love"}
              {scene === 'earth' && "The world revolves around you"}
              {scene === 'galaxy' && "You are my entire universe"}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParticleScene;