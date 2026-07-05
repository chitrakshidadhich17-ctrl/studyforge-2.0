import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, BookOpen, BrainCircuit, Layers, FileText } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { getStats } from '../api/client'

function Profile() {
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

  const profileStats = [
    { label: 'Notes Created', value: stats?.notes ?? 0, icon: BookOpen, color: 'text-blue-400' },
    { label: 'Quizzes Taken', value: stats?.quizzes ?? 0, icon: BrainCircuit, color: 'text-indigo-400' },
    { label: 'Flashcard Sets', value: stats?.flashcards ?? 0, icon: Layers, color: 'text-purple-400' },
    { label: 'Files Uploaded', value: stats?.files ?? 0, icon: FileText, color: 'text-green-400' },
  ]

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 mt-1">Your account information and study statistics</p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto">
                <User className="w-10 h-10 text-indigo-400" />
              </div>

              <h2 className="text-xl font-bold text-white text-center mt-4">
                {user?.name}
              </h2>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>
                    Joined {new Date(user?.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Study Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                {profileStats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={stat.label}
                      className="bg-white/5 rounded-xl p-4"
                    >
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                      <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mt-4">
              <h2 className="text-lg font-semibold text-white mb-4">Account Settings</h2>
              <p className="text-slate-500 text-sm">
                Account settings and password change coming soon.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default Profile