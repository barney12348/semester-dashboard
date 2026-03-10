import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/', icon: '⌂', label: '홈', num: '00' },
  { to: '/grades', icon: '◎', label: '학점 관리', num: '01' },
  { to: '/activities', icon: '◈', label: '대외활동', num: '02' },
  { to: '/certifications', icon: '◇', label: '자격증', num: '03' },
  { to: '/volunteer', icon: '♡', label: '봉사활동', num: '04' },
]

export default function Layout({ children, theme, toggleTheme }) {
  return (
    <div className='app-layout'>
      <aside className='sidebar'>
        <div className='sidebar-logo'>
          <h1>3학년 1학기<br /><span>마스터 가이드</span></h1>
          <p>울산대학교 · 산업경영공학부</p>
        </div>
        <nav className='sidebar-nav'>
          {NAV.map(({ to, icon, label, num }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className='nav-icon'>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className='sidebar-footer'>
          <button className='theme-btn' onClick={toggleTheme}>
            <span className='nav-icon'>{theme === 'light' ? '◑' : '◐'}</span>
            {theme === 'light' ? '다크 모드' : '라이트 모드'}
          </button>
        </div>
      </aside>
      <main className='main-content'>
        {children}
      </main>
    </div>
  )
}
