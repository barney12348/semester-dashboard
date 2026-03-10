import { useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import Modal from '../components/Modal'
import { genId, formatDate, daysUntil } from '../utils'

const CATEGORIES = ['공모전', '해커톤', '동아리', '인턴', '교내활동', '기타']
const STATUSES = ['지원예정', '지원완료', '합격', '불합격', '진행중', '완료']

const statusBadge = status => ({
  '지원예정': 'badge-gray',
  '지원완료': 'badge-blue',
  '합격': 'badge-green',
  '불합격': 'badge-red',
  '진행중': 'badge-accent',
  '완료': 'badge-green',
})[status] || 'badge-gray'

const emptyActivity = () => ({
  id: genId(), name: '', organization: '', category: '공모전',
  status: '지원예정', startDate: '', endDate: '', deadline: '',
  summary: '', memo: '', checklist: [],
})

function CheckItem({ checked, label, onToggle }) {
  return (
    <div
      className={`checkbox-item${checked ? ' checked' : ''}`}
      onClick={onToggle}
      style={{ cursor: 'pointer' }}
    >
      <div className='check-box' />
      <label style={{ cursor: 'pointer', display: 'block' }}>{label}</label>
    </div>
  )
}

export default function Activities() {
  const [activities, setActivities] = useLocalStorage('activities-list', [])
  const [expanded, setExpanded] = useState(null)
  const [activeTab, setActiveTab] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyActivity())
  const [filterStatus, setFilterStatus] = useState('전체')
  const [clForm, setClForm] = useState({})
  const [showClForm, setShowClForm] = useState({})

  const openAdd = () => { setEditId(null); setForm(emptyActivity()); setShowModal(true) }
  const openEdit = a => { setEditId(a.id); setForm({ ...a }); setShowModal(true) }

  const save = () => {
    if (!form.name.trim()) return
    if (editId) {
      setActivities(prev => prev.map(a => a.id === editId ? { ...form } : a))
    } else {
      setActivities(prev => [...prev, { ...form, id: genId() }])
    }
    setShowModal(false)
  }

  const del = id => {
    if (!window.confirm('삭제할까요?')) return
    setActivities(prev => prev.filter(a => a.id !== id))
    if (expanded === id) setExpanded(null)
  }

  const update = (id, patch) => setActivities(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a))

  const getTab = id => activeTab[id] || '기본정보'
  const setTab = (id, tab) => setActiveTab(prev => ({ ...prev, [id]: tab }))

  const addChecklist = actId => {
    const f = clForm[actId]
    if (!f?.text?.trim()) return
    setActivities(prev => prev.map(a => a.id === actId ? {
      ...a, checklist: [...(a.checklist || []), { id: genId(), text: f.text, checked: false }]
    } : a))
    setClForm(prev => ({ ...prev, [actId]: { text: '' } }))
    setShowClForm(prev => ({ ...prev, [actId]: false }))
  }

  const toggleChecklist = (actId, itemId) => {
    setActivities(prev => prev.map(a => a.id === actId ? {
      ...a, checklist: a.checklist.map(c => c.id === itemId ? { ...c, checked: !c.checked } : c)
    } : a))
  }

  const deleteChecklist = (actId, itemId) => {
    setActivities(prev => prev.map(a => a.id === actId ? {
      ...a, checklist: a.checklist.filter(c => c.id !== itemId)
    } : a))
  }

  const filtered = filterStatus === '전체' ? activities : activities.filter(a => a.status === filterStatus)

  return (
    <div>
      <div className='page-header'>
        <div className='page-header-tag'>Phase 02</div>
        <div className='page-header-row'>
          <h2>대외활동</h2>
          <button className='btn btn-primary btn-sm' onClick={openAdd}>+ 활동 추가</button>
        </div>
        <p>양보다 질 — 스펙이 아닌 스토리를 만들어라</p>
      </div>

      <div className='filter-bar'>
        <button className={`filter-btn${filterStatus === '전체' ? ' active' : ''}`} onClick={() => setFilterStatus('전체')}>
          전체 {activities.length}
        </button>
        {STATUSES.map(s => (
          <button key={s} className={`filter-btn${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s} {activities.filter(a => a.status === s).length > 0 && activities.filter(a => a.status === s).length}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className='card'>
          <div className='empty-state'>
            <div className='icon'>◈</div>
            <p>{filterStatus === '전체' ? '등록된 활동이 없습니다' : `${filterStatus} 상태의 활동이 없습니다`}</p>
            {filterStatus === '전체' && (
              <button className='btn btn-primary' style={{ marginTop: '1rem' }} onClick={openAdd}>+ 활동 추가</button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(a => {
            const isExpanded = expanded === a.id
            const tab = getTab(a.id)
            const days = a.deadline ? daysUntil(a.deadline) : null
            const done = (a.checklist || []).filter(c => c.checked).length
            const total = (a.checklist || []).length
            return (
              <div className='subject-card' key={a.id}>
                <div className='subject-card-header' onClick={() => setExpanded(isExpanded ? null : a.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)' }}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'Noto Serif KR, serif', fontWeight: 700, fontSize: 15 }}>{a.name}</span>
                        <span className='badge badge-gray'>{a.category}</span>
                        <span className={`badge ${statusBadge(a.status)}`}>{a.status}</span>
                        {days !== null && days >= 0 && <span className='badge badge-accent'>D-{days}</span>}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
                        {[a.organization, (a.startDate || a.endDate) ? `${formatDate(a.startDate)} ~ ${formatDate(a.endDate)}` : null].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {total > 0 && (
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)' }}>
                        {done}/{total}
                      </span>
                    )}
                    <div className='item-actions' onClick={e => e.stopPropagation()}>
                      <button className='btn-icon btn-sm' onClick={() => openEdit(a)}>✏</button>
                      <button className='btn-icon btn-sm' onClick={() => del(a.id)}>✕</button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className='subject-card-body'>
                    <div className='tabs'>
                      {['기본정보', '준비체크리스트', '메모'].map(t => (
                        <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(a.id, t)}>
                          {t}
                        </button>
                      ))}
                    </div>

                    {tab === '기본정보' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className='form-row'>
                          <div className='form-group'>
                            <label className='form-label'>상태</label>
                            <select className='form-select' value={a.status}
                              onChange={e => update(a.id, { status: e.target.value })}>
                              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className='form-group'>
                            <label className='form-label'>지원 마감일</label>
                            <input className='form-input' type='date' value={a.deadline || ''}
                              onChange={e => update(a.id, { deadline: e.target.value })} />
                          </div>
                        </div>
                        <div className='form-row'>
                          <div className='form-group'>
                            <label className='form-label'>시작일</label>
                            <input className='form-input' type='date' value={a.startDate || ''}
                              onChange={e => update(a.id, { startDate: e.target.value })} />
                          </div>
                          <div className='form-group'>
                            <label className='form-label'>종료일</label>
                            <input className='form-input' type='date' value={a.endDate || ''}
                              onChange={e => update(a.id, { endDate: e.target.value })} />
                          </div>
                        </div>
                        <div className='form-group'>
                          <label className='form-label'>포트폴리오 한줄 요약</label>
                          <input className='form-input' value={a.summary || ''}
                            onChange={e => update(a.id, { summary: e.target.value })}
                            placeholder='예: React 기반 팀 프로젝트로 대상 수상' />
                        </div>
                      </div>
                    )}

                    {tab === '준비체크리스트' && (
                      <div>
                        {(a.checklist || []).length === 0 && !showClForm[a.id] && (
                          <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
                            등록된 항목 없음
                          </p>
                        )}
                        {(a.checklist || []).map(c => (
                          <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <CheckItem checked={c.checked} label={c.text} onToggle={() => toggleChecklist(a.id, c.id)} />
                            <button className='btn-icon btn-sm' style={{ opacity: .5 }} onClick={() => deleteChecklist(a.id, c.id)}>✕</button>
                          </div>
                        ))}
                        {showClForm[a.id] ? (
                          <div style={{ marginTop: 8, padding: '10px', border: '1px solid var(--border)', background: 'var(--paper)' }}>
                            <input className='form-input' placeholder='예: 자기소개서 작성, 포트폴리오 준비'
                              value={clForm[a.id]?.text || ''}
                              onChange={e => setClForm(p => ({ ...p, [a.id]: { text: e.target.value } }))}
                              onKeyDown={e => e.key === 'Enter' && addChecklist(a.id)}
                              autoFocus />
                            <div className='form-actions' style={{ marginTop: 8 }}>
                              <button className='btn btn-secondary btn-sm' onClick={() => setShowClForm(p => ({ ...p, [a.id]: false }))}>취소</button>
                              <button className='btn btn-primary btn-sm' onClick={() => addChecklist(a.id)}>추가</button>
                            </div>
                          </div>
                        ) : (
                          <button className='btn btn-secondary btn-sm' style={{ marginTop: 8 }}
                            onClick={() => setShowClForm(p => ({ ...p, [a.id]: true }))}>
                            + 항목 추가
                          </button>
                        )}
                      </div>
                    )}

                    {tab === '메모' && (
                      <div>
                        <textarea
                          className='form-input'
                          style={{ minHeight: 120, resize: 'vertical', fontFamily: 'var(--sans)', fontSize: 13 }}
                          value={a.memo || ''}
                          onChange={e => update(a.id, { memo: e.target.value })}
                          placeholder='면접 후기, 준비 과정, 느낀 점 등 자유롭게 메모하세요'
                        />
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
        <Modal title={editId ? '활동 수정' : '활동 추가'} onClose={() => setShowModal(false)}>
          <div className='form-group'>
            <label className='form-label'>활동명 *</label>
            <input className='form-input' value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder='예: 전국 대학생 앱 개발 공모전' autoFocus />
          </div>
          <div className='form-row'>
            <div className='form-group'>
              <label className='form-label'>기관명</label>
              <input className='form-input' value={form.organization}
                onChange={e => setForm(p => ({ ...p, organization: e.target.value }))} />
            </div>
            <div className='form-group'>
              <label className='form-label'>카테고리</label>
              <select className='form-select' value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className='form-group'>
            <label className='form-label'>지원 상태</label>
            <select className='form-select' value={form.status}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
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
