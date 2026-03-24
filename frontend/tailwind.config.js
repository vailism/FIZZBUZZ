/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
        body: ['Exo 2', 'sans-serif'],
      },
      colors: {
        threat: '#ff2d55',
        safe: '#00ff88',
        accent: '#00d4ff',
        panel: '#0a0e1a',
        surface: '#0f1629',
        border: '#1a2540',
        muted: '#3a4a6b',
      },
      animation: {
        'pulse-threat': 'pulse-threat 1.5s ease-in-out infinite',
        'pulse-safe': 'pulse-safe 2s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'glow-red': 'glow-red 1.5s ease-in-out infinite',
        'glow-green': 'glow-green 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-threat': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        'pulse-safe': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'glow-red': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,45,85,0.4), 0 0 40px rgba(255,45,85,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(255,45,85,0.8), 0 0 80px rgba(255,45,85,0.4)' },
        },
        'glow-green': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,255,136,0.3), 0 0 40px rgba(0,255,136,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(0,255,136,0.6), 0 0 80px rgba(0,255,136,0.3)' },
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
