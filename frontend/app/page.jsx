"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AxolotlCommandCenter() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/stream";

  const [scenarioData, setScenarioData] = useState(null);
  const [kpiData, setKpiData] = useState({ active_trains: 4, delayed_trains: 1 });
  const wsRef = useRef(null);

  const [countdown, setCountdown] = useState(60);
  const [actionExpired, setActionExpired] = useState(false);
  const [approved, setApproved] = useState(false);

  const [selectedTrain, setSelectedTrain] = useState(null);

  const [alerts, setAlerts] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [formData, setFormData] = useState({
    train_id: 'TR-801', alert_type: 'SPEED_VIOLATION', severity: 'WARNING', description: '', location: ''
  });

  const hasCriticalAlert = alerts.some(alt => alt.severity === 'CRITICAL');

  const fetchAlerts = () => {
    fetch(`${API_URL}/api/v1/alerts`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => { if (Array.isArray(data)) setAlerts(data); })
      .catch(() => {
        setAlerts([
          { id: "ALT-1001", train_id: "TR-404", alert_type: "SPEED_VIOLATION", severity: "RESOLVED", description: "Locomotive exceeded track curved threshold.", location: "Kalyan Outer Line #3", timestamp: new Date().toISOString() },
        ]);
      });
  };

  useEffect(() => { fetchAlerts(); }, []);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socket.onopen = () => socket.send("NEXT");
    socket.onmessage = (event) => {
      setScenarioData(JSON.parse(event.data));
      setCountdown(60);
      setActionExpired(false);
      setApproved(false);
      setSelectedTrain(null);
    };
    wsRef.current = socket;
    return () => socket.close();
  }, [WS_URL]);

  useEffect(() => {
    if (scenarioData && !approved && !actionExpired) {
      const risk = scenarioData.scenario?.delay_risk;
      if (risk === "HIGH" || risk === "CRITICAL") {
        const autoTimer = setTimeout(() => {
          const autoAlert = {
            id: `SYS-${Math.floor(Math.random() * 10000)}`,
            train_id: scenarioData.scenario.train_1_id,
            alert_type: 'COLLISION_WARNING',
            severity: 'CRITICAL',
            description: 'Automated telemetry detected critical overlap in sector approach. AI intervention required.',
            location: scenarioData.scenario.location || 'Central Junction',
            timestamp: new Date().toISOString(),
            showAction: false
          };
          setAlerts(prev => [autoAlert, ...prev]);
        }, 3000);
        return () => clearTimeout(autoTimer);
      }
    }
  }, [scenarioData, approved, actionExpired]);

  useEffect(() => {
    let timer;
    if (approved || actionExpired) {
      timer = setTimeout(() => { handleNextScenario(); }, 4000);
    }
    return () => clearTimeout(timer);
  }, [approved, actionExpired]);

  useEffect(() => {
    const timers = alerts.map((alert, index) => {
      if (alert.severity === 'CRITICAL' && !alert.showAction) {
        return setTimeout(() => {
          setAlerts(prev => {
            const newList = [...prev];
            if (newList[index]) newList[index] = { ...newList[index], showAction: true };
            return newList;
          });
        }, 2000);
      }
      return null;
    });
    return () => timers.forEach(t => t && clearTimeout(t));
  }, [alerts]);

  useEffect(() => {
    if (scenarioData && countdown > 0 && !actionExpired && !approved) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && scenarioData && !approved && !actionExpired) {
      if (hasCriticalAlert) {
        handleApprove("AUTO-EXECUTED: Safety protocol engaged");
        setActionExpired(true);
      } else {
        setApproved(true);
      }
    }
  }, [countdown, actionExpired, approved, scenarioData, hasCriticalAlert]);

  const handleNextScenario = () => {
    setApproved(false);
    setActionExpired(false);
    setScenarioData(null);
    setSelectedTrain(null);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("NEXT");
    } else {
      const socket = new WebSocket(WS_URL);
      socket.onopen = () => socket.send("NEXT");
      socket.onmessage = (event) => {
        setScenarioData(JSON.parse(event.data));
        setCountdown(60);
        setActionExpired(false);
        setApproved(false);
        setSelectedTrain(null);
      };
      wsRef.current = socket;
    }
  };

  const handleApprove = async (actionType = "Controller Overridden & Approved") => {
    setApproved(true);
    setAlerts(prev => prev.map(a => a.severity === 'CRITICAL' ? { ...a, severity: 'RESOLVED', showAction: false } : a));

    try {
      await fetch(`${API_URL}/api/v1/audit/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: scenarioData?.scenario?.scenario_id || 0,
          priority_train_id: priorityTrain,
          action_taken: actionType
        })
      });
    } catch (error) { console.error("Failed to log approval"); }
  };

  const handleCustomAlertSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('LOGGING TO BACKEND...');
    const newAlert = { id: `MNL-${Math.floor(Math.random() * 1000)}`, ...formData, timestamp: new Date().toISOString(), showAction: false };
    setAlerts(prev => [newAlert, ...prev]);
    setStatusMsg('ALERT LOGGED!');
    setFormData({ train_id: 'TR-801', alert_type: 'SPEED_VIOLATION', severity: 'WARNING', description: '', location: '' });
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleTrainClick = (trainId, simulatedType) => {
    const isFreight = simulatedType.includes("Freight") || simulatedType.includes("Rake");
    setSelectedTrain({
      id: trainId,
      type: simulatedType,
      origin: isFreight ? 'Mundra Port (MDPR)' : 'New Delhi (NDLS)',
      destination: isFreight ? 'Kanpur Goods Shed (KPG)' : 'Mumbai Central (MMCT)',
      status: hasCriticalAlert && (trainId === train1Id || trainId === train2Id) ? 'DELAYED' : 'ON TIME',
      speed: isFreight ? '75 km/h' : '110 km/h',
      weight: isFreight ? '4500 t' : '1200 t'
    });
  };

  // === CLASSIC X-INTERSECTION KINEMATIC MATH (60s Duration) ===
  const train1Id = scenarioData?.scenario?.train_1_id || "TR-801";
  const train2Id = scenarioData?.scenario?.train_2_id || "TR-404";
  const train3Id = scenarioData ? `WAG-12 Freight (${10000 + (scenarioData.scenario.scenario_id * 7)})` : "TR-102";
  const train4Id = scenarioData ? `EMU Local (${11000 + (scenarioData.scenario.scenario_id * 3)})` : "TR-909";

  const priorityTrain = scenarioData?.priority_train || train1Id;

  let t1X = 100, t1Y = 150, t2X = 900, t2Y = 100, t3X = 100, t3Y = 400, t4X = 900, t4Y = 350;

  if (scenarioData) {
    const creep = 60 - countdown;
    if (approved || actionExpired) {
      t1X = priorityTrain === train1Id ? 900 : 420; t1Y = priorityTrain === train1Id ? 350 : 230;
      t2X = priorityTrain === train2Id ? 100 : 580; t2Y = priorityTrain === train2Id ? 400 : 220;
      t3X = priorityTrain === train3Id ? 900 : 420; t3Y = priorityTrain === train3Id ? 100 : 280;
      t4X = priorityTrain === train4Id ? 100 : 580; t4Y = priorityTrain === train4Id ? 150 : 270;
    } else {
      // Convergence math towards center (500, 250) over 60 seconds
      t1X = 100 + (creep * 5.33); t1Y = 150 + (creep * 1.33);
      t2X = 900 - (creep * 5.33); t2Y = 100 + (creep * 2.0);
      t3X = 100 + (creep * 5.33); t3Y = 400 - (creep * 2.0);
      t4X = 900 - (creep * 5.33); t4Y = 350 - (creep * 1.33);
    }
  }
  const movementTransition = (approved || actionExpired) ? 'transform 2.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 1s linear';

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#EAEAEA] font-mono selection:bg-crimson selection:text-white pb-28 overflow-x-hidden relative">

      {/* Floating CRITICAL CONFLICT Alert Toast */}
      <AnimatePresence>
        {hasCriticalAlert && !approved && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-[92%] max-w-2xl"
          >
            <div className="glass-panel-crimson border-2 border-crimson p-4 shadow-[0_0_40px_rgba(255,51,102,0.6)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse-crimson">
              <div className="flex items-center gap-3">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-crimson"></span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-crimson font-black tracking-widest text-xs uppercase bg-crimson/20 px-2 py-0.5 border border-crimson">
                      CRITICAL CONFLICT DETECTED
                    </span>
                    <span className="text-[10px] text-[#9FA8BF]">SECTOR INTERSECT</span>
                  </div>
                  <p className="text-xs text-white/90 mt-1">
                    Telemetry trajectory collision risk imminent. Action window: <span className="text-crimson font-bold">{countdown}s</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleApprove("Instant Conflict Override")}
                className="whitespace-nowrap px-4 py-2 bg-crimson hover:bg-white text-black font-black tracking-widest text-xs uppercase transition-all shadow-[0_0_20px_rgba(255,51,102,0.8)] hover:scale-105 active:scale-95"
              >
                ⚡ EXECUTE REROUTE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6 space-y-8">

        {/* Top Header & Tactical Status */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-cyan/20 pb-4 gap-4"
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-cyan inline-block shadow-[0_0_12px_#00F0FF] animate-pulse"></span>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                NETWORK COMMAND CENTER
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold border border-cyan/40 bg-cyan/10 text-cyan tracking-widest">
                MAGLEV ANTIGRAVITY ENGINE
              </span>
            </div>
            <p className="mt-2 text-[10px] text-[#9FA8BF] tracking-widest uppercase flex flex-wrap items-center gap-2">
              <span>OR-TOOLS MULTI-LEVEL ROUTING & COLLISION AVOIDANCE</span>
              <span className="text-cyan font-bold bg-cyan/10 px-2.5 py-0.5 border border-cyan/40 rounded-none flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                <span>⚡</span> CLICK INTERSECTION NODES FOR DEEP TELEMETRY
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass-panel px-3 py-1.5 text-xs flex items-center gap-2 border border-cyan/30 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_8px_#00F0FF]"></span>
              <span className="text-[#9FA8BF]">FASTAPI SIM:</span>
              <span className="text-cyan font-bold tracking-wider">ACTIVE</span>
            </div>
          </div>
        </motion.div>

        {/* Main Grid: Floating 3D Map (Left) & Telemetry HUD (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column: Floating Holographic Map & Incident Log */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* 1. FLOATING CENTRAL HOLOGRAPHIC MAP (Highest z-axis levitation) */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="glass-panel hud-corner border border-cyan/40 rounded-none relative z-20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(0,240,255,0.2)]"
            >
              <div className="flex justify-between items-center px-5 py-3 border-b border-cyan/20 bg-void/60 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan shadow-[0_0_8px_#00F0FF]"></div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                    HOLOGRAPHIC JUNCTION FLUX MAP
                  </h3>
                  <span className="hidden sm:inline-block text-[10px] text-cyan/90 font-bold tracking-widest uppercase bg-cyan/10 px-2 py-0.5 border border-cyan/30">
                    ELEVATION: LEVEL 0 / 1 (3D MAGLEV)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#9FA8BF] tracking-widest">
                    SYNC_WINDOW: <span className="text-white font-bold">{countdown}s</span>
                  </span>
                </div>
              </div>

              {/* Map SVG Canvas */}
              <div className="relative bg-[#050811] h-[520px] overflow-hidden hud-grid-bg">
                {/* Visual scanline effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan/5 to-transparent h-24 animate-scanline pointer-events-none"></div>

                <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 1000 500">
                  <defs>
                    <linearGradient id="cyanTrack" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#00F0FF" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="crimsonTrack" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FF3366" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#FF3366" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#FF3366" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="crimsonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Central Crosshairs & Maglev Elevation Grid */}
                  <line x1="500" y1="0" x2="500" y2="500" stroke="#00F0FF" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="5 5" />
                  <line x1="0" y1="250" x2="1000" y2="250" stroke="#00F0FF" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="5 5" />
                  <circle cx="500" cy="250" r="80" stroke="#00F0FF" strokeOpacity="0.2" fill="none" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="500" cy="250" r="160" stroke="#00F0FF" strokeOpacity="0.1" fill="none" strokeWidth="1" />

                  {/* Intersecting Maglev Tracks (Glowing Vector Beams) */}
                  <line x1="100" y1="150" x2="900" y2="350" stroke="url(#cyanTrack)" strokeWidth="3" filter="url(#cyanGlow)" strokeDasharray="8 4" />
                  <line x1="100" y1="400" x2="900" y2="100" stroke={hasCriticalAlert ? "url(#crimsonTrack)" : "url(#cyanTrack)"} strokeWidth="3" filter={hasCriticalAlert ? "url(#crimsonGlow)" : "url(#cyanGlow)"} strokeDasharray="8 4" />

                  {/* Central Junction Marker */}
                  <g transform="translate(500, 250)">
                    <rect x="-12" y="-12" width="24" height="24" fill="none" stroke={hasCriticalAlert ? "#FF3366" : "#00F0FF"} strokeWidth="1.5" className="animate-spin" style={{ transformOrigin: "0 0" }} />
                    <circle cx="0" cy="0" r="4" fill={hasCriticalAlert ? "#FF3366" : "#00F0FF"} filter={hasCriticalAlert ? "url(#crimsonGlow)" : "url(#cyanGlow)"} />
                    <text x="0" y="24" fill={hasCriticalAlert ? "#FF3366" : "#00F0FF"} fontSize="8" fontWeight="bold" textAnchor="middle" className="tracking-widest">
                      JUNCTION // X-01
                    </text>
                  </g>

                  {/* TRAIN 3 (Cargo Maglev) */}
                  <g onClick={() => handleTrainClick(train3Id, "Heavy Freight Maglev")} style={{ transform: `translate(${t3X}px, ${t3Y}px)`, transition: movementTransition, opacity: 1, cursor: 'pointer' }}>
                    <rect x="-24" y="-14" width="48" height="28" fill="#00F0FF" fillOpacity="0.15" stroke="#00F0FF" strokeWidth="1" filter="url(#cyanGlow)" />
                    <rect x="-8" y="-5" width="16" height="10" fill={(approved || actionExpired) && priorityTrain !== train3Id ? "#333" : "#00F0FF"} />
                    <rect x="-55" y="-32" width="110" height="15" fill="#050505" stroke="#00F0FF" strokeOpacity="0.6" strokeWidth="1" />
                    <text x="0" y="-22" fill="#00F0FF" fontSize="8" fontWeight="bold" textAnchor="middle" className="tracking-widest">{train3Id} [CARGO]</text>
                  </g>

                  {/* TRAIN 4 (Commuter Maglev) */}
                  <g onClick={() => handleTrainClick(train4Id, "Commuter Local Maglev")} style={{ transform: `translate(${t4X}px, ${t4Y}px)`, transition: movementTransition, opacity: 1, cursor: 'pointer' }}>
                    <rect x="-24" y="-14" width="48" height="28" fill="#00F0FF" fillOpacity="0.15" stroke="#00F0FF" strokeWidth="1" filter="url(#cyanGlow)" />
                    <rect x="-8" y="-5" width="16" height="10" fill={(approved || actionExpired) && priorityTrain !== train4Id ? "#333" : "#00F0FF"} />
                    <rect x="-55" y="22" width="110" height="15" fill="#050505" stroke="#00F0FF" strokeOpacity="0.6" strokeWidth="1" />
                    <text x="0" y="32" fill="#00F0FF" fontSize="8" fontWeight="bold" textAnchor="middle" className="tracking-widest">{train4Id} [LOCAL]</text>
                  </g>

                  {/* TRAIN 1 */}
                  <g onClick={() => handleTrainClick(train1Id, scenarioData?.scenario?.train_1_type || "Express Maglev")} style={{ transform: `translate(${t1X}px, ${t1Y}px)`, transition: movementTransition, opacity: 1, cursor: 'pointer' }}>
                    <rect x="-24" y="-14" width="48" height="28" fill="#00F0FF" fillOpacity="0.2" stroke={hasCriticalAlert ? "#FF3366" : "#00F0FF"} strokeWidth="1.5" filter={hasCriticalAlert ? "url(#crimsonGlow)" : "url(#cyanGlow)"} />
                    <rect x="-8" y="-5" width="16" height="10" fill={(approved || actionExpired) && priorityTrain !== train1Id ? "#333" : hasCriticalAlert ? "#FF3366" : "#00F0FF"} />
                    <rect x="-58" y="-32" width="116" height="15" fill="#050505" stroke={hasCriticalAlert ? "#FF3366" : "#00F0FF"} strokeWidth="1" />
                    <text x="0" y="-22" fill={hasCriticalAlert ? "#FF3366" : "#00F0FF"} fontSize="8" fontWeight="bold" textAnchor="middle" className="tracking-widest">
                      {train1Id} {hasCriticalAlert ? "[DELAYED]" : "[EXP-01]"}
                    </text>
                  </g>

                  {/* TRAIN 2 */}
                  <g onClick={() => handleTrainClick(train2Id, scenarioData?.scenario?.train_2_type || "Express Maglev")} style={{ transform: `translate(${t2X}px, ${t2Y}px)`, transition: movementTransition, opacity: 1, cursor: 'pointer' }}>
                    <rect x="-24" y="-14" width="48" height="28" fill={hasCriticalAlert ? "#FF3366" : "#00F0FF"} fillOpacity="0.25" stroke={hasCriticalAlert ? "#FF3366" : "#00F0FF"} strokeWidth="1.5" filter={hasCriticalAlert ? "url(#crimsonGlow)" : "url(#cyanGlow)"} className="animate-pulse" />
                    <rect x="-8" y="-5" width="16" height="10" fill={(approved || actionExpired) && priorityTrain !== train2Id ? "#333" : hasCriticalAlert ? "#FF3366" : "#00F0FF"} />
                    <rect x="-58" y="22" width="116" height="15" fill="#050505" stroke={hasCriticalAlert ? "#FF3366" : "#00F0FF"} strokeWidth="1" />
                    <text x="0" y="32" fill={hasCriticalAlert ? "#FF3366" : "#00F0FF"} fontSize="8" fontWeight="bold" textAnchor="middle" className="tracking-widest">
                      {train2Id} {hasCriticalAlert ? "[CONFLICT]" : "[EXP-02]"}
                    </text>
                  </g>
                </svg>
              </div>
            </motion.div>

            {/* 2. RECENT INCIDENTS / CONFLICT LOGS */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="glass-panel border border-[#1E2538] p-6 space-y-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)]"
            >
              <div className="flex justify-between items-center border-b border-[#1E2538] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-crimson shadow-[0_0_8px_#FF3366]"></span>
                  AUTOMATED & MANUAL INCIDENT LOGS
                </h3>
                <span className="text-[10px] text-[#9FA8BF] tracking-widest">REAL-TIME TELEMETRY FEED</span>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {alerts.map((alt) => (
                  <div key={alt.id} className={`border p-4 transition-all relative ${
                    alt.severity === 'CRITICAL'
                      ? 'border-crimson border-l-4 border-l-crimson bg-crimson/10 shadow-[0_0_20px_rgba(255,51,102,0.2)]'
                      : alt.severity === 'WARNING'
                      ? 'border-amber-500/50 border-l-4 border-l-amber-500 bg-amber-950/20'
                      : 'border-emerald-600/50 border-l-4 border-l-emerald-600 bg-emerald-950/20'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs font-bold tracking-widest text-white">
                        {alt.id} <span className="text-cyan">[{alt.train_id}]</span>
                      </div>
                      <div className={`px-2 py-0.5 text-[10px] font-bold tracking-widest border ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-crimson/20 text-crimson border-crimson'
                          : alt.severity === 'WARNING'
                          ? 'bg-amber-900/30 text-amber-400 border-amber-600'
                          : 'bg-emerald-900/30 text-emerald-400 border-emerald-600'
                      }`}>
                        {alt.severity}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-white mb-1 tracking-wide">{alt.alert_type}</div>
                    <p className="text-[11px] text-[#9FA8BF] leading-relaxed">{alt.description}</p>
                    {alt.showAction && (
                      <button
                        onClick={() => handleApprove("AI Recommendation Executed via Alerts")}
                        className="mt-4 w-full py-2.5 bg-crimson hover:bg-white text-black text-[10px] font-black tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(255,51,102,0.6)] animate-pulse"
                      >
                        EXECUTE AI SUGGESTION →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Telemetry Military HUD & Action Controls */}
          <div className="lg:col-span-1 flex flex-col gap-8">

            {/* SCENARIO ADVANCER */}
            <motion.button
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              onClick={handleNextScenario}
              className="w-full glass-panel hover:border-cyan text-white py-4 px-6 text-xs tracking-widest uppercase transition-all text-left flex justify-between items-center group shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
            >
              <span className="group-hover:text-cyan transition-colors font-bold flex items-center gap-2">
                <span>⚡</span> LOAD NEXT SCENARIO
              </span>
              <span className="text-lg leading-none group-hover:translate-x-1 transition-transform text-cyan">⏭</span>
            </motion.button>

            {/* 3. MILITARY HUD TELEMETRY SIDEBAR */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="glass-panel hud-corner p-6 space-y-5 border-cyan/30 shadow-[0_20px_45px_rgba(0,0,0,0.8),0_0_20px_rgba(0,240,255,0.1)]"
            >
              <div className="border-b border-cyan/20 pb-3 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan"></span>
                  AI BOTTLENECK PROTOCOL
                </h3>
                <span className="text-[9px] text-[#9FA8BF] px-1.5 py-0.5 border border-cyan/30 bg-cyan/10">HUD-V4</span>
              </div>

              {/* HUD Telemetry Spec Sheet */}
              <div className="grid grid-cols-2 gap-2 text-[10px] bg-void/60 p-3 border border-cyan/20">
                <div>
                  <span className="text-[#9FA8BF] block">SOLVER:</span>
                  <span className="text-cyan font-bold">OR-TOOLS CP-SAT</span>
                </div>
                <div>
                  <span className="text-[#9FA8BF] block">PHYSICS:</span>
                  <span className="text-white font-bold">MAGLEV LEVITATION</span>
                </div>
                <div className="mt-1">
                  <span className="text-[#9FA8BF] block">FRICTION COEFF:</span>
                  <span className="text-cyan font-bold">0.0012 (VAC-TUBE)</span>
                </div>
                <div className="mt-1">
                  <span className="text-[#9FA8BF] block">ELEVATION Z:</span>
                  <span className="text-white font-bold">LAYER SWITCH ON</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-[#9FA8BF] uppercase tracking-wider block mb-1.5">AI DISPATCH ADVISORY:</span>
                <p className="text-xs text-white leading-relaxed min-h-[44px] bg-[#050811] p-3 border border-[#1E2538]">
                  {scenarioData?.ai_recommendation || "System monitoring for network conflicts and automated junction clearance..."}
                </p>
              </div>

              <button
                onClick={() => handleApprove("Controller Overridden & Approved")}
                disabled={actionExpired || approved || !scenarioData || !hasCriticalAlert}
                className={`w-full py-4 font-black tracking-widest text-xs uppercase transition-all shadow-lg ${
                  approved
                    ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/60 cursor-default shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : !hasCriticalAlert
                    ? 'bg-[#0E131F] text-[#9FA8BF] border border-[#1E2538] cursor-default'
                    : 'bg-crimson text-black hover:bg-white shadow-[0_0_25px_rgba(255,51,102,0.8)] scale-100 hover:scale-102 animate-pulse'
                }`}
              >
                {approved ? '✓ REROUTE APPROVED' : hasCriticalAlert ? `⚡ APPROVE REROUTE (${countdown}s)` : 'SYSTEM NOMINAL'}
              </button>
            </motion.div>

            {/* CREATE CUSTOM ALERT HUD PANEL */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
              className="glass-panel p-6 border-[#1E2538]"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2 border-b border-[#1E2538] pb-3">
                <span className="w-2 h-2 bg-cyan"></span>
                DISPATCH OVERRIDE CONSOLE
              </h3>
              <form onSubmit={handleCustomAlertSubmit} className="space-y-4 text-xs tracking-wide text-white">
                <div>
                  <label className="block text-[10px] text-[#9FA8BF] uppercase tracking-widest mb-1.5">Train ID</label>
                  <input
                    type="text"
                    value={formData.train_id}
                    onChange={(e) => setFormData({ ...formData, train_id: e.target.value })}
                    required
                    className="w-full bg-[#050811] border border-cyan/20 focus:border-cyan p-2.5 outline-none text-white font-mono shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#9FA8BF] uppercase tracking-widest mb-1.5">Issue Type</label>
                    <select
                      value={formData.alert_type}
                      onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                      className="w-full bg-[#050811] border border-cyan/20 focus:border-cyan p-2.5 outline-none text-white font-mono"
                    >
                      <option value="SPEED_VIOLATION">SPEED_VIOLATION</option>
                      <option value="SIGNAL_DELAY">SIGNAL_DELAY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#9FA8BF] uppercase tracking-widest mb-1.5">Severity</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full bg-[#050811] border border-cyan/20 focus:border-cyan p-2.5 outline-none text-white font-mono"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="WARNING">WARNING</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#9FA8BF] uppercase tracking-widest mb-1.5">TRACK SECTOR</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector-7 Hyperloop Junction"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="w-full bg-[#050811] border border-cyan/20 focus:border-cyan p-2.5 outline-none text-white font-mono shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#9FA8BF] uppercase tracking-widest mb-1.5">AUDIT DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="w-full bg-[#050811] border border-cyan/20 focus:border-cyan p-2.5 outline-none text-white font-mono resize-none shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0E131F] hover:bg-cyan hover:text-black text-cyan border border-cyan/40 font-black py-3 text-xs tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]"
                >
                  + DISPATCH OVERRIDE
                </button>
                {statusMsg && (
                  <p className="text-[10px] text-cyan tracking-widest text-center mt-1 animate-pulse">{statusMsg}</p>
                )}
              </form>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ================= BOTTOM FIXED TELEMETRY DOCK (HUD DOCK) ================= */}
      <AnimatePresence>
        {selectedTrain && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 glass-panel hud-corner border-2 border-cyan p-4 px-6 md:px-8 shadow-[0_0_40px_rgba(0,240,255,0.35)] z-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-5">
              <div className="flex h-12 w-12 items-center justify-center bg-cyan/15 border border-cyan text-cyan font-bold text-xl shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                🚅
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-black text-white tracking-widest">{selectedTrain.id}</h4>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold border ${
                    selectedTrain.status === 'DELAYED'
                      ? 'bg-crimson/20 text-crimson border-crimson animate-pulse'
                      : 'bg-emerald-900/40 text-emerald-400 border-emerald-500'
                  }`}>
                    {selectedTrain.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#9FA8BF] tracking-widest mt-1">
                  TYPE: <span className="text-cyan font-bold">{selectedTrain.type}</span> | ROUTE: {selectedTrain.origin} → {selectedTrain.destination}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 md:gap-10 text-xs tracking-widest">
              <div>
                <span className="text-[#9FA8BF] block text-[9px]">SPEED</span>
                <span className="font-extrabold text-cyan text-sm">{selectedTrain.speed}</span>
              </div>
              <div>
                <span className="text-[#9FA8BF] block text-[9px]">PAYLOAD WEIGHT</span>
                <span className="font-extrabold text-white text-sm">{selectedTrain.weight}</span>
              </div>
              <button
                onClick={() => setSelectedTrain(null)}
                className="px-3.5 py-1.5 bg-[#0A0D14] hover:bg-cyan hover:text-black border border-cyan/30 text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                CLOSE ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}