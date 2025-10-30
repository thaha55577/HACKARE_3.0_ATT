import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="py-8 mt-12">
      <div className="max-w-6xl mx-auto px-4 text-white/70 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>© {new Date().getFullYear()} ACM KARE — All rights reserved.</div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
