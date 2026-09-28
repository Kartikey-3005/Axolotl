import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] border-t border-cyan/20 py-8 px-4 font-mono rounded-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-3.5 h-3.5 bg-cyan shadow-[0_0_8px_#00F0FF]"></div>
            <span className="font-bold text-white text-base tracking-widest">AXOLOTL MAGLEV</span>
          </div>
          <p className="text-[#9FA8BF] text-xs leading-relaxed">
            High-performance real-time railway conflict prediction & dispatch engine. Exclusively for authorized transit operations officials.
          </p>
        </div>

        <div>
          <h4 className="text-cyan font-bold text-xs tracking-widest uppercase mb-3 border-b border-[#1E2538] pb-1">
            INTERNAL ADMIN
          </h4>
          <ul className="space-y-1.5 text-xs text-[#9FA8BF]">
            <li><Link href="/dashboard" className="hover:text-cyan transition-colors">Main Network Map</Link></li>
            <li><Link href="/stations" className="hover:text-cyan transition-colors">Station Manifests & Gantt</Link></li>
            <li><Link href="/alerts" className="hover:text-cyan transition-colors">Manual Alerts & Issue Console</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-cyan font-bold text-xs tracking-widest uppercase mb-3 border-b border-[#1E2538] pb-1">
            SYSTEM VERSIONING
          </h4>
          <ul className="space-y-1 text-xs text-[#9FA8BF]">
            <li>CORE_BUILD: <span className="text-white">v3.0.0-ANTIGRAVITY</span></li>
            <li>FASTAPI_WS: <span className="text-cyan">ONLINE (PORT 8000)</span></li>
            <li>AI_OPTIMIZER: <span className="text-cyan">OR-TOOLS CP-SAT</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-cyan font-bold text-xs tracking-widest uppercase mb-3 border-b border-[#1E2538] pb-1">
            DISPATCH SUPPORT
          </h4>
          <p className="text-xs text-[#9FA8BF]">EMERGENCY HOTLINE: <span className="text-white font-bold">+91 1800 0081</span></p>
          <p className="text-xs text-[#9FA8BF] mt-1">SECURE NETWORK: <span className="text-crimson font-bold">MAGLEV-GRID-SEC-7</span></p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[#1E2538] mt-8 pt-4 flex flex-col md:flex-row justify-between items-center text-[11px] text-[#9FA8BF]">
        <span>© 2026 AXOLOTL DISPATCH SYSTEMS. STRICTLY CONFIDENTIAL.</span>
      </div>
    </footer>
  );
}
