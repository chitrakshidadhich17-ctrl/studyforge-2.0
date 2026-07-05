import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Ananya Sharma',
    role: 'Computer Science Student',
    quote: 'StudyForge turned my messy lecture PDFs into clean notes and quizzes in minutes. My exam prep time literally got cut in half.',
  },
  {
    name: 'Rohan Mehta',
    role: 'Medical Student',
    quote: 'The flashcard generator is incredible for memorizing terminology. I review my deck every morning before class now.',
  },
  {
    name: 'Priya Nair',
    role: 'MBA Candidate',
    quote: 'The exam-focused summaries help me cut through dense case studies fast. It feels like having a study partner that never gets tired.',
  },
]

function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Loved by <span className="text-indigo-400">Students Everywhere</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Real feedback from students using StudyForge to study smarter.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-indigo-400 text-indigo-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div>
                <p className="text-white font-medium text-sm">{t.name}</p>
                <p className="text-slate-500 text-xs">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials