const API_URL = import.meta.env.VITE_API_URL

export async function checkHealth() {
  const response = await fetch(`${API_URL}/api/health`)
  const data = await response.json()
  return data
}

export async function signup(name, email, password) {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Signup failed')
  }

  return data
}
export async function login(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Login failed')
  }

  return data
}

export async function uploadFile(file) {
  const token = localStorage.getItem('token')
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/api/files/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Upload failed')
  }

  return data
}

export async function getFiles() {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/files`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch files')
  }

  return data
}

export async function generateNotes(fileId) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/ai/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ file_id: fileId }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate notes')
  }

  return data
}

export async function getNotes() {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/notes`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch notes')
  }

  return data
}

export async function deleteNote(noteId) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete note')
  }

  return data
}

export async function generateQuiz(fileId, difficulty, numQuestions) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/ai/quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      file_id: fileId,
      difficulty: difficulty,
      num_questions: numQuestions,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate quiz')
  }

  return data
}

export async function getQuizzes() {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/quizzes`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch quizzes')
  }

  return data
}

export async function submitQuiz(quizId, answers) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ answers }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to submit quiz')
  }

  return data
}

export async function generateFlashcards(fileId, numCards) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/ai/flashcards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ file_id: fileId, num_cards: numCards }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate flashcards')
  }

  return data
}

export async function getFlashcards() {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/flashcards`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch flashcards')
  }

  return data
}

export async function deleteFlashcard(cardId) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/flashcards/${cardId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete flashcard')
  }

  return data
}

export async function generateSummary(fileId, summaryType) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/ai/summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ file_id: fileId, summary_type: summaryType }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate summary')
  }

  return data
}

export async function getStats() {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/api/auth/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch stats')
  }

  return data
}
