import { motion } from 'framer-motion'
import { FileText, BrainCircuit, Layers, Sparkles } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'AI Notes Generator',
    description: 'Turn uploaded PDFs into structured notes with headings, key points, and core concepts.',
  },
  {
    icon: Sparkles,
    title: 'AI Summary Generator',
    description: 'Get short, medium, or exam-focused summaries of any study material in seconds.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Quiz Generator',
    description: 'Auto-generate multiple choice quizzes with difficulty levels and instant scoring.',
  },
  {
    icon: Layers,
    title: 'AI Flashcards',
    description: 'Create flippable flashcards from your content and save them to your personal library.',
  },
]

function Features() {
  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Everything You Need to <span className="text-indigo-400">Study Smarter</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Four powerful AI tools, working together to turn raw study material into real understanding.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="bg-indigo-500/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features