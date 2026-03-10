import { useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import Modal from '../components/Modal'
import { genId, formatDate, daysUntil } from '../utils'

const GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F']
const WEEKS = Array.from({ length: 16 }, (_, i) => i + 1)

const emptySubject = () => ({
  id: genId(),
  name: '',
  credits: 3,
  professor: '',
  classTime: '',
  targetGrade: 'B+',
  midtermDate: '',
  finalDate: '',
  midterm: '',
  final: '',
  grade: '',
  assignments: [],
  checklist: [],
  attendance: [],
})

const gradeBadgeClass = grade => {
  if (!grade) return 'badge-gray'
  if (grade.startsWith('A')) return 'badge-green'
  if (grade.startsWith('B')) return 'badge-blue'
  if (grade.startsWith('C')) return 'badge-yellow'
  if (grade.startsWith('D')) return 'badge-orange'
  return 'badge-red'
}

// 에디토리얼 스타일 커스텀 체크박스
function CheckItem({ checked, label, sublabel, onToggle }) {
  return (
    <div
      className={`checkbox-item${checked ? ' checked' : ''}`}
      onClick={onToggle}
      style={{ cursor: 'pointer' }}
    >
      <div className='check-box' />
      <div>
        <label style={{ cursor: 'pointer', display: 'block' }}>{label}</label>
        {sublabel && <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>{sublabel}</span>}
      </div>
    </div>
  )
}

export default function Grades() {
  const [subjects, setSubjects] = useLocalStorage('grades-subjects', [])
  const [expanded, setExpanded] = useState(null)
  const [activeTab, setActiveTab] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptySubject())
  const [aForm, setAForm] = useState({})
  const [showAForm, setShowAForm] = useState({})
  const [clForm, setClForm] = useState({})
  const [showClForm, setShowClForm] = useState({})

  const openAdd = () => { setEditId(null); setForm(emptySubject()); setShowModal(true) }
  const openEdit = s => { setEditId(s.id); setForm({ ...s }); setShowModal(true) }

  const save = () => {
    if (!form.name.trim()) return
    if (editId) {
      setSubjects(prev => prev.map(s => s.id === editId ? { ...form } : s))
    } else {
      setSubjects(prev => [...prev, { ...form, id: genId() }])
    }
    setShowModal(false)
  }

  const deleteSubject = id => {
    if (!window.confirm('과목을 삭제할까요?')) return
    setSubjects(prev => prev.filter(s => s.id !== id))
    if (expanded === id) setExpanded(null)
  }

  const getTab = id => activeTab[id] || '성적'
  const setTab = (id, tab) => setActiveTab(prev => ({ ...prev, [id]: tab }))
  const updateSubject = (id, patch) => setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))

  const addAssignment = subjectId => {
    const f = aForm[subjectId]
    if (!f?.name?.trim()) return
    setSubjects(prev => prev.map(s => s.id === subjectId ? {
      ...s,
      assignments: [...s.assignments, { id: genId(), name: f.name, deadline: f.deadline || '', submitted: false }],
    } : s))
    setAForm(prev => ({ ...prev, [subjectId]: { name: '', deadline: '' } }))
    setShowAForm(prev => ({ ...prev, [subjectId]: false }))
  }

  const toggleAssignment = (subjectId, assignId) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? {
      ...s,
      assignments: s.assignments.map(a => a.id === assignId ? { ...a, submitted: !a.submitted } : a),
    } : s))
  }

  const deleteAssignment = (subjectId, assignId) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? {
      ...s,
      assignments: s.assignments.filter(a => a.id !== assignId),
    } : s))
  }

  const addChecklistItem = subjectId => {
    const f = clForm[subjectId]
    if (!f?.text?.trim()) return
    setSubjects(prev => prev.map(s => s.id === subjectId ? {
      ...s,
      checklist: [...s.checklist, { id: genId(), week: f.week || '', text: f.text, checked: false }],
    } : s))
    setClForm(prev => ({ ...prev, [subjectId]: { week: '', text: '' } }))
    setShowClForm(prev => ({ ...prev, [subjectId]: false }))
  }

  const toggleChecklist = (subjectId, itemId) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? {
      ...s,
      checklist: s.checklist.map(c => c.id === itemId ? { ...c, checked: !c.checked } : c),
    } : s))
  }

  const deleteChecklistItem = (subjectId, itemId) => {
    setSubjects(prev => prev.map(s => s.id === subjectId ? {
      ...s,
      checklist: s.checklist.filter(c => c.id !== itemId),
    } : s))
  }

  const toggleAttendance = (subjectId, week) => {
    setSubjects(prev => prev.map(s => {
      if (s.id !== subjectId) return s
      const existing = s.attendance.find(a => a.week === week)
      const cycle = { present: 'late', late: 'absent', absent: null }
      if (!existing) {
        return { ...s, attendance: [...s.attendance, { week, status: 'present' }] }
      } else if (cycle[existing.status] === null) {
        return { ...s, attendance: s.attendance.filter(a => a.week !== week) }
      } else {
        return { ...s, attendance: s.attendance.map(a => a.week === week ? { ...a, status: cycle[a.status] } : a) }
      }
    }))
  }

  const getAttendanceStatus = (subject, week) =>
    subject.attendance?.find(a => a.week === week)?.status || 'none'

  const getAttSummary = subject => {
    const att = subject.attendance || []
    return {
      present: att.filter(a => a.status === 'present').length,
      late: att.filter(a => a.status === 'late').length,
      absent: att.filter(a => a.status === 'absent').length,
    }
  }

  return (
    <div>
      <div className='page-header'>
        <div className='page-header-tag'>Phase 01</div>
        <div className='page-header-row'>
          <h2>학점 관리</h2>
          <button className='btn btn-primary btn-sm' onClick={openAdd}>+ 과목 추가</button>
        </div>
        <p>과목별 성적, 과제, 출석을 체계적으로 관리하세요</p>
      </div>

      {subjects.length === 0 ? (
        <div className='card'>
          <div className='empty-state'>
            <div className='icon'>◎</div>
            <p>등록된 과목이 없습니다</p>
            <button className='btn btn-primary' style={{ marginTop: '1rem' }} onClick={openAdd}>+ 과목 추가</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {subjects.map(s => {
            const att = getAttSummary(s)
            const isExpanded = expanded === s.id
            const tab = getTab(s.id)
            return (
              <div className='subject-card' key={s.id}>
                <div className='subject-card-header' onClick={() => setExpanded(isExpanded ? null : s.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)' }}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'Noto Serif KR, serif', fontWeight: 700, fontSize: 15 }}>{s.name}</span>
                        <span className='badge badge-gray'>{s.credits}학점</span>
                        {s.grade && <span className={`badge ${gradeBadgeClass(s.grade)}`}>{s.grade}</span>}
                        {s.targetGrade && !s.grade && <span className='badge badge-gray'>목표 {s.targetGrade}</span>}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
                        {[s.professor, s.classTime].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, display: 'flex', gap: 10 }}>
                      <span style={{ color: '#2e7d52' }}>출 {att.present}</span>
                      <span style={{ color: 'var(--gold)' }}>지 {att.late}</span>
                      <span style={{ color: 'var(--accent)' }}>결 {att.absent}</span>
                    </div>
                    <div className='item-actions' onClick={e => e.stopPropagation()}>
                      <button className='btn-icon btn-sm' onClick={() => openEdit(s)}>✏</button>
                      <button className='btn-icon btn-sm' onClick={() => deleteSubject(s.id)}>✕</button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className='subject-card-body'>
                    <div className='tabs'>
                      {['성적', '과제', '체크리스트', '출석'].map(t => (
                        <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(s.id, t)}>
                          {t}
                        </button>
                      ))}
                    </div>

                    {tab === '성적' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className='form-row'>
                          <div className='form-group'>
                            <label className='form-label'>중간고사 점수</label>
                            <input className='form-input' type='number' min='0' max='100'
                              value={s.midterm || ''}
                              onChange={e => updateSubject(s.id, { midterm: e.target.value })}
                              placeholder='0-100' />
                          </div>
                          <div className='form-group'>
                            <label className='form-label'>기말고사 점수</label>
                            <input className='form-input' type='number' min='0' max='100'
                              value={s.final || ''}
                              onChange={e => updateSubject(s.id, { final: e.target.value })}
                              placeholder='0-100' />
                          </div>
                        </div>
                        <div className='form-row'>
                          <div className='form-group'>
                            <label className='form-label'>획득 학점</label>
                            <select className='form-select' value={s.grade || ''}
                              onChange={e => updateSubject(s.id, { grade: e.target.value })}>
                              <option value=''>미입력</option>
                              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </div>
                          <div className='form-group'>
                            <label className='form-label'>목표 학점</label>
                            <div style={{ padding: '8px 0', fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>
                              {s.targetGrade}
                            </div>
                          </div>
                        </div>
                        <div className='form-row'>
                          <div className='form-group'>
                            <label className='form-label'>중간고사 날짜</label>
                            <input className='form-input' type='date' value={s.midtermDate || ''}
                              onChange={e => updateSubject(s.id, { midtermDate: e.target.value })} />
                          </div>
                          <div className='form-group'>
                            <label className='form-label'>기말고사 날짜</label>
                            <input className='form-input' type='date' value={s.finalDate || ''}
                              onChange={e => updateSubject(s.id, { finalDate: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    )}

                    {tab === '과제' && (
                      <div>
                        {s.assignments?.length === 0 && !showAForm[s.id] && (
                          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
                            등록된 과제 없음
                          </p>
                        )}
                        {s.assignments?.map(a => {
                          const days = a.deadline ? daysUntil(a.deadline) : null
                          return (
                            <div className='list-item' key={a.id}>
                              <CheckItem
                                checked={a.submitted}
                                label={a.name}
                                sublabel={a.deadline ? `${formatDate(a.deadline)}${days !== null ? (days >= 0 ? ` · D-${days}` : ' · 마감') : ''}` : null}
                                onToggle={() => toggleAssignment(s.id, a.id)}
                              />
                              <button className='btn-icon btn-sm' onClick={() => deleteAssignment(s.id, a.id)}>✕</button>
                            </div>
                          )
                        })}
                        {showAForm[s.id] ? (
                          <div style={{ marginTop: 10, padding: '10px', border: '1px solid var(--border)', background: 'var(--paper)' }}>
                            <div className='form-row' style={{ marginBottom: 8 }}>
                              <input className='form-input' placeholder='과제명'
                                value={aForm[s.id]?.name || ''}
                                onChange={e => setAForm(p => ({ ...p, [s.id]: { ...p[s.id], name: e.target.value } }))}
                                onKeyDown={e => e.key === 'Enter' && addAssignment(s.id)}
                                autoFocus />
                              <input className='form-input' type='date'
                                value={aForm[s.id]?.deadline || ''}
                                onChange={e => setAForm(p => ({ ...p, [s.id]: { ...p[s.id], deadline: e.target.value } }))} />
                            </div>
                            <div className='form-actions'>
                              <button className='btn btn-secondary btn-sm' onClick={() => setShowAForm(p => ({ ...p, [s.id]: false }))}>취소</button>
                              <button className='btn btn-primary btn-sm' onClick={() => addAssignment(s.id)}>추가</button>
                            </div>
                          </div>
                        ) : (
                          <button className='btn btn-secondary btn-sm' style={{ marginTop: 8 }}
                            onClick={() => setShowAForm(p => ({ ...p, [s.id]: true }))}>
                            + 과제 추가
                          </button>
                        )}
                      </div>
                    )}

                    {tab === '체크리스트' && (
                      <div>
                        {s.checklist?.length === 0 && !showClForm[s.id] && (
                          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
                            등록된 항목 없음
                          </p>
                        )}
                        {(() => {
                          const grouped = {}
                          s.checklist?.forEach(c => {
                            const key = c.week ? `${c.week}주차` : '기타'
                            if (!grouped[key]) grouped[key] = []
                            grouped[key].push(c)
                          })
                          return Object.entries(grouped)
                            .sort((a, b) => (parseInt(a[0]) || 999) - (parseInt(b[0]) || 999))
                            .map(([week, items]) => (
                              <div key={week} style={{ marginBottom: 12 }}>
                                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>
                                  {week}
                                </div>
                                {items.map(c => (
                                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <CheckItem
                                      checked={c.checked}
                                      label={c.text}
                                      onToggle={() => toggleChecklist(s.id, c.id)}
                                    />
                                    <button className='btn-icon btn-sm' style={{ opacity: .5 }} onClick={() => deleteChecklistItem(s.id, c.id)}>✕</button>
                                  </div>
                                ))}
                              </div>
                            ))
                        })()}
                        {showClForm[s.id] ? (
                          <div style={{ marginTop: 8, padding: '10px', border: '1px solid var(--border)', background: 'var(--paper)' }}>
                            <div className='form-row' style={{ marginBottom: 8 }}>
                              <select className='form-select'
                                value={clForm[s.id]?.week || ''}
                                onChange={e => setClForm(p => ({ ...p, [s.id]: { ...p[s.id], week: e.target.value } }))}>
                                <option value=''>주차 선택</option>
                                {WEEKS.map(w => <option key={w} value={w}>{w}주차</option>)}
                              </select>
                              <input className='form-input' placeholder='예: 필기, 복습'
                                value={clForm[s.id]?.text || ''}
                                onChange={e => setClForm(p => ({ ...p, [s.id]: { ...p[s.id], text: e.target.value } }))}
                                onKeyDown={e => e.key === 'Enter' && addChecklistItem(s.id)}
                                autoFocus />
                            </div>
                            <div className='form-actions'>
                              <button className='btn btn-secondary btn-sm' onClick={() => setShowClForm(p => ({ ...p, [s.id]: false }))}>취소</button>
                              <button className='btn btn-primary btn-sm' onClick={() => addChecklistItem(s.id)}>추가</button>
                            </div>
                          </div>
                        ) : (
                          <button className='btn btn-secondary btn-sm' style={{ marginTop: 4 }}
                            onClick={() => setShowClForm(p => ({ ...p, [s.id]: true }))}>
                            + 항목 추가
                          </button>
                        )}
                      </div>
                    )}

                    {tab === '출석' && (
                      <div>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)', marginBottom: 12, letterSpacing: '.04em' }}>
                          클릭: 없음 → 출석 → 지각 → 결석 → 없음
                        </p>
                        <div className='attendance-grid'>
                          {WEEKS.map(w => {
                            const status = getAttendanceStatus(s, w)
                            return (
                              <div key={w} className={`attendance-dot ${status}`}
                                onClick={() => toggleAttendance(s.id, w)}
                                title={`${w}주차`}>
                                {status === 'none' ? w : status === 'present' ? '출' : status === 'late' ? '지' : '결'}
                              </div>
                            )
                          })}
                        </div>
                        <div style={{ display: 'flex', gap: 20, marginTop: 12, fontFamily: 'JetBrains Mono', fontSize: 11 }}>
                          {(() => {
                            const a = getAttSummary(s)
                            return (
                              <>
                                <span style={{ color: '#2e7d52', fontWeight: 700 }}>출석 {a.present}</span>
                                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>지각 {a.late}</span>
                                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>결석 {a.absent}</span>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editId ? '과목 수정' : '과목 추가'} onClose={() => setShowModal(false)}>
          <div className='form-group'>
            <label className='form-label'>과목명 *</label>
            <input className='form-input' value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder='예: 데이터베이스' autoFocus />
          </div>
          <div className='form-row'>
            <div className='form-group'>
              <label className='form-label'>학점수</label>
              <select className='form-select' value={form.credits} onChange={e => setForm(p => ({ ...p, credits: e.target.value }))}>
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}학점</option>)}
              </select>
            </div>
            <div className='form-group'>
              <label className='form-label'>목표 학점</label>
              <select className='form-select' value={form.targetGrade} onChange={e => setForm(p => ({ ...p, targetGrade: e.target.value }))}>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className='form-row'>
            <div className='form-group'>
              <label className='form-label'>교수명</label>
              <input className='form-input' value={form.professor} onChange={e => setForm(p => ({ ...p, professor: e.target.value }))} placeholder='예: 홍길동 교수' />
            </div>
            <div className='form-group'>
              <label className='form-label'>강의시간</label>
              <input className='form-input' value={form.classTime} onChange={e => setForm(p => ({ ...p, classTime: e.target.value }))} placeholder='예: 월수 10:30' />
            </div>
          </div>
          <div className='form-actions'>
            <button className='btn btn-secondary' onClick={() => setShowModal(false)}>취소</button>
            <button className='btn btn-primary' onClick={save}>저장</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
