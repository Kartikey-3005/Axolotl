'use client';

import { useState } from 'react';

export default function LiveTrackingPage() {
  const [trainNumber, setTrainNumber] = useState('12015');
  const [date, setDate] = useState(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const fetchLiveTracking = async (e) => {
    if (e) e.preventDefault();
    if (!trainNumber.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/railway?action=track&trainNo=${encodeURIComponent(trainNumber.trim())}&date=${encodeURIComponent(date)}`);
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to retrieve live tracking data.');
        setResult(null);
      }
    } catch (err) {
      setError(err.message || 'Network error occurred');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#050505] min-h-screen text-slate-200 p-4 md:p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="border border-cyan/30 bg-[#0a0d14] p-6 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-cyan text-xs uppercase tracking-widest block font-bold">
                RAILKIT SDK LIVE TRACKING TELEMETRY
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wider mt-1">
                NATIONAL TRAIN TRACKER
              </h1>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-cyan/40 bg-cyan/10 text-cyan text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
              REAL-TIME SATELLITE & NTES FEED
            </div>
          </div>

          {/* Search Controls */}
          <form onSubmit={fetchLiveTracking} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">TRAIN NUMBER (5-DIGIT)</label>
              <input
                type="text"
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                placeholder="e.g. 12015, 12301"
                className="w-full bg-[#05070d] border border-cyan/30 focus:border-cyan px-3 py-2 text-white font-mono outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">START DATE (DD-MM-YYYY)</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="DD-MM-YYYY"
                className="w-full bg-[#05070d] border border-cyan/30 focus:border-cyan px-3 py-2 text-white font-mono outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan text-black font-extrabold py-2 px-4 uppercase tracking-wider hover:bg-cyan/90 transition-all disabled:opacity-50"
              >
                {loading ? 'CONNECTING NTES...' : 'TRACK TRAIN NOW'}
              </button>
            </div>
          </form>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 border border-rose-500/40 bg-rose-950/20 text-rose-400 text-sm">
            [ERROR] {error}
          </div>
        )}

        {/* Result view */}
        {result && (
          <div className="space-y-6">
            {/* Summary card */}
            <div className="border border-cyan/20 bg-[#0a0d14] p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-slate-400 block">TRAIN</span>
                <span className="text-lg font-bold text-white">{result.trainName}</span>
                <span className="text-xs text-cyan block">#{result.trainNo}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">LIVE STATUS NOTE</span>
                <span className="text-sm font-semibold text-emerald-400">{result.statusNote}</span>
                <span className="text-xs text-slate-500 block">Updated: {result.lastUpdate}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">TOTAL DISTANCE & STATIONS</span>
                <span className="text-lg font-bold text-white">{result.totalDistanceKm} km</span>
                <span className="text-xs text-slate-400 block">{result.totalStoppageStations} stops ({result.totalStations} waypoints)</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">CURRENT STATION</span>
                <span className="text-lg font-bold text-cyan">{result.currentStationCode || 'EN ROUTE / ORIGIN'}</span>
                {result.progress && (
                  <span className="text-xs text-slate-400 block">
                    Completed: {result.progress.percent}%
                  </span>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="border border-cyan/20 bg-[#0a0d14] p-6">
              <h2 className="text-sm uppercase tracking-widest text-cyan font-bold mb-4">
                STATION TIMELINE & DELAY SCHEDULE
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e2538] text-slate-400">
                      <th className="py-2 px-3">STATION</th>
                      <th className="py-2 px-3">PLATFORM</th>
                      <th className="py-2 px-3">DISTANCE</th>
                      <th className="py-2 px-3">STATUS</th>
                      <th className="py-2 px-3">ARRIVAL (SCHED / ACT)</th>
                      <th className="py-2 px-3">DEPARTURE (SCHED / ACT)</th>
                      <th className="py-2 px-3">DELAY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#151922]">
                    {result.timeline?.filter((item) => item.type === 'stoppage').map((stop, idx) => (
                      <tr key={idx} className="hover:bg-cyan/5 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-white block">{stop.stationName}</span>
                          <span className="text-[10px] text-cyan">{stop.stationCode}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {stop.platform ? `PF ${stop.platform}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {stop.distanceKm} km
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold border ${
                            stop.status === 'passed'
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                              : stop.status === 'current'
                              ? 'border-cyan bg-cyan/20 text-cyan animate-pulse'
                              : 'border-slate-700 bg-slate-800 text-slate-400'
                          }`}>
                            {stop.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {stop.arrival?.scheduled || '--'} / <span className="text-white">{stop.arrival?.actual || '--'}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {stop.departure?.scheduled || '--'} / <span className="text-white">{stop.departure?.actual || '--'}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          {stop.departure?.delay ? (
                            <span className="text-amber-400">+{stop.departure.delay}</span>
                          ) : (
                            <span className="text-emerald-400">ON TIME</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
