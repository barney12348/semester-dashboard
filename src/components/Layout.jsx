import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/', icon: '⌂', label: '홈', num: '00' },
  { to: '/grades', icon: '◎', label: '학점', num: '01' },
  { to: '/activities', icon: '◈', label: '대외활동', num: '02' },
  { to: '/certifications', icon: '◇', label: '자격증', num: '03' },
  { to: '/volunteer', icon: '♡', label: '봉사', num: '04' },
]

const NAV_FULL_LABELS = ['홈', '학점 관리', '대외활동', '자격증', '봉사활동']

export default function Layout({ children, theme, toggleTheme }) {
  return (
    <div className='app-layout'>
      {/* 모바일 상단바 */}
      <div className='mobile-topbar'>
        <span className='mobile-topbar-title'>3학년 1학기 <span>마스터</span></span>
        <button className='theme-btn' style={{ width: 'auto', padding: '6px 10px' }} onClick={toggleTheme}>
          {theme === 'light' ? '◑' : '◐'}
        </button>
      </div>

      {/* 데스크톱 사이드바 */}
      <aside className='sidebar'>
        <div className='sidebar-logo'>
          <h1>3학년 1학기<br /><span>마스터 가이드</span></h1>
          <p>울산대학교 · 산업경영공학부</p>
        </div>
        <nav className='sidebar-nav'>
          {NAV.map(({ to, icon, num }, i) => (
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
    </div>
  )
}
