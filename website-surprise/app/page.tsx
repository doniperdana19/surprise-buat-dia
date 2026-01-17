"use client";
import React, { useState, useRef, useEffect, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, PointMaterial, Text } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Sparkles, Orbit, ArrowLeft, Stars as StarsIcon, Gift, 
  ChevronRight, ChevronLeft, Image as ImageIcon, MapPin, 
  Calendar, MessageCircleHeart, Lock, Plus, Trash2, Camera,
  Globe
} from "lucide-react"; 
import confetti from 'canvas-confetti';

// --- KOMPONEN 3D PARTICLE MULTI-FINGER ---
function HandParticles({ activeFingers }: { activeFingers: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const ringRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  
  const particleCount = 6000;
  const ringCount = 2000;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const ringPositions = useMemo(() => {
    const pos = new Float32Array(ringCount * 3);
    for (let i = 0; i < ringCount; i++) {
      pos[i * 3] = 1000; 
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || !ringRef.current) return;
    const handData = (window as any).handLandmarks; 
    const fingerCount = activeFingers; 
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const ringArray = ringRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      if (handData && handData.length > 0) {
        let tx = 0, ty = 0, tz = 0;

        if (fingerCount === 1) { 
          const t = (i / particleCount) * Math.PI * 2;
          tx = 1.6 * Math.pow(Math.sin(t), 3);
          ty = 1.3 * Math.cos(t) - 0.5 * Math.cos(2*t) - 0.2 * Math.cos(3*t) - 0.1 * Math.cos(4*t);
          tz = Math.sin(time + i * 0.1) * 0.2;
        } 
        else if (fingerCount === 2) { 
          const phi = Math.acos(-1 + (2 * i) / particleCount);
          const theta = Math.sqrt(particleCount * Math.PI) * phi;
          tx = Math.cos(theta) * Math.sin(phi) * 1.5;
          ty = Math.sin(theta) * Math.sin(phi) * 1.5;
          tz = Math.cos(phi) * 1.5;
        }
        else if (fingerCount === 3) { 
          const angle = 0.1 * i;
          const radius = 0.05 * angle;
          tx = radius * Math.cos(angle + time);
          ty = radius * Math.sin(angle + time) * 0.4;
          tz = Math.sin(angle * 0.5) * 0.5;
        }
        else if (fingerCount === 4) { 
          tx = (Math.random() - 0.5) * 4;
          ty = (Math.random() - 0.5) * 2;
          tz = -1;
        }
        else { 
          tx = (Math.random() - 0.5) * 8;
          ty = (Math.random() - 0.5) * 8;
          tz = (Math.random() - 0.5) * 8;
        }

        const offX = (0.5 - handData[8].x) * viewport.width;
        const offY = (0.5 - handData[8].y) * viewport.height;
        
        posArray[i3] += (tx + offX - posArray[i3]) * 0.1;
        posArray[i3 + 1] += (ty + offY - posArray[i3 + 1]) * 0.1;
        posArray[i3 + 2] += (tz - posArray[i3 + 2]) * 0.1;
      } else {
        posArray[i3] += Math.sin(time + i) * 0.002;
        posArray[i3 + 1] += Math.cos(time + i) * 0.002;
      }
    }

    for (let j = 0; j < ringCount; j++) {
      const j3 = j * 3;
      if (handData && fingerCount === 3) {
        const angle = (j / ringCount) * Math.PI * 2;
        const r = 3.5 + (Math.sin(j * 50) * 0.5);
        const rX = Math.cos(angle + time * 0.5) * r;
        const rZ = Math.sin(angle + time * 0.5) * r;
        
        const offX = (0.5 - handData[8].x) * viewport.width;
        const offY = (0.5 - handData[8].y) * viewport.height;

        ringArray[j3] += (rX + offX - ringArray[j3]) * 0.1;
        ringArray[j3 + 1] += (offY - ringArray[j3 + 1]) * 0.1;
        ringArray[j3 + 2] += (rZ - ringArray[j3 + 2]) * 0.1;
      } else {
        ringArray[j3] = 1000;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    ringRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        </bufferGeometry>
        <PointMaterial transparent color="#ffffff" size={0.04} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points ref={ringRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={ringCount} array={ringPositions} itemSize={3} />
        </bufferGeometry>
        <PointMaterial transparent color="#d63031" size={0.03} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      
      {activeFingers > 0 && (
          <Text
            position={[0, -2.5, 0]}
            fontSize={0.25}
            color="white"
            maxWidth={5}
            textAlign="center"
          >
            {activeFingers === 1 && "My Heart is only for you"}
            {activeFingers === 2 && "The world is better with you"}
            {activeFingers === 3 && "You are the center of my galaxy"}
            {activeFingers === 4 && "All forms of the solar system\nare a reflection of my love"}
          </Text>
      )}
    </>
  );
}

// --- MAIN PAGE ---
export default function SurprisePage() {
  const [activeTab, setActiveTab] = useState("home");
  const [showMessage, setShowMessage] = useState(false);
  const [isLovePage, setIsLovePage] = useState(false);
  const [show3DSpace, setShow3DSpace] = useState(false);
  const [activeFingers, setActiveFingers] = useState(0);
  const [currentFoto, setCurrentFoto] = useState(0);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [yesButtonScale, setYesButtonScale] = useState(1);
  const [isLetterLocked, setIsLetterLocked] = useState(true);
  const [timeTogether, setTimeTogether] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [wishes, setWishes] = useState<string[]>([]);
  const [newWish, setNewWish] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const camVideoRef = useRef<HTMLVideoElement | null>(null);

  const NAMA_DIA = "Sayangku"; 
  const TANGGAL_JADIAN = "2025-01-27"; 
  const PASSWORD_JADIAN = "270125"; 

  const albumFoto = [
    "/foto-kita1.jpeg", "/foto-kita2.jpeg", "/foto-kita3.jpeg", 
    "/foto-kita4.jpeg", "/foto-kita5.jpeg", "/foto-kita6.jpeg",
    "/foto-kita7.jpeg", "/foto-kita8.jpeg", "/foto-kita9.jpeg",
    "/foto-kita10.jpeg", "/foto-kita11.jpeg", "/foto-kita12.jpeg"
  ];

  const milestones = [
    { date: "07 Desember 2024", event: "First Date: nonton bioskop! 🍿", icon: <MapPin className="w-4 h-4" /> },
    { date: "27 Januari 2025", event: "Hari kita pertama pacaran ❤️", icon: <MessageCircleHeart className="w-4 h-4" /> },
    { date: "27 Januari 2026", event: "Happy 1st Anniversary! 🎉", icon: <StarsIcon className="w-4 h-4 text-yellow-500" /> },
    { date: "Sekarang", event: "Masih sayang banget sama kamu ✨", icon: <Heart className="w-4 h-4 fill-red-500 text-red-500" /> },
  ];

  const countFingers = (landmarks: any) => {
    let count = 0;
    const tips = [8, 12, 16, 20]; 
    tips.forEach(tip => { if (landmarks[tip].y < landmarks[tip - 2].y) count++; });
    if (landmarks[4] && landmarks[2] && Math.abs(landmarks[4].x - landmarks[2].x) > 0.05) count++; 
    return count;
  };

  useEffect(() => {
    const saved = localStorage.getItem("wishlist-kita");
    if (saved) setWishes(JSON.parse(saved));

    const timer = setInterval(() => {
      const start = new Date(TANGGAL_JADIAN).getTime();
      const diff = new Date().getTime() - start;
      setTimeTogether({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / 1000 / 60) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cameraInstance: any = null;
    let isMounted = true;

    if (show3DSpace) {
      const loadMediaPipe = async () => {
        const { Hands } = await import("@mediapipe/hands");
        const camUtils = await import("@mediapipe/camera_utils");
        
        if (!isMounted) return;

        const hands = new Hands({ 
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` 
        });

        hands.setOptions({ 
          maxNumHands: 1, 
          modelComplexity: 1, 
          minDetectionConfidence: 0.7, 
          minTrackingConfidence: 0.7, 
          selfieMode: true 
        });
        
        hands.onResults((results: any) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
            const landmarks = results.multiHandLandmarks[0];
            (window as any).handLandmarks = landmarks;
            const count = countFingers(landmarks);
            setActiveFingers(count);
          } else {
            (window as any).handLandmarks = null;
            setActiveFingers(0);
          }
        });

        if (camVideoRef.current) {
          cameraInstance = new camUtils.Camera(camVideoRef.current, {
            onFrame: async () => { if(camVideoRef.current) await hands.send({ image: camVideoRef.current }); },
            width: 640, height: 480
          });
          cameraInstance.start();
        }
      };

      loadMediaPipe();
    }

    return () => { 
      isMounted = false;
      if (cameraInstance) cameraInstance.stop(); 
    };
  }, [show3DSpace]);

  const handleAddWish = () => {
    if (!newWish.trim()) return;
    const updated = [...wishes, newWish];
    setWishes(updated);
    localStorage.setItem("wishlist-kita", JSON.stringify(updated));
    setNewWish("");
    confetti({ particleCount: 40, spread: 60, colors: ['#ff69b4'] });
  };

  const handleStart = () => {
    setShowMessage(true);
    if (audioRef.current) {
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(() => console.log("Audio play deferred"));
    }
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 overflow-hidden relative font-sans text-gray-800">
      <audio ref={audioRef} src="/music-kita.mp3" loop />

      <AnimatePresence>
        {show3DSpace && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black">
            <video ref={camVideoRef} className="hidden" playsInline />
            <div className="absolute top-10 left-6 z-[110] space-y-3 bg-black/40 p-5 rounded-3xl border border-white/10 backdrop-blur-md text-white">
                <p className={`flex items-center gap-3 text-[10px] transition-all ${activeFingers === 1 ? "text-pink-400 font-bold scale-110" : "opacity-30"}`}><Heart size={12}/> 1: Cinta</p>
                <p className={`flex items-center gap-3 text-[10px] transition-all ${activeFingers === 2 ? "text-blue-400 font-bold scale-110" : "opacity-30"}`}><Globe size={12}/> 2: Bumi</p>
                <p className={`flex items-center gap-3 text-[10px] transition-all ${activeFingers === 3 ? "text-orange-400 font-bold scale-110" : "opacity-30"}`}><Orbit size={12}/> 3: Galaxy</p>
                <p className={`flex items-center gap-3 text-[10px] transition-all ${activeFingers === 4 ? "text-purple-400 font-bold scale-110" : "opacity-30"}`}><Sparkles size={12}/> 4: Reflection of Love</p>
            </div>
            <div className="absolute inset-0">
              <Canvas camera={{ position: [0, 0, 8] }}>
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Suspense fallback={null}>
                  <HandParticles activeFingers={activeFingers} />
                </Suspense>
              </Canvas>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
                <button onClick={() => setShow3DSpace(false)} className="bg-white/10 backdrop-blur-md text-white px-8 py-3 rounded-full border border-white/20 flex items-center gap-2 hover:bg-white/20 transition-all">
                   <ArrowLeft size={16}/> Kembali ke Realita
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLovePage && !show3DSpace && (
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          {albumFoto.map((src, i) => (
            <motion.img 
                key={i} 
                src={src} 
                alt="Memory"
                className="absolute rounded-lg shadow-2xl" 
                style={{ 
                    width: "90px", 
                    top: (15 + (i * 7)) % 90 + "%", 
                    left: (10 + (i * 13)) % 90 + "%", 
                    rotate: (i * 15) % 40 - 20 + "deg" 
                }} 
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {isLovePage && !show3DSpace && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-10 w-full h-full bg-black">
            <video ref={videoRef} src="/video-kita.mp4" autoPlay loop playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-black/20 backdrop-blur-3xl p-6 md:p-8 rounded-[3rem] border border-white/20 mx-4">
                    {/* --- UPDATE BAGIAN COUNTDOWN DENGAN DETIK --- */}
                    <div className="flex gap-3 md:gap-5 text-white mb-6 justify-center">
                        <div className="text-center">
                          <p className="text-3xl md:text-4xl font-black">{timeTogether.days}</p>
                          <p className="text-[7px] md:text-[8px] tracking-widest uppercase">Hari</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl md:text-4xl font-black">{timeTogether.hours.toString().padStart(2, '0')}</p>
                          <p className="text-[7px] md:text-[8px] tracking-widest uppercase">Jam</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl md:text-4xl font-black">{timeTogether.mins.toString().padStart(2, '0')}</p>
                          <p className="text-[7px] md:text-[8px] tracking-widest uppercase">Menit</p>
                        </div>
                        <div className="text-center text-pink-400">
                          <p className="text-3xl md:text-4xl font-black">{timeTogether.secs.toString().padStart(2, '0')}</p>
                          <p className="text-[7px] md:text-[8px] tracking-widest uppercase font-bold">Detik</p>
                        </div>
                    </div>
                    {/* ------------------------------------------- */}
                    <h2 className="text-4xl font-black text-white italic uppercase mb-2">I Love You!</h2>
                    <p className="text-white/70 text-xs mb-8">Setiap detik berharga bersamamu.</p>
                    <button onClick={() => setShow3DSpace(true)} className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 rounded-2xl text-white font-bold flex items-center gap-3 mx-auto shadow-lg animate-bounce">
                      <Camera size={20}/> MAGIC 3D SPACE 🪄
                    </button>
                </motion.div>
                <button onClick={() => setIsLovePage(false)} className="mt-10 text-white/50 text-xs tracking-[0.3em] uppercase hover:text-white transition-colors">Tutup Video</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLovePage && !show3DSpace && (
        <div className="z-20 w-full max-w-lg mb-24">
          {!showMessage ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] text-center border border-white/10 max-w-md mx-auto text-white">
              <Gift className="w-20 h-20 text-pink-400 mx-auto mb-6 animate-pulse" />
              <h1 className="text-2xl font-black mb-8 italic tracking-tight">Happy Anniversary! ✨</h1>
              <button onClick={handleStart} className="bg-pink-500 hover:bg-pink-600 transition-colors text-white w-full py-4 rounded-2xl font-extrabold uppercase shadow-xl shadow-pink-500/20">BUKA HADIAHMU ❤️</button>
            </motion.div>
          ) : (
            <div className="space-y-4 max-w-md mx-auto px-2">
              <AnimatePresence mode="wait">
                {activeTab === "home" && (
                  <motion.div key="home" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="bg-white/95 p-6 rounded-[2.5rem] shadow-2xl">
                    {isLetterLocked ? (
                      <div className="text-center py-6">
                        <Lock className="mx-auto text-pink-200 w-12 h-12 mb-4" />
                        <p className="text-[10px] text-gray-400 mb-4 uppercase tracking-[0.2em]">Password Jadian (DDMMYY):</p>
                        <input 
                            type="text" 
                            inputMode="numeric"
                            maxLength={6} 
                            placeholder="000000"
                            className="w-32 p-3 border-2 border-pink-50 rounded-2xl text-center font-bold text-pink-500 text-xl outline-none focus:border-pink-200 transition-all" 
                            onChange={(e) => { if(e.target.value === PASSWORD_JADIAN) { setIsLetterLocked(false); confetti(); } }} 
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="bg-pink-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="text-pink-500 fill-pink-500" size={20} />
                        </div>
                        <p className="text-gray-600 italic text-sm leading-relaxed mb-8 px-4">"Selamat 1 tahun ya {NAMA_DIA}! Makasih udah nemenin aku lewat suka dan duka. Kamu adalah alasan aku tersenyum setiap hari."</p>
                        <div className="flex flex-col gap-3 items-center relative h-36">
                            <motion.button 
                                style={{ scale: yesButtonScale }} 
                                onClick={() => setIsLovePage(true)} 
                                className="bg-green-500 hover:bg-green-600 text-white px-10 py-3 rounded-2xl font-bold z-50 shadow-lg transition-colors"
                            >
                                SAYANG BANGET! ❤️
                            </motion.button>
                            <motion.button 
                                onMouseEnter={() => { 
                                    setNoButtonPos({ x: Math.random()*200-100, y: Math.random()*100-50 }); 
                                    setYesButtonScale(s => Math.min(s + 0.15, 3)); 
                                }} 
                                animate={{ x: noButtonPos.x, y: noButtonPos.y }} 
                                className="bg-gray-100 text-gray-400 px-5 py-2 rounded-xl text-xs font-medium"
                            >
                                Enggak.
                            </motion.button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "milestone" && (
                  <motion.div key="milestone" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/95 p-6 rounded-[2.5rem] shadow-2xl">
                    <h2 className="text-center font-black text-pink-500 mb-6 uppercase text-xs tracking-[0.2em]">Our Journey</h2>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {milestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-4 bg-pink-50/50 p-4 rounded-3xl border border-pink-100/50">
                          <div className="bg-white p-3 rounded-2xl text-pink-500 shadow-sm">{m.icon}</div>
                          <div>
                            <p className="text-[10px] font-bold text-pink-400 uppercase tracking-tighter">{m.date}</p>
                            <p className="text-xs font-semibold text-gray-700">{m.event}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "wishlist" && (
                  <motion.div key="wishlist" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/95 p-6 rounded-[2.5rem] shadow-2xl min-h-[420px] flex flex-col">
                    <h2 className="text-center font-black text-pink-500 mb-4 uppercase text-xs tracking-[0.2em]">Wishlist Kita ✨</h2>
                    <div className="flex gap-2 mb-6">
                      <input 
                        value={newWish} 
                        onChange={(e) => setNewWish(e.target.value)} 
                        placeholder="Mau ngapain lagi kita?..." 
                        className="flex-1 p-4 bg-pink-50/50 rounded-2xl text-sm outline-none border border-transparent focus:border-pink-200" 
                      />
                      <button onClick={handleAddWish} className="bg-pink-500 text-white p-4 rounded-2xl shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform"><Plus size={20}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 max-h-[260px] pr-2 custom-scrollbar">
                      {wishes.length === 0 && <p className="text-center text-gray-300 text-xs italic mt-10">Belum ada harapan...</p>}
                      {wishes.map((w, i) => (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="flex justify-between items-center bg-white border border-pink-50 p-4 rounded-2xl shadow-sm">
                          <p className="text-xs text-gray-600 font-medium">"{w}"</p>
                          <button onClick={() => { 
                              const u = wishes.filter((_, idx) => idx !== i); 
                              setWishes(u); 
                              localStorage.setItem("wishlist-kita", JSON.stringify(u)); 
                          }} className="text-red-300 hover:text-red-500 transition-colors">
                              <Trash2 size={16}/>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "gallery" && (
                  <motion.div key="gallery" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/95 p-4 rounded-[2.5rem] shadow-2xl">
                    <div className="h-80 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-inner relative group">
                      <AnimatePresence mode="wait">
                        <motion.img 
                            key={currentFoto}
                            src={albumFoto[currentFoto]} 
                            alt="Gallery"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full object-cover" 
                        />
                      </AnimatePresence>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                    <div className="flex justify-between mt-6 px-4 items-center">
                       <button onClick={() => setCurrentFoto((p) => (p - 1 + albumFoto.length) % albumFoto.length)} className="text-pink-500 p-2 bg-pink-50 rounded-full hover:bg-pink-100 transition-colors"><ChevronLeft size={24}/></button>
                       <div className="text-center">
                           <span className="font-black text-pink-500 text-sm tracking-widest">{currentFoto + 1} / {albumFoto.length}</span>
                           <p className="text-[8px] text-gray-400 uppercase font-bold mt-1">Our Memories</p>
                       </div>
                       <button onClick={() => setCurrentFoto((p) => (p + 1) % albumFoto.length)} className="text-pink-500 p-2 bg-pink-50 rounded-full hover:bg-pink-100 transition-colors"><ChevronRight size={24}/></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-3xl px-8 py-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex gap-10 border border-white/20 z-50">
                <button onClick={() => setActiveTab("home")} className={`transition-all duration-300 ${activeTab === "home" ? "text-pink-400 scale-125" : "text-white/40 hover:text-white"}`}><Sparkles size={24}/></button>
                <button onClick={() => setActiveTab("milestone")} className={`transition-all duration-300 ${activeTab === "milestone" ? "text-pink-400 scale-125" : "text-white/40 hover:text-white"}`}><Calendar size={24}/></button>
                <button onClick={() => setActiveTab("wishlist")} className={`transition-all duration-300 ${activeTab === "wishlist" ? "text-pink-400 scale-125" : "text-white/40 hover:text-white"}`}><MessageCircleHeart size={24}/></button>
                <button onClick={() => setActiveTab("gallery")} className={`transition-all duration-300 ${activeTab === "gallery" ? "text-pink-400 scale-125" : "text-white/40 hover:text-white"}`}><ImageIcon size={24}/></button>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fbcfe8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f9a8d4; }
      `}</style>
    </main>
  );
}