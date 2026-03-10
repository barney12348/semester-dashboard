export const GRADE_POINTS = {
  'A+': 4.5, 'A': 4.0, 'A0': 4.0,
  'B+': 3.5, 'B': 3.0, 'B0': 3.0,
  'C+': 2.5, 'C': 2.0, 'C0': 2.0,
  'D+': 1.5, 'D': 1.0, 'D0': 1.0,
  'F': 0.0,
}

export const gradeToPoint = grade => GRADE_POINTS[grade] ?? null

export const calcGPA = subjects => {
  const eligible = subjects.filter(s => s.grade && gradeToPoint(s.grade) !== null)
  if (!eligible.length) return null
  const totalPoints = eligible.reduce((acc, s) => acc + gradeToPoint(s.grade) * Number(s.credits), 0)
  const totalCredits = eligible.reduce((acc, s) => acc + Number(s.credits), 0)
  return totalCredits ? (totalPoints / totalCredits).toFixed(2) : null
}

export const daysUntil = dateStr => {
  if (!dateStr) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

export const formatDate = dateStr => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

export const readStorage = key => {
  try {
    return JSON.parse(localStorage.getItem(key)) || []
  } catch {
    return []
  }
}
