import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-24 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold text-white leading-tight"
        >
          Study Smarter with <span className="text-indigo-400">AI-Powered</span> Tools
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto"
        >
          Upload your notes, and let AI generate summaries, quizzes, and flashcards instantly. Study less, retain more.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Link
            to="/signup"
            className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Log In
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero