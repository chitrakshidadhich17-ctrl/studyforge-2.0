import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Sparkles, Trash2, FileText, Loader2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { getFiles, generateNotes, getNotes, deleteNote } from '../api/client'

function Notes() {
  const [files, setFiles] = useState([])
  const [notes, setNotes] = useState([])
  const [selectedFileId, setSelectedFileId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [activeNote, setActiveNote] = useState(null)

  useEffect(() => {
    loadFiles()
    loadNotes()
  }, [])

  async function loadFiles() {
    try {
      const data = await getFiles()
      setFiles(data.files)
    } catch (err) {
      console.error('Failed to load files:', err)
    }
  }

  async function loadNotes() {
    try {
      const data = await getNotes()
      setNotes(data.notes)
    } catch (err) {
      console.error('Failed to load notes:', err)
    }
  }

  async function handleGenerate() {
    if (!selectedFileId) {
      setError('Please select a file first')
      return
    }

    setError('')
    setGenerating(true)

    try {
      const data = await generateNotes(selectedFileId)
      setNotes([data.note, ...notes])
      setActiveNote(data.note)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete(noteId) {
    try {
      await deleteNote(noteId)
      setNotes(notes.filter((n) => n.id !== noteId))
      if (activeNote?.id === noteId) {
        setActiveNote(null)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white">AI Notes Generator</h1>
        <p className="text-slate-400 mt-1">Turn your study materials into structured notes</p>

        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-3 sm:items-center">
          <select
            value={selectedFileId}
            onChange={(e) => setSelectedFileId(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" className="bg-slate-900">Select a file...</option>
            {files.map((file) => (
              <option key={file.id} value={file.id} className="bg-slate-900">
                {file.original_filename}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generating ? 'Generating...' : 'Generate Notes'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-white mb-4">Saved Notes</h2>
            {notes.length === 0 ? (
              <p className="text-slate-500 text-sm">No notes yet. Generate your first one above.</p>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setActiveNote(note)}
                    className={`cursor-pointer bg-white/5 backdrop-blur-xl border rounded-xl p-4 flex items-start gap-3 transition-colors ${
                      activeNote?.id === note.id
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{note.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(note.id)
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-h-[300px]">
              {activeNote ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">
                  Select a note from the list, or generate a new one to see it here.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  )
}

export default Notes
