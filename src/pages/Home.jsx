import { useMemo } from 'react'
import { calcGPA, daysUntil, formatDate, readStorage } from '../utils'

const typeTag = type => {
  if (type === '과제') return 'red'
  if (type === '시험') return 'dark'
  if (type === '자격증') return 'blue'
  return 'gold'
}

export default function Home() {
  const subjects = readStorage('grades-subjects')
  const activities = readStorage('activities-list')
  const certs = readStorage('certs-list')
  const volunteers = readStorage('volunteer-list')

  const gpa = useMemo(() => calcGPA(subjects), [subjects])
  const totalCredits = useMemo(
    () => subjects.filter(s => s.grade).reduce((acc, s) => acc + Number(s.credits), 0),
    [subjects]
  )
  const ongoingActivities = activities.filter(a => a.status === '진행중').length
  const totalVolunteerHours = volunteers
    .filter(v => v.status === '완료')
    .reduce((acc, v) => acc + Number(v.hours || 0), 0)

  const nearestCert = useMemo(() => {
    const exams = []
    certs.forEach(c => {
      if (c.writtenDate) exams.push({ name: `${c.name} 필기`, date: c.writtenDate })
      if (c.practicalDate) exams.push({ name: `${c.name} 실기`, date: c.practicalDate })
    })
    return exams.filter(e => daysUntil(e.date) >= 0)
      .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))[0] || null
  }, [certs])

  const upcoming = useMemo(() => {
    const items = []
    subjects.forEach(s => {
      s.assignments?.forEach(a => {
        if (!a.submitted && a.deadline) {
          const days = daysUntil(a.deadline)
          if (days !== null) items.push({ type: '과제', name: `[${s.name}] ${a.name}`, date: a.deadline, days })
        }
      })
      if (s.midtermDate) {
        const days = daysUntil(s.midtermDate)
        if (days !== null && days >= 0)
          items.push({ type: '시험', name: `[${s.name}] 중간고사`, date: s.midtermDate, days })
      }
      if (s.finalDate) {
        const days = daysUntil(s.finalDate)
        if (days !== null && days >= 0)
          items.push({ type: '시험', name: `[${s.name}] 기말고사`, date: s.finalDate, days })
      }
    })
    certs.forEach(c => {
      if (c.writtenDate) {
        const days = daysUntil(c.writtenDate)
        if (days !== null && days >= 0)
          items.push({ type: '자격증', name: `[${c.name}] 필기시험`, date: c.writtenDate, days })
      }
      if (c.practicalDate) {
        const days = daysUntil(c.practicalDate)
        if (days !== null && days >= 0)
          items.push({ type: '자격증', name: `[${c.name}] 실기시험`, date: c.practicalDate, days })
      }
    })
    return items.sort((a, b) => a.days - b.days).slice(0, 8)
  }, [subjects, certs])

  const incomplete = useMemo(() => {
    const items = []
    subjects.forEach(s => {
      s.assignments?.forEach(a => {
        if (!a.submitted)
          items.push({ type: '미제출', name: `[${s.name}] ${a.name}`, deadline: a.deadline })
      })
      s.checklist?.forEach(c => {
        if (!c.checked)
          items.push({ type: '체크리스트', name: `[${s.name}] ${c.text}${c.week ? ` (${c.week}주차)` : ''}` })
      })
    })
    return items.slice(0, 10)
  }, [subjects])

  return (
    <div>
      <div className='page-header'>
        <div className='page-header-tag'>Overview</div>
        <div className='page-header-row'>
          <h2>학기 현황</h2>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--muted)' }}>
            2026 SPRING
          </span>
        </div>
        <p>전체 도메인 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats row */}
      <div className='stats-row'>
        <div className='stat-card'>
          <div className='stat-label'>평균 학점</div>
          <div className='stat-value'>{gpa ?? '-'}</div>
          <div className='stat-sub'>{totalCredits > 0 ? `${totalCredits}학점 이수` : '미입력'}</div>
        </div>
        <div className='stat-card'>
          <div className='stat-label'>진행중 대외활동</div>
          <div className='stat-value'>{ongoingActivities}</div>
          <div className='stat-sub'>총 {activities.length}개</div>
        </div>
        <div className='stat-card'>
          <div className='stat-label'>자격증 D-Day</div>
          <div className='stat-value' style={{ fontSize: nearestCert ? '1.4rem' : '2rem' }}>
            {nearestCert ? `D-${daysUntil(nearestCert.date)}` : '-'}
          </div>
          <div className='stat-sub'>{nearestCert?.name || '일정 없음'}</div>
        </div>
        <div className='stat-card'>
          <div className='stat-label'>봉사 시간</div>
          <div className='stat-value'>
            {totalVolunteerHours}
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '1rem', fontWeight: 700 }}>h</span>
          </div>
          <div className='stat-sub'>{volunteers.filter(v => v.status === '완료').length}회 완료</div>
        </div>
      </div>

      <div className='grid-2' style={{ gap: '1rem' }}>
        {/* Upcoming */}
        <div className='timeline'>
          <div className='timeline-header'>
            <span>⏰ 임박한 일정</span>
            <span>{upcoming.length}건</span>
          </div>
          {upcoming.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted)' }}>등록된 일정 없음</p>
            </div>
          ) : (
            upcoming.map((item, i) => (
              <div className='timeline-row' key={i}>
                <div className='timeline-week'>
                  {item.days === 0 ? 'D-Day' : item.days < 0 ? `+${Math.abs(item.days)}` : `D-${item.days}`}
                </div>
                <div className='timeline-items'>
                  <span className={`titem ${typeTag(item.type)}`}>{item.type}</span>
                  <span style={{ fontSize: 12 }}>{item.name}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>
                    {formatDate(item.date)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Incomplete */}
        <div className='timeline'>
          <div className='timeline-header'>
            <span>⚠ 미완료 항목</span>
            <span>{incomplete.length}건</span>
          </div>
          {incomplete.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted)' }}>미완료 항목 없음 ✓</p>
            </div>
          ) : (
            incomplete.map((item, i) => (
              <div className='timeline-row' key={i}>
                <div className='timeline-week' style={{ fontSize: 9, lineHeight: 1.3 }}>{item.type}</div>
                <div className='timeline-items'>
                  <span style={{ fontSize: 12 }}>{item.name}</span>
                  {item.deadline && (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>
                      {formatDate(item.deadline)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
