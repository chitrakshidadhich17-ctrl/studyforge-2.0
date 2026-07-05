import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function CTA() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-500/20 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Ready to Study Smarter?
        </h2>
        <p className="mt-4 text-slate-300 max-w-lg mx-auto">
          Join thousands of students using AI to learn faster and retain more. It's free to get started.
        </p>
        <Link
          to="/signup"
          className="mt-8 inline-block bg-indigo-500 hover:bg-indigo-400 text-white font-medium px-8 py-3 rounded-lg transition-colors"
        >
          Create Your Free Account
        </Link>
      </motion.div>
    </section>
  )
}

export default CTA