import React from 'react'

const NavLink: React.FC<{ href?: string; children: React.ReactNode }> = ({ href = '#', children }) => (
  <a href={href} className="text-white/90 hover:text-white transition px-3 py-2 rounded-md">
    {children}
  </a>
)

const Navbar: React.FC = () => {
  return (
    <nav className="w-full py-4">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 animate-fade-up">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gfg-primary to-gfg-accent shadow-md flex items-center justify-center text-white font-bold">AC</div>
          <div className="text-white font-semibold">acmkare</div>
        </div>

        <div className="hidden md:flex items-center"> 
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#testimonials">Highlights</NavLink>
          <NavLink href="#contact">Contact</NavLink>
          <a className="ml-4 bg-white/6 text-white px-3 py-2 rounded-md hover:brightness-105">Sign in</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
