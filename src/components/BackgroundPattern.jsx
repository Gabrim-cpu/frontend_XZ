import React from 'react';

export default function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-burgundy/5 via-transparent to-blue-500/5" />

      {/* Left side - wavy line pattern */}
      <svg
        className="absolute left-0 top-0 w-32 h-full opacity-20 pointer-events-none"
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="wavy-left" patternUnits="userSpaceOnUse" width="40" height="100">
            <path
              d="M 10 0 Q 20 10 30 0 T 50 0 M 10 20 Q 20 30 30 20 T 50 20 M 10 40 Q 20 50 30 40 T 50 40 M 10 60 Q 20 70 30 60 T 50 60 M 10 80 Q 20 90 30 80 T 50 80"
              stroke="#740A03"
              strokeWidth="1"
              fill="none"
              opacity="0.15"
            />
          </pattern>
        </defs>
        <rect width="100" height="1000" fill="url(#wavy-left)" />
      </svg>

      {/* Right side - geometric diamond pattern */}
      <svg
        className="absolute right-0 top-0 w-40 h-full opacity-20 pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="diamond-right" patternUnits="userSpaceOnUse" width="50" height="50">
            <polygon points="25,0 50,25 25,50 0,25" stroke="#740A03" strokeWidth="0.8" fill="none" opacity="0.1" />
            <polygon points="25,10 40,25 25,40 10,25" stroke="#740A03" strokeWidth="0.8" fill="none" opacity="0.15" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#diamond-right)" />
      </svg>

      {/* Organic blob shapes */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-brand-burgundy/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 left-10 w-96 h-96 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000" />

      {/* Subtle center grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-3 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Floating geometric elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-brand-burgundy/30 rounded-full animate-float" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-400/30 rounded-full animate-float animation-delay-1000" />
      <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-purple-400/30 rounded-full animate-float animation-delay-2000" />
      <div className="absolute top-2/3 right-1/3 w-2.5 h-2.5 bg-brand-burgundy/20 rounded-full animate-float animation-delay-3000" />

      {/* Top & bottom fade for depth */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(15px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
