import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UploadCloud, FileText, BrainCircuit, Layers, Sparkles, User, LogOut } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Upload', icon: UploadCloud, path: '/upload' },
  { label: 'Notes', icon: FileText, path: '/notes' },
  { label: 'Summary', icon: Sparkles, path: '/summary' },
  { label: 'Quizzes', icon: BrainCircuit, path: '/quizzes' },
  { label: 'Flashcards', icon: Layers, path: '/flashcards' },
  { label: 'Profile', icon: User, path: '/profile' },
]

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col p-4">
      <div className="px-2 py-4">
        <span className="text-xl font-bold text-white">
          Study<span className="text-indigo-400">Forge</span>
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>
    </aside>
  )
}

export default Sidebar