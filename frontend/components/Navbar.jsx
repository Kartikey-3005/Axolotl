'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'OVERVIEW' },
    { href: '/dashboard', label: 'MAIN NETWORK MAP' },
    { href: '/stations', label: 'STATIONS' },
    { href: '/alerts', label: 'ALERTS CONSOLE' },
  ];

  return (
    <header className="w-full bg-[#050505]/80 backdrop-blur-md border-b border-cyan/20 sticky top-0 z-50 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 bg-void border border-cyan flex items-center justify-center font-bold text-cyan text-xl rounded-none shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all group-hover:shadow-[0_0_25px_rgba(0,240,255,0.8)] group-hover:scale-105">
            <span className="relative z-10">A</span>
            <div className="absolute inset-0 bg-cyan/10"></div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-widest text-white group-hover:text-cyan transition-colors flex items-center gap-1.5">
              AXOLOTL <span className="text-[10px] text-cyan px-1.5 py-0.5 border border-cyan/40 bg-cyan/10 tracking-widest">MAGLEV</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 font-mono text-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 border transition-all rounded-none uppercase text-xs tracking-wider ${
                  isActive
                    ? 'bg-cyan/15 text-cyan font-bold border-cyan shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                    : 'bg-[#0A0D14]/80 text-[#9FA8BF] border-[#1E2538] hover:border-cyan/50 hover:text-white hover:bg-cyan/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* System Status Indicator */}
        <div className="hidden md:flex items-center gap-3 border border-cyan/30 bg-[#0A0D14]/90 px-3.5 py-1.5 rounded-none font-mono text-xs shadow-[0_0_15px_rgba(0,240,255,0.15)]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-none h-2.5 w-2.5 bg-cyan"></span>
          </span>
          <span className="text-cyan font-bold tracking-widest text-[11px]">TELEMETRY ONLINE</span>
        </div>
      </div>
    </header>
  );
}
