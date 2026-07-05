import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BrainCircuit, Loader2, CheckCircle, XCircle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { getFiles, generateQuiz, submitQuiz, getQuizzes } from '../api/client'

function Quizzes() {
  const [files, setFiles] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [selectedFileId, setSelectedFileId] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [numQuestions, setNumQuestions] = useState(5)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const [activeQuiz, setActiveQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [quizResult, setQuizResult] = useState(null)

  useEffect(() => {
    loadFiles()
    loadQuizzes()
  }, [])

  async function loadFiles() {
    try {
      const data = await getFiles()
      setFiles(data.files)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadQuizzes() {
    try {
      const data = await getQuizzes()
      setQuizzes(data.quizzes)
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
      const data = await generateQuiz(selectedFileId, difficulty, numQuestions)
      setActiveQuiz(data.quiz)
      setCurrentQuestion(0)
      setAnswers([])
      setSelectedOption(null)
      setQuizResult(null)
      setQuizzes([data.quiz, ...quizzes])
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  function handleOptionSelect(index) {
    setSelectedOption(index)
  }

  function handleNext() {
    const newAnswers = [...answers, selectedOption]

    if (currentQuestion + 1 < activeQuiz.questions.length) {
      setAnswers(newAnswers)
      setCurrentQuestion(currentQuestion + 1)
      setSelectedOption(null)
    } else {
      handleSubmit(newAnswers)
    }
  }

  async function handleSubmit(finalAnswers) {
    try {
      const data = await submitQuiz(activeQuiz.id, finalAnswers)
      setQuizResult(data.result)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleRetake(quiz) {
    setActiveQuiz(quiz)
    setCurrentQuestion(0)
    setAnswers([])
    setSelectedOption(null)
    setQuizResult(null)
  }

  const difficultyColors = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400'
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white">AI Quiz Generator</h1>
        <p className="text-slate-400 mt-1">Test your knowledge with AI-generated quizzes</p>

        {!activeQuiz && (
          <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Generate a New Quiz</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={selectedFileId}
                onChange={(e) => setSelectedFileId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" className="bg-slate-900">Select a file...</option>
                {files.map((file) => (
                  <option key={file.id} value={file.id} className="bg-slate-900">
                    {file.original_filename}
                  </option>
                ))}
              </select>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy" className="bg-slate-900">Easy</option>
                <option value="medium" className="bg-slate-900">Medium</option>
                <option value="hard" className="bg-slate-900">Hard</option>
              </select>

              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={3} className="bg-slate-900">3 Questions</option>
                <option value={5} className="bg-slate-900">5 Questions</option>
                <option value={10} className="bg-slate-900">10 Questions</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-4 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              {generating ? 'Generating...' : 'Generate Quiz'}
            </button>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
          </div>
        )}

        {activeQuiz && !quizResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-400 text-sm">
                Question {currentQuestion + 1} of {activeQuiz.questions.length}
              </span>
              <span className={`text-sm font-medium capitalize ${difficultyColors[activeQuiz.difficulty]}`}>
                {activeQuiz.difficulty}
              </span>
            </div>

            <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / activeQuiz.questions.length) * 100}%` }}
              />
            </div>

            <h3 className="text-xl font-semibold text-white mb-6">
              {activeQuiz.questions[currentQuestion].question}
            </h3>

            <div className="space-y-3">
              {activeQuiz.questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full text-left px-5 py-3 rounded-xl border transition-colors ${
                    selectedOption === index
                      ? 'bg-indigo-500/20 border-indigo-500 text-white'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="font-medium text-indigo-400 mr-3">
                    {['A', 'B', 'C', 'D'][index]}.
                  </span>
                  {option}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="mt-6 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              {currentQuestion + 1 === activeQuiz.questions.length ? 'Submit Quiz' : 'Next Question'}
            </button>
          </motion.div>
        )}

        {quizResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center"
          >
            <div className="text-6xl font-bold text-white mb-2">
              {quizResult.score}/{quizResult.total_questions}
            </div>
            <p className="text-slate-400 mb-2">
              {Math.round((quizResult.score / quizResult.total_questions) * 100)}% correct
            </p>
            <p className="text-lg font-medium text-indigo-400 mb-6">
              {quizResult.score === quizResult.total_questions
                ? '🎉 Perfect Score!'
                : quizResult.score >= quizResult.total_questions / 2
                ? '👍 Good Job!'
                : '📚 Keep Studying!'}
            </p>

            <div className="space-y-3 text-left mb-6">
              {activeQuiz.questions.map((q, index) => {
                const userAnswer = answers[index] ?? (answers.length === quizResult.total_questions ? answers[index] : null)
                const isCorrect = userAnswer === q.correct_answer
                return (
                  <div key={index} className={`flex items-start gap-3 p-3 rounded-xl border ${
                    isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    {isCorrect
                      ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    }
                    <div>
                      <p className="text-white text-sm font-medium">{q.question}</p>
                      <p className="text-slate-400 text-xs mt-1">
                        Correct: {q.options[q.correct_answer]}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleRetake(activeQuiz)}
                className="bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => { setActiveQuiz(null); setQuizResult(null) }}
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                New Quiz
              </button>
            </div>
          </motion.div>
        )}

        {!activeQuiz && quizzes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">Previous Quizzes</h2>
            <div className="space-y-2">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{quiz.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {quiz.questions.length} questions ·{' '}
                      <span className={`capitalize ${difficultyColors[quiz.difficulty]}`}>
                        {quiz.difficulty}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleRetake(quiz)}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                  >
                    Take Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  )
}

export default Quizzes