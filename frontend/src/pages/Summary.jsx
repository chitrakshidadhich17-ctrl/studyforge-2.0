import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { getFiles, generateSummary } from '../api/client'

const summaryTypes = [
  {
    value: 'short',
    label: 'Short',
    description: '3-5 sentences, essential points only',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: '2-3 paragraphs, main ideas and key points',
  },
  {
    value: 'exam',
    label: 'Exam Focus',
    description: 'Key definitions, facts, and likely exam topics',
  },
]

function Summary() {
  const [files, setFiles] = useState([])
  const [selectedFileId, setSelectedFileId] = useState('')
  const [summaryType, setSummaryType] = useState('medium')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function loadFiles() {
      try {
        const data = await getFiles()
        setFiles(data.files)
      } catch (err) {
        console.error(err)
      }
    }
    loadFiles()
  }, [])

  async function handleGenerate() {
    if (!selectedFileId) {
      setError('Please select a file first')
      return
    }
    setError('')
    setGenerating(true)
    setResult(null)

    try {
      const data = await generateSummary(selectedFileId, summaryType)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result.summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white">AI Summary Generator</h1>
        <p className="text-slate-400 mt-1">
          Get concise, focused summaries of your study materials
        </p>

        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
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
          </div>

          <p className="text-slate-400 text-sm mb-3">Summary type:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {summaryTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSummaryType(type.value)}
                className={`text-left p-4 rounded-xl border transition-colors ${
                  summaryType === type.value
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <p className="font-medium text-sm">{type.label}</p>
                <p className="text-xs text-slate-500 mt-1">{type.description}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            {generating
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Sparkles className="w-4 h-4" />
            }
            {generating ? 'Generating...' : 'Generate Summary'}
          </button>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold">
                  {summaryTypes.find((t) => t.value === result.summary_type)?.label} Summary
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Source: {result.source_file}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg"
              >
                {copied
                  ? <><Check className="w-4 h-4 text-green-400" /> Copied!</>
                  : <><Copy className="w-4 h-4" /> Copy</>
                }
              </button>
            </div>

            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{result.summary}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

export default Summary