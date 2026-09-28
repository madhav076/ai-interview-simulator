"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Mic,
  Code2,
  FileCheck2,
  TrendingUp,
  Activity,
} from "lucide-react";

export function HolographicHeroVisual() {
  return (
    <div className="relative w-full max-w-[560px] mx-auto lg:max-w-none flex items-center justify-center select-none">
      {/* ── Ambient Background Glow & Gradients ── */}
      <div className="absolute -inset-4 sm:-inset-8 -z-10 flex items-center justify-center pointer-events-none">
        {/* Cyan/Electric Blue radial glow */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-cyan-500/20 dark:bg-cyan-400/25 blur-3xl animate-pulse-slow" />
        {/* Purple/Indigo secondary glow */}
        <div className="absolute w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-indigo-600/25 dark:bg-purple-600/30 blur-3xl -translate-y-6 translate-x-6" />
        {/* Core spotlight */}
        <div className="absolute w-44 h-44 rounded-full bg-sky-400/20 blur-2xl" />
      </div>

      {/* ── Main 3D Holographic Container with Subtle Float ── */}
      <motion.div
        className="relative w-full aspect-square max-w-[480px] lg:max-w-[520px] flex items-center justify-center"
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* ── Outer Concentric Holographic Light Rings ── */}
        <div className="absolute bottom-4 sm:bottom-6 w-[85%] h-[24%] rounded-[100%] border border-cyan-400/30 dark:border-cyan-400/40 bg-gradient-to-b from-cyan-400/10 via-indigo-500/10 to-transparent shadow-[0_0_30px_rgba(6,182,212,0.35)] -z-1 pointer-events-none" />
        <div className="absolute bottom-2 sm:bottom-3 w-[65%] h-[16%] rounded-[100%] border border-cyan-300/40 dark:border-cyan-300/60 shadow-[0_0_20px_rgba(34,211,238,0.5)] -z-1 pointer-events-none" />

        {/* ── Hologram Projector Light Cone ── */}
        <div className="absolute bottom-6 w-[80%] h-[75%] bg-gradient-to-t from-cyan-500/15 via-indigo-600/5 to-transparent [clip-path:polygon(20%_0%,80%_0%,100%_100%,0%_100%)] pointer-events-none blur-sm" />

        {/* ── The 3D Avatar Image with Seamless Edge Blending ── */}
        <div className="relative w-full h-full flex items-center justify-center [mask-image:radial-gradient(ellipse_68%_70%_at_50%_48%,black_45%,transparent_98%)]">
          <Image
            src="/assets/holographic-interviewer.png"
            alt="3D Holographic AI Interviewer Avatar"
            width={600}
            height={600}
            priority
            className="w-full h-full object-contain drop-shadow-[0_10px_35px_rgba(6,182,212,0.35)] dark:drop-shadow-[0_10px_45px_rgba(34,211,238,0.45)]"
          />
        </div>

        {/* ── Floating Holographic UI Glass Panels ── */}

        {/* Top-Left: Audio & Voice Waveform Widget */}
        <motion.div
          className="absolute -top-2 -left-2 sm:-left-4 z-20"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          <div className="rounded-xl border border-cyan-400/40 dark:border-cyan-400/30 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-3.5 py-2.5 shadow-lg shadow-cyan-500/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-400/20">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200">
                  Voice & Tone AI
                </p>
              </div>
              {/* Dynamic simulated waveform bars */}
              <div className="mt-1 flex items-center gap-0.5 h-3">
                {[40, 75, 100, 60, 90, 45, 80, 55, 95, 70, 30].map((height, i) => (
                  <span
                    key={i}
                    className="w-1 bg-gradient-to-t from-cyan-500 to-indigo-500 rounded-full transition-all duration-300 animate-pulse"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${i * 120}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top-Right: Resume & ATS Match Widget */}
        <motion.div
          className="absolute top-4 -right-2 sm:-right-4 z-20"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <div className="rounded-xl border border-indigo-400/40 dark:border-indigo-400/30 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-3.5 py-2.5 shadow-lg shadow-indigo-500/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-400/20">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                ATS Resume Match
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">96%</span>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200">Role Aligned</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom-Left: Live Coding Evaluation Widget */}
        <motion.div
          className="absolute bottom-12 -left-3 sm:-left-6 z-20 hidden sm:block"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <div className="rounded-xl border border-purple-400/40 dark:border-purple-400/30 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-3.5 py-2.5 shadow-lg shadow-purple-500/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-400/20">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Code Evaluation
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 font-mono">
                  O(N) Optimal
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Passed
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom-Right: Real-Time Analytics Score Widget */}
        <motion.div
          className="absolute bottom-10 -right-3 sm:-right-6 z-20"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
        >
          <div className="rounded-xl border border-cyan-400/40 dark:border-cyan-400/30 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md px-3.5 py-2.5 shadow-lg shadow-cyan-500/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-400/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Session Telemetry
                </span>
                <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400">
                  94/100
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-700 dark:text-zinc-300">
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-3 h-3" /> Live Active
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Cybernetic Particle Accents ── */}
        <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-ping" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc] animate-ping" />
      </motion.div>
    </div>
  );
}
