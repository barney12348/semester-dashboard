import { useState, useEffect } from 'react'
import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Grades from './pages/Grades'
import Activities from './pages/Activities'
import Certifications from './pages/Certifications'
import Volunteer from './pages/Volunteer'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light')

  return (
    <BrowserRouter>
      <Layout theme={theme} toggleTheme={toggleTheme}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/grades' element={<Grades />} />
          <Route path='/activities' element={<Activities />} />
          <Route path='/certifications' element={<Certifications />} />
          <Route path='/volunteer' element={<Volunteer />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
