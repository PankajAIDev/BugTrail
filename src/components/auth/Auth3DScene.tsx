import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Terminal, Bug, Sparkles, Code2, ShieldAlert, Cpu } from 'lucide-react';

export const Auth3DScene: React.FC = () => {
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  // Mouse parallax springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 90, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 90, damping: 20 });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    const handleMouseMove = (e: MouseEvent) => {
      if (mediaQuery.matches) return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="relative w-full h-full min-h-[480px] lg:min-h-full bg-[#E5E0FA] border-2 lg:border-3 border-[#2F2E33] rounded-3xl shadow-[6px_6px_0px_#2F2E33] overflow-hidden flex items-center justify-center p-6 sm:p-10 select-none">
      
      {/* Background Playful Geometric Pattern */}
      <div
        className="absolute inset-0 opacity-15 bg-[radial-gradient(#2F2E33_1.5px,transparent_1.5px)] bg-[size:24px_24px] pointer-events-none"
      />

      {/* Decorative Neo-Brutalist Soft Spot Backgrounds */}
      <div className="absolute top-8 left-8 w-40 h-40 bg-[#9AF7A0] rounded-full border-2 border-[#2F2E33] blur-xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-40 h-40 bg-[#FFB8B0] rounded-full border-2 border-[#2F2E33] blur-xl opacity-40 pointer-events-none" />

      {/* Main 3D Parallax Container */}
      <motion.div
        style={{
          perspective: 1200,
          rotateX: isReducedMotion ? 0 : rotateX,
          rotateY: isReducedMotion ? 0 : rotateY
        }}
        className="relative w-full max-w-md aspect-square flex items-center justify-center transform-gpu"
      >
        
        {/* Central Rotating 3D Neo-Brutalist Code Cube */}
        <div className="relative w-48 h-48 sm:w-52 sm:h-52 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
          
          <motion.div
            animate={isReducedMotion ? {} : { rotateX: [0, 360], rotateY: [0, 360] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            className="w-full h-full relative transform-gpu"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Cube Face 1 - Front (Mint) */}
            <div
              className="absolute inset-0 bg-[#9AF7A0] border-2 sm:border-3 border-[#2F2E33] rounded-2xl p-4 shadow-[4px_4px_0px_#2F2E33] flex flex-col justify-between"
              style={{ transform: 'translateZ(104px)' }}
            >
              <div className="flex items-center justify-between border-b-2 border-[#2F2E33] pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-[#2F2E33]">
                  <Terminal className="w-4 h-4" />
                  <span>scanf.c</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#24C566] border border-[#2F2E33] animate-ping" />
              </div>
              <div className="font-mono text-[11px] font-bold text-[#2F2E33] space-y-1">
                <p>scanf(<span className="underline decoration-[#2F2E33]">&quot;%d&quot;</span>, &amp;age);</p>
                <p className="text-[#2F2E33]/70">// &amp; operator fixed</p>
              </div>
              <div className="text-[10px] font-extrabold font-mono text-[#2F2E33] bg-white border border-[#2F2E33] rounded-md px-2 py-0.5 w-fit shadow-[1px_1px_0px_#2F2E33]">
                Memory Validated
              </div>
            </div>

            {/* Cube Face 2 - Back (Lavender) */}
            <div
              className="absolute inset-0 bg-[#E5E0FA] border-2 sm:border-3 border-[#2F2E33] rounded-2xl p-4 shadow-[4px_4px_0px_#2F2E33] flex flex-col justify-between"
              style={{ transform: 'rotateY(180deg) translateZ(104px)' }}
            >
              <div className="flex items-center justify-between border-b-2 border-[#2F2E33] pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-[#2F2E33]">
                  <Code2 className="w-4 h-4" />
                  <span>tutor.py</span>
                </div>
                <Sparkles className="w-4 h-4 text-[#2F2E33]" />
              </div>
              <div className="font-mono text-[11px] font-bold text-[#2F2E33] space-y-1">
                <p>def <span className="underline">find_bug</span>(code):</p>
                <p className="text-[#2F2E33]/70">  return AI.scan(code)</p>
              </div>
              <div className="text-[10px] font-extrabold font-mono text-[#2F2E33] bg-[#24C566] border border-[#2F2E33] rounded-md px-2 py-0.5 w-fit shadow-[1px_1px_0px_#2F2E33]">
                AI Mentor Active
              </div>
            </div>

            {/* Cube Face 3 - Right (Coral) */}
            <div
              className="absolute inset-0 bg-[#FFB8B0] border-2 sm:border-3 border-[#2F2E33] rounded-2xl p-4 shadow-[4px_4px_0px_#2F2E33] flex flex-col justify-between"
              style={{ transform: 'rotateY(90deg) translateZ(104px)' }}
            >
              <div className="flex items-center justify-between border-b-2 border-[#2F2E33] pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-[#2F2E33]">
                  <Bug className="w-4 h-4" />
                  <span>Detector</span>
                </div>
                <ShieldAlert className="w-4 h-4 text-[#2F2E33]" />
              </div>
              <div className="font-mono text-[11px] font-bold text-[#2F2E33]">
                <p>Segfault in ptr-&gt;next</p>
                <p className="text-[10px] text-[#2F2E33]/80 mt-1">Line 42: NULL Pointer</p>
              </div>
              <div className="text-[10px] font-extrabold font-mono text-[#2F2E33] bg-white border border-[#2F2E33] rounded-md px-2 py-0.5 w-fit shadow-[1px_1px_0px_#2F2E33]">
                Bug Detected
              </div>
            </div>

            {/* Cube Face 4 - Left (Powder Blue) */}
            <div
              className="absolute inset-0 bg-[#ADDCE8] border-2 sm:border-3 border-[#2F2E33] rounded-2xl p-4 shadow-[4px_4px_0px_#2F2E33] flex flex-col justify-between"
              style={{ transform: 'rotateY(-90deg) translateZ(104px)' }}
            >
              <div className="flex items-center justify-between border-b-2 border-[#2F2E33] pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-extrabold text-[#2F2E33]">
                  <Cpu className="w-4 h-4" />
                  <span>Execution</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#24C566] border border-[#2F2E33]" />
              </div>
              <div className="font-mono text-[11px] font-bold text-[#2F2E33] space-y-1">
                <p>Status: 200 OK</p>
                <p>XP: +150 Earned</p>
              </div>
              <div className="text-[10px] font-extrabold font-mono text-[#2F2E33] bg-white border border-[#2F2E33] rounded-md px-2 py-0.5 w-fit shadow-[1px_1px_0px_#2F2E33]">
                Streak: 5 Days
              </div>
            </div>

            {/* Cube Face 5 - Top (White) */}
            <div
              className="absolute inset-0 bg-white border-2 sm:border-3 border-[#2F2E33] rounded-2xl p-4 shadow-[4px_4px_0px_#2F2E33]"
              style={{ transform: 'rotateX(90deg) translateZ(104px)' }}
            >
              <div className="h-full flex items-center justify-center font-mono text-xs text-[#2F2E33] font-extrabold">
                Supabase Auth
              </div>
            </div>

            {/* Cube Face 6 - Bottom (Cream) */}
            <div
              className="absolute inset-0 bg-[#FFF9F4] border-2 sm:border-3 border-[#2F2E33] rounded-2xl p-4 shadow-[4px_4px_0px_#2F2E33]"
              style={{ transform: 'rotateX(-90deg) translateZ(104px)' }}
            >
              <div className="h-full flex items-center justify-center font-mono text-xs text-[#2F2E33] font-extrabold">
                PostgreSQL DB
              </div>
            </div>

          </motion.div>
        </div>

        {/* Floating Glass Orb 1 - Top Right */}
        <motion.div
          animate={isReducedMotion ? {} : { y: [-8, 8, -8], rotate: [0, 4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-4 -right-2 sm:top-2 sm:right-2 bg-white border-2 border-[#2F2E33] p-3 rounded-2xl shadow-[3px_3px_0px_#2F2E33] flex items-center gap-2.5 z-20 pointer-events-none max-w-[200px]"
        >
          <div className="w-8 h-8 rounded-xl bg-[#24C566] border border-[#2F2E33] flex items-center justify-center text-[#2F2E33] shrink-0 font-extrabold">
            <Bug className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#2F2E33] font-display">Code Scanner</div>
            <div className="text-[10px] text-[#858B98] font-bold">C &amp; Python Debugging</div>
          </div>
        </motion.div>

        {/* Floating Glass Orb 2 - Bottom Left */}
        <motion.div
          animate={isReducedMotion ? {} : { y: [8, -8, 8], rotate: [0, -4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-4 -left-2 sm:bottom-2 sm:left-2 bg-white border-2 border-[#2F2E33] p-3 rounded-2xl shadow-[3px_3px_0px_#2F2E33] flex items-center gap-2.5 z-20 pointer-events-none max-w-[210px]"
        >
          <div className="w-8 h-8 rounded-xl bg-[#ADDCE8] border border-[#2F2E33] flex items-center justify-center text-[#2F2E33] shrink-0 font-extrabold">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-[#2F2E33] font-display">AI Tutor Guided</div>
            <div className="text-[10px] text-[#858B98] font-bold">Step-by-step intuition</div>
          </div>
        </motion.div>

      </motion.div>

      {/* Floating Bottom Tagline Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white border-2 border-[#2F2E33] rounded-full shadow-[2px_2px_0px_#2F2E33] flex items-center gap-2 text-xs font-bold text-[#2F2E33] z-10">
        <span className="w-2 h-2 rounded-full bg-[#24C566] border border-[#2F2E33] animate-ping" />
        <span>BugTrail AI • Animated 3D Engine</span>
      </div>

    </div>
  );
};
