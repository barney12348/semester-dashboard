import { useRef } from 'react'
import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/', icon: '⌂', label: '홈' },
  { to: '/grades', icon: '◎', label: '학점' },
  { to: '/activities', icon: '◈', label: '대외활동' },
  { to: '/certifications', icon: '◇', label: '자격증' },
  { to: '/volunteer', icon: '♡', label: '봉사' },
]

const NAV_FULL_LABELS = ['홈', '학점 관리', '대외활동', '자격증', '봉사활동']

const STORAGE_KEYS = ['grades-subjects', 'activities-list', 'certifications-list', 'volunteer-list']

const exportData = () => {
  const data = {}
  STORAGE_KEYS.forEach(key => {
    const val = localStorage.getItem(key)
    if (val) data[key] = JSON.parse(val)
  })
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `semester-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const importData = (file, onDone) => {
  const reader = new FileReader()
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result)
      STORAGE_KEYS.forEach(key => {
        if (data[key] !== undefined) {
          localStorage.setItem(key, JSON.stringify(data[key]))
        }
      })
      onDone()
    } catch {
      alert('파일을 읽을 수 없어요. 올바른 백업 파일인지 확인해주세요.')
    }
  }
  reader.readAsText(file)
}

export default function Layout({ children, theme, toggleTheme }) {
  const fileInputRef = useRef(null)

  const handleImport = e => {
    const file = e.target.files[0]
    if (!file) return
    if (!window.confirm('현재 데이터가 백업 파일로 덮어씌워집니다. 계속할까요?')) return
    importData(file, () => {
      alert('가져오기 완료! 페이지를 새로고침합니다.')
      window.location.reload()
    })
    e.target.value = ''
  }

  return (
    <div className='app-layout'>
      {/* 모바일 상단바 */}
      <div className='mobile-topbar'>
        <span className='mobile-topbar-title'>3학년 1학기 <span>마스터</span></span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className='theme-btn' style={{ width: 'auto', padding: '6px 10px' }} onClick={exportData} title='내보내기'>↑</button>
          <button className='theme-btn' style={{ width: 'auto', padding: '6px 10px' }} onClick={() => fileInputRef.current?.click()} title='가져오기'>↓</button>
          <button className='theme-btn' style={{ width: 'auto', padding: '6px 10px' }} onClick={toggleTheme}>
            {theme === 'light' ? '◑' : '◐'}
          </button>
        </div>
      </div>

      {/* 데스크톱 사이드바 */}
      <aside className='sidebar'>
        <div className='sidebar-logo'>
          <h1>3학년 1학기<br /><span>마스터 가이드</span></h1>
          <p>울산대학교 · 산업경영공학부</p>
        </div>
        <nav className='sidebar-nav'>
          {NAV.map(({ to, icon }, i) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className='nav-icon'>{icon}</span>
              {NAV_FULL_LABELS[i]}
            </NavLink>
          ))}
        </nav>
        <div className='sidebar-footer'>
          <button className='theme-btn' onClick={exportData}>
            <span className='nav-icon'>↑</span>
            내보내기
          </button>
          <button className='theme-btn' onClick={() => fileInputRef.current?.click()}>
            <span className='nav-icon'>↓</span>
            가져오기
          </button>
          <button className='theme-btn' onClick={toggleTheme}>
            <span className='nav-icon'>{theme === 'light' ? '◑' : '◐'}</span>
            {theme === 'light' ? '다크 모드' : '라이트 모드'}
          </button>
        </div>
      </aside>

      <main className='main-content'>
        {children}
      </main>

      {/* 모바일 하단 탭바 */}
      <nav className='mobile-nav'>
        <div className='mobile-nav-inner'>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
            >
              <span className='nav-icon'>{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <input ref={fileInputRef} type='file' accept='.json' style={{ display: 'none' }} onChange={handleImport} />
    </div>
  )
}
