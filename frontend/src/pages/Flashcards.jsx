import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Layers, Loader2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { getFiles, generateFlashcards, getFlashcards, deleteFlashcard } from '../api/client'

function FlipCard({ card, onDelete }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="relative h-48 cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div
          className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-xs text-indigo-400 font-medium mb-3 uppercase tracking-wider">Question</p>
          <p className="text-white text-center font-medium">{card.question}</p>
          <p className="text-slate-500 text-xs mt-4">Click to reveal answer</p>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(card.id) }}
            className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div
          className="absolute inset-0 bg-indigo-500/10 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 flex flex-col items-center justify-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-xs text-indigo-400 font-medium mb-3 uppercase tracking-wider">Answer</p>
          <p className="text-white text-center text-sm">{card.answer}</p>
        </div>
      </div>
    </div>
  )
}

function Flashcards() {
  const [files, setFiles] = useState([])
  const [flashcards, setFlashcards] = useState([])
  const [selectedFileId, setSelectedFileId] = useState('')
  const [numCards, setNumCards] = useState(8)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [studyMode, setStudyMode] = useState(false)
  const [studyIndex, setStudyIndex] = useState(0)
  const [studyCards, setStudyCards] = useState([])

  useEffect(() => {
    loadFiles()
    loadFlashcards()
  }, [])

  async function loadFiles() {
    try {
      const data = await getFiles()
      setFiles(data.files)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadFlashcards() {
    try {
      const data = await getFlashcards()
      setFlashcards(data.flashcards)
    } catch (err) {
      console.error(err)
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
      const data = await generateFlashcards(selectedFileId, numCards)
      setFlashcards([...data.flashcards, ...flashcards])
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete(cardId) {
    try {
      await deleteFlashcard(cardId)
      setFlashcards(flashcards.filter((c) => c.id !== cardId))
    } catch (err) {
      setError(err.message)
    }
  }

  function startStudyMode() {
    setStudyCards(flashcards)
    setStudyIndex(0)
    setStudyMode(true)
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {studyMode ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">Study Mode</h1>
              <button
                onClick={() => setStudyMode(false)}
                className="text-slate-400 hover:text-white text-sm transition-colors"
              >
                Exit Study Mode
              </button>
            </div>

            <p className="text-slate-400 text-center mb-4">
              Card {studyIndex + 1} of {studyCards.length} — Click card to flip
            </p>

            <FlipCard
              card={studyCards[studyIndex]}
              onDelete={handleDelete}
            />

            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setStudyIndex(Math.max(0, studyIndex - 1))}
                disabled={studyIndex === 0}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-slate-400 text-sm">
                {studyIndex + 1} / {studyCards.length}
              </span>
              <button
                onClick={() => setStudyIndex(Math.min(studyCards.length - 1, studyIndex + 1))}
                disabled={studyIndex === studyCards.length - 1}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">AI Flashcards</h1>
                <p className="text-slate-400 mt-1">Generate and study flashcards from your materials</p>
              </div>
              {flashcards.length > 0 && (
                <button
                  onClick={startStudyMode}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
                >
                  Study Mode
                </button>
              )}
            </div>

            <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">Generate New Flashcards</h2>
              <div className="flex flex-col sm:flex-row gap-3">
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

                <select
                  value={numCards}
                  onChange={(e) => setNumCards(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={5} className="bg-slate-900">5 Cards</option>
                  <option value={8} className="bg-slate-900">8 Cards</option>
                  <option value={12} className="bg-slate-900">12 Cards</option>
                </select>

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                  {generating ? 'Generating...' : 'Generate Cards'}
                </button>
              </div>

              {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-white mb-4">
                Your Flashcards
                {flashcards.length > 0 && (
                  <span className="text-slate-500 text-sm font-normal ml-2">({flashcards.length} cards)</span>
                )}
              </h2>

              {flashcards.length === 0 ? (
                <p className="text-slate-500 text-sm">No flashcards yet. Generate your first set above.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flashcards.map((card) => (
                    <FlipCard key={card.id} card={card} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

export default Flashcards