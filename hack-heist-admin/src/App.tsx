import React from 'react'
import './index.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gfg-gradient-start to-gfg-gradient-end text-white">
      <Navbar />
      <main className="pt-8">
        <Hero />
        <section className="max-w-6xl mx-auto px-4">
          <Features />
          <Testimonials />
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default App
