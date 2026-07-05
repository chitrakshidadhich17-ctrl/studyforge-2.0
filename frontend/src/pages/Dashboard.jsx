import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Flame, BookOpen, BrainCircuit, Layers, FileText, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { getStats } from '../api/client'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token')

      try {
        const userResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (!userResponse.ok) throw new Error('Session expired')

        const userData = await userResponse.json()
        setUser(userData.user)

        const statsData = await getStats()
        setStats(statsData)
      } catch (err) {
        localStorage.removeItem('token')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Notes Created',
      value: stats?.notes ?? 0,
      icon: BookOpen,
      color: 'text-blue-400',
      path: '/notes'
    },
    {
      label: 'Quizzes Taken',
      value: stats?.quizzes ?? 0,
      icon: BrainCircuit,
      color: 'text-indigo-400',
      path: '/quizzes'
    },
    {
      label: 'Flashcard Sets',
      value: stats?.flashcards ?? 0,
      icon: Layers,
      color: 'text-purple-400',
      path: '/flashcards'
    },
    {
      label: 'Files Uploaded',
      value: stats?.files ?? 0,
      icon: FileText,
      color: 'text-green-400',
      path: '/upload'
    },
  ]

  const quickActions = [
    { label: 'Generate Notes', icon: BookOpen, path: '/notes', color: 'bg-blue-500/20 text-blue-400' },
    { label: 'Take a Quiz', icon: BrainCircuit, path: '/quizzes', color: 'bg-indigo-500/20 text-indigo-400' },
    { label: 'Make Flashcards', icon: Layers, path: '/flashcards', color: 'bg-purple-500/20 text-purple-400' },
    { label: 'Get a Summary', icon: Sparkles, path: '/summary', color: 'bg-pink-500/20 text-pink-400' },
  ]

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span className="text-indigo-400">{user?.name}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's your study overview</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  to={stat.path}
                  className="block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                  <p className="text-3xl font-bold text-white mt-3">{stat.value}</p>
                  <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
                </Link>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  to={action.path}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-2 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-white text-sm font-medium text-center">{action.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default Dashboard