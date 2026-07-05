import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, FileText, Loader2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { uploadFile, getFiles } from '../api/client'

function Upload() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadFiles()
  }, [])

  async function loadFiles() {
    try {
      const data = await getFiles()
      setFiles(data.files)
    } catch (err) {
      console.error('Failed to load files:', err)
    }
  }

  async function handleFileSelect(e) {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setError('')
    setUploading(true)

    try {
      await uploadFile(selectedFile)
      await loadFiles()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white">Study Materials</h1>
        <p className="text-slate-400 mt-1">Upload PDFs to generate notes, quizzes, and flashcards</p>

        <div className="mt-8">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-white/20 hover:border-indigo-500/50 rounded-2xl py-12 flex flex-col items-center gap-3 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            ) : (
              <UploadCloud className="w-10 h-10 text-slate-400" />
            )}
            <p className="text-white font-medium">
              {uploading ? 'Uploading...' : 'Click to upload a PDF'}
            </p>
            <p className="text-slate-500 text-sm">PDF files only</p>
          </button>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-4">Your Files</h2>

          {files.length === 0 ? (
            <p className="text-slate-500 text-sm">No files uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="bg-indigo-500/20 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {file.original_filename}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {formatFileSize(file.file_size)} · Uploaded{' '}
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default Upload