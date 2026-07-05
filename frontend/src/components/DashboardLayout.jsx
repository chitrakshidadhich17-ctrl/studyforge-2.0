import Sidebar from './Sidebar'

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}

export default DashboardLayout