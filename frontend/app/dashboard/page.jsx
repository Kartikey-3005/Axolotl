'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWebSocketTelemetry } from '../../hooks/useWebSocketTelemetry';
import BorderGlow from '../../components/BorderGlow';

export default function DashboardPage() {
  const { telemetryData, isConnected } = useWebSocketTelemetry();

  // Initial fallback trains if WS is connecting
  const activeTrains = telemetryData.length > 0 ? telemetryData : [
    { train_id: "TR-801", latitude: 28.6139, longitude: 77.2090, current_speed: 112.5, current_weight: 2450.0, passenger_count: 420, status: "ON_TIME" },
    { train_id: "TR-404", latitude: 19.0760, longitude: 72.8777, current_speed: 98.0, current_weight: 3800.0, passenger_count: 120, status: "DELAYED" },
    { train_id: "TR-909", latitude: 13.0827, longitude: 80.2707, current_speed: 135.0, current_weight: 1850.0, passenger_count: 650, status: "CRITICAL" },
    { train_id: "TR-102", latitude: 22.5726, longitude: 88.3639, current_speed: 85.2, current_weight: 4100.0, passenger_count: 0, status: "ON_TIME" }
  ];

  const totalActive = activeTrains.length;
  const delayedCount = activeTrains.filter(t => t.status === "DELAYED").length;
  const criticalCount = activeTrains.filter(t => t.status === "CRITICAL").length;

  return (
    <div className="w-full bg-[#050505] min-h-screen p-4 md:p-6 font-mono space-y-6">

      {/* Top Header & Status */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-panel hud-corner p-5 border-cyan/30 shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
      >
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase text-white tracking-widest flex items-center gap-3 drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]">
            <span className="w-3 h-3 bg-cyan inline-block shadow-[0_0_10px_#00F0FF] animate-pulse"></span>
            Main Network Map // Spatial Radar
          </h1>
          <p className="text-[#9FA8BF] text-xs mt-1.5 flex flex-wrap items-center gap-2">
            <span>REAL-TIME SPATIAL POSITIONING & MAGLEV TELEMETRY</span>
            <span className="text-cyan font-bold bg-cyan/10 px-2 py-0.5 border border-cyan/30 text-[10px] shadow-[0_0_8px_rgba(0,240,255,0.2)]">
              FOR TRAIN DETAILS, CLICK ON THE NODES
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="border border-cyan/30 bg-[#050811] px-3.5 py-1.5 text-xs flex items-center gap-2 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-cyan shadow-[0_0_8px_#00F0FF]' : 'bg-crimson shadow-[0_0_8px_#FF3366] animate-pulse'}`}></span>
            <span className="text-[#9FA8BF]">STREAM:</span>
            <span className={isConnected ? 'text-cyan font-black' : 'text-crimson font-black'}>
              {isConnected ? 'LIVE WEBSOCKET' : 'FALLBACK SIM'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Row with Floating Levitation & BorderGlow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}>
          <BorderGlow
            backgroundColor="#0A0D14"
            borderRadius={0}
            glowColor="185 100 50"
            colors={['#00F0FF', '#0099FF', '#00F0FF']}
            glowRadius={30}
            glowIntensity={1.3}
            edgeSensitivity={40}
          >
            <div className="p-5 border-l-4 border-l-cyan glass-panel border-cyan/20">
              <span className="text-[#9FA8BF] text-xs block font-bold tracking-wider">ACTIVE MAGLEV UNITS</span>
              <div className="text-4xl font-black text-cyan mt-1 drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">{totalActive}</div>
              <span className="text-[10px] text-cyan/90 mt-2 block tracking-widest uppercase">TRACK SECTORS FULLY MONITORED</span>
            </div>
          </BorderGlow>
        </motion.div>

        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}>
          <BorderGlow
            backgroundColor="#0A0D14"
            borderRadius={0}
            glowColor="35 100 50"
            colors={['#FFAA00', '#FF8800', '#FFCC00']}
            glowRadius={30}
            glowIntensity={1.2}
            edgeSensitivity={40}
          >
            <div className="p-5 border-l-4 border-l-amber-500 glass-panel border-amber-500/20">
              <span className="text-[#9FA8BF] text-xs block font-bold tracking-wider">DELAYED UNITS</span>
              <div className="text-4xl font-black text-amber-400 mt-1 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]">{delayedCount}</div>
              <span className="text-[10px] text-amber-300 mt-2 block tracking-widest uppercase">DRIFT &gt; +10 MINS</span>
            </div>
          </BorderGlow>
        </motion.div>

        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}>
          <BorderGlow
            backgroundColor="#0A0D14"
            borderRadius={0}
            glowColor="345 100 60"
            colors={['#FF3366', '#FF0055', '#FF3366']}
            glowRadius={30}
            glowIntensity={1.4}
            edgeSensitivity={40}
          >
            <div className="p-5 border-l-4 border-l-crimson glass-panel-crimson">
              <span className="text-[#9FA8BF] text-xs block font-bold tracking-wider">CRITICAL ALERTS / OVERRIDES</span>
              <div className="text-4xl font-black text-crimson mt-1 drop-shadow-[0_0_12px_rgba(255,51,102,0.6)] animate-pulse">{criticalCount}</div>
              <span className="text-[10px] text-crimson mt-2 block tracking-widest uppercase">IMMEDIATE DISPATCH ATTENTION REQ.</span>
            </div>
          </BorderGlow>
        </motion.div>
      </div>

      {/* Main Grid: Interactive Map & Live Feed Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Interactive Tactical Map Container (2 Cols) */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="lg:col-span-2 glass-panel hud-corner border-cyan/30 p-5 relative min-h-[480px] flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
        >
          <div className="flex justify-between items-center border-b border-cyan/20 pb-3">
            <span className="text-cyan font-black text-xs uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
              <span className="w-2 h-2 bg-cyan"></span>
              Live Tactical Maglev Grid
            </span>
            <span className="text-[#9FA8BF] text-[10px] tracking-widest">RADAR_GRID: 1:50000 // LEVITATION ON</span>
          </div>

          {/* Interactive Map Visual Simulation Nodes */}
          <div className="relative w-full h-[360px] my-4 border border-ocean-border bg-ocean-bg/90 overflow-hidden flex items-center justify-center">
            {/* Grid Track SVG Lines */}
            <svg className="absolute inset-0 w-full h-full stroke-ocean-border stroke-1" xmlns="http://www.w3.org/2000/svg">
              <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="#383C4D" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="10%" y1="80%" x2="90%" y2="20%" stroke="#383C4D" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#383C4D" strokeWidth="1" />
            </svg>

            {/* Dynamic Moving Nodes */}
            {activeTrains.map((train, idx) => {
              const xPos = 20 + ((idx * 25) % 65);
              const yPos = 25 + ((idx * 20) % 55);

              const isCritical = train.status === 'CRITICAL';
              const isDelayed = train.status === 'DELAYED';

              return (
                <Link
                  key={train.train_id}
                  href={`/trains/${train.train_id}`}
                  style={{ left: `${xPos}%`, top: `${yPos}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                >
                  <div className={`relative p-2.5 border transition-transform group-hover:scale-125 ${
                    isCritical
                      ? 'border-crimson bg-crimson/25 shadow-[0_0_15px_rgba(255,51,102,0.8)]'
                      : isDelayed
                      ? 'border-amber-400 bg-amber-400/20 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                      : 'border-cyan bg-cyan/15 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  }`}>
                    {/* Pulsing indicator */}
                    <div className={`w-3.5 h-3.5 ${
                      isCritical
                        ? 'bg-crimson animate-ping'
                        : isDelayed
                        ? 'bg-amber-400'
                        : 'bg-cyan animate-pulse'
                    }`} />

                    {/* Tooltip on Hover */}
                    <div className="absolute left-7 top-0 hidden group-hover:block bg-[#050811] border border-cyan p-2.5 z-30 whitespace-nowrap text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                      <div className="text-white font-black tracking-widest">{train.train_id}</div>
                      <div className="text-cyan font-bold mt-0.5">VELOCITY: {train.current_speed} km/h</div>
                      <div className="text-[#9FA8BF]">PAYLOAD: {train.current_weight} t</div>
                      <div className="text-cyan text-[10px] underline mt-1.5 font-bold">CLICK FOR TELEMETRY DASHBOARD →</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-white font-bold block text-center mt-1 bg-[#050505]/95 px-1.5 py-0.5 border border-cyan/30 shadow-md">
                    {train.train_id}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#9FA8BF] border-t border-cyan/20 pt-3">
            <span>CLICK NODE TO VIEW DETAILED TELEMETRY</span>
            <span className="text-cyan font-bold">LIVE WEBSOCKET STREAM ACTIVE</span>
          </div>
        </motion.div>

        {/* Active Trains List Panel (1 Col) */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          className="glass-panel hud-corner border-cyan/30 p-5 space-y-4 shadow-[0_20px_45px_rgba(0,0,0,0.8)]"
        >
          <div className="border-b border-cyan/20 pb-3 flex justify-between items-center">
            <h3 className="text-cyan font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan"></span>
              Active Maglev Fleet
            </h3>
            <span className="text-[9px] text-[#9FA8BF] px-1.5 py-0.5 border border-cyan/30 bg-cyan/10">TELEMETRY</span>
          </div>

          <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
            {activeTrains.map((train) => (
              <div key={train.train_id} className="border border-[#1E2538] bg-[#050811]/80 p-3.5 hover:border-cyan transition-all shadow-sm group">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-white font-black text-sm group-hover:text-cyan transition-colors">{train.train_id}</span>
                    <span className="text-[10px] text-[#9FA8BF] block mt-0.5">GEO: {train.latitude}, {train.longitude}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                    train.status === 'CRITICAL'
                      ? 'border-crimson bg-crimson/20 text-crimson animate-pulse'
                      : train.status === 'DELAYED'
                      ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                      : 'border-cyan/40 bg-cyan/10 text-cyan'
                  }`}>
                    {train.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs border-t border-[#1E2538] pt-2">
                  <div>
                    <span className="text-[#9FA8BF] text-[10px] block">VELOCITY</span>
                    <span className="text-cyan font-bold">{train.current_speed} km/h</span>
                  </div>
                  <div>
                    <span className="text-[#9FA8BF] text-[10px] block">PAYLOAD MASS</span>
                    <span className="text-white font-bold">{train.current_weight} t</span>
                  </div>
                </div>

                <Link
                  href={`/trains/${train.train_id}`}
                  className="mt-3 block w-full text-center bg-[#0E131F] hover:bg-cyan hover:text-black border border-cyan/30 text-white text-xs py-2 transition-all font-bold uppercase tracking-wider shadow-sm hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  View Train Telemetry & Stats →
                </Link>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
