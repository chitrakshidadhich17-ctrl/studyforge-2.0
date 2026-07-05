import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-slate-950/60 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-white">
          Study<span className="text-indigo-400">Forge</span>
        </span>
        <div className="hidden md:flex items-center gap-8 text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        </div>
        <Link
          to="/signup"
          className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium px-5 py-2 rounded-lg transition-colors"
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}

export default Navbar