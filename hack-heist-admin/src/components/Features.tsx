import React from 'react'

const FeatureCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="p-6 bg-white/5 rounded-xl shadow-soft-lg transform transition-transform hover:scale-[1.03]">
    <h3 className="text-white font-semibold mb-2">{title}</h3>
    <p className="text-white/80 text-sm">{desc}</p>
  </div>
)

const Features: React.FC = () => {
  return (
    <section id="features" className="py-12">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard title="Instant QR Scanning" desc="Fast scanning with camera or uploaded images." />
        <FeatureCard title="Manual Entry" desc="Quick add or edit attendance entries." />
        <FeatureCard title="CSV Export" desc="Download attendance with one click." />
      </div>
    </section>
  )
}

export default Features
