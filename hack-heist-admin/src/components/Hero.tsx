import React from 'react'

const Hero: React.FC = () => {
  return (
    <section className="relative py-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight animate-fade-up">
          Smart attendance for <span className="bg-gradient-to-r from-gfg-primary to-gfg-accent bg-clip-text text-transparent">events & campuses</span>
        </h1>
        <p className="text-white/80 mt-4 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Fast QR scanning, manual entry, and polished export workflows — built for organizers.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button className="px-5 py-2 rounded-md bg-gfg-primary text-white font-semibold shadow-md hover:scale-[1.03] transition-transform">Get Started</button>
          <button className="px-5 py-2 rounded-md bg-white/6 text-white hover:scale-[1.03] transition-transform">Docs</button>
        </div>
      </div>
    </section>
  )
}

export default Hero
