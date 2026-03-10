import { useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import Modal from '../components/Modal'
import { genId, formatDate, daysUntil } from '../utils'

const STATUSES = ['준비중', '필기완료', '실기완료', '합격', '불합격']
const statusBadge = s => ({
  '준비중': 'badge-gray', '필기완료': 'badge-blue',
  '실기완료': 'badge-accent', '합격': 'badge-green', '불합격': 'badge-red',
})[s] || 'badge-gray'

const emptyCert = () => ({
  id: genId(), name: '', issuer: '', writtenDate: '', practicalDate: '', status: '준비중', checklist: [],
})

function CheckItem({ checked, label, onToggle }) {
  return (
    <div className={`checkbox-item${checked ? ' checked' : ''}`} onClick={onToggle}>
      <div className='check-box' />
      <label style={{ cursor: 'pointer' }}>{label}</label>
    </div>
  )
}

export default function Certifications() {
  const [certs, setCerts] = useLocalStorage('certs-list', [])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyCert())
  const [expanded, setExpanded] = useState(null)
  const [clText, setClText] = useState({})
  const [showClInput, setShowClInput] = useState({})

  const openAdd = () => { setEditId(null); setForm(emptyCert()); setShowModal(true) }
  const openEdit = c => { setEditId(c.id); setForm({ ...c, checklist: c.checklist || [] }); setShowModal(true) }
  const save = () => {
    if (!form.name.trim()) return
    if (editId) {
      setCerts(prev => prev.map(c => c.id === editId ? { ...form } : c))
    } else {
      setCerts(prev => [...prev, { ...form, id: genId() }])
    }
    setShowModal(false)
  }
  const del = id => { if (window.confirm('삭제할까요?')) setCerts(prev => prev.filter(c => c.id !== id)) }

  const addChecklistItem = certId => {
    const text = clText[certId]?.trim()
    if (!text) return
    setCerts(prev => prev.map(c => c.id === certId ? {
      ...c, checklist: [...(c.checklist || []), { id: genId(), text, checked: false }],
    } : c))
    setClText(prev => ({ ...prev, [certId]: '' }))
    setShowClInput(prev => ({ ...prev, [certId]: false }))
  }

  const toggleItem = (certId, itemId) => {
    setCerts(prev => prev.map(c => c.id === certId ? {
      ...c, checklist: c.checklist.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i),
    } : c))
  }

  const deleteItem = (certId, itemId) => {
    setCerts(prev => prev.map(c => c.id === certId ? {
      ...c, checklist: c.checklist.filter(i => i.id !== itemId),
    } : c))
  }

  return (
    <div>
      <div className='page-header'>
        <div className='page-header-tag'>Phase 03</div>
        <div className='page-header-row'>
          <h2>자격증</h2>
          <button className='btn btn-primary btn-sm' onClick={openAdd}>+ 자격증 추가</button>
        </div>
        <p>준비 현황과 시험 일정을 체계적으로 관리하세요</p>
      </div>

      {certs.length === 0 ? (
        <div className='card'>
          <div className='empty-state'>
            <div className='icon'>◇</div>
            <p>등록된 자격증이 없습니다</p>
            <button className='btn btn-primary' style={{ marginTop: '1rem' }} onClick={openAdd}>+ 자격증 추가</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {certs.map(c => {
            const isExp = expanded === c.id
            const wrDays = c.writtenDate ? daysUntil(c.writtenDate) : null
            const prDays = c.practicalDate ? daysUntil(c.practicalDate) : null
            const cl = c.checklist || []
            const checkedCount = cl.filter(i => i.checked).length
            return (
              <div className='subject-card' key={c.id}>
                <div className='subject-card-header' onClick={() => setExpanded(isExp ? null : c.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)' }}>
                      {isExp ? '▼' : '▶'}
                    </span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontFamily: 'Noto Serif KR, serif', fontWeight: 700, fontSize: 14 }}>{c.name}</span>
                        <span className={`badge ${statusBadge(c.status)}`}>{c.status}</span>
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)', letterSpacing: '.04em' }}>
                        {c.issuer && <span>{c.issuer}</span>}
                        {c.writtenDate && (
                          <span style={{ marginLeft: c.issuer ? 8 : 0 }}>
                            필기 {formatDate(c.writtenDate)}
                            {wrDays !== null && (
                              <span style={{ color: wrDays <= 7 && wrDays >= 0 ? 'var(--accent)' : 'inherit' }}>
                                {wrDays >= 0 ? ` D-${wrDays}` : ' 종료'}
                              </span>
                            )}
                          </span>
                        )}
                        {c.practicalDate && (
                          <span style={{ marginLeft: 8 }}>
                            실기 {formatDate(c.practicalDate)}
                            {prDays !== null && (
                              <span style={{ color: prDays <= 7 && prDays >= 0 ? 'var(--accent)' : 'inherit' }}>
                                {prDays >= 0 ? ` D-${prDays}` : ' 종료'}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {cl.length > 0 && (
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)' }}>
                        {checkedCount}/{cl.length}
                      </span>
                    )}
                    <div className='item-actions' onClick={e => e.stopPropagation()}>
                      <button className='btn-icon btn-sm' onClick={() => openEdit(c)}>✏</button>
                      <button className='btn-icon btn-sm' onClick={() => del(c.id)}>✕</button>
                    </div>
                  </div>
                </div>

                {isExp && (
                  <div className='subject-card-body'>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)' }}>
                        공부 체크리스트
                      </span>
                      {cl.length > 0 && (
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent)', fontWeight: 700 }}>
                          {Math.round((checkedCount / cl.length) * 100)}%
                        </span>
                      )}
                    </div>
                    {cl.length > 0 && (
                      <div className='progress-bar' style={{ marginBottom: 12 }}>
                        <div className='progress-fill' style={{ width: `${(checkedCount / cl.length) * 100}%` }} />
                      </div>
                    )}
                    {cl.length === 0 && !showClInput[c.id] && (
                      <p style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
                        체크리스트 항목을 추가하세요
                      </p>
                    )}
                    {cl.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <CheckItem checked={item.checked} label={item.text} onToggle={() => toggleItem(c.id, item.id)} />
                        <button className='btn-icon btn-sm' style={{ opacity: .5 }} onClick={() => deleteItem(c.id, item.id)}>✕</button>
                      </div>
                    ))}
                    {showClInput[c.id] ? (
                      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        <input className='form-input' placeholder='예: 1회차 기출, 파트별 정리'
                          value={clText[c.id] || ''}
                          onChange={e => setClText(p => ({ ...p, [c.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addChecklistItem(c.id)}
                          autoFocus />
                        <button className='btn btn-primary btn-sm' onClick={() => addChecklistItem(c.id)}>추가</button>
                        <button className='btn btn-secondary btn-sm' onClick={() => setShowClInput(p => ({ ...p, [c.id]: false }))}>취소</button>
                      </div>
                    ) : (
                      <button className='btn btn-secondary btn-sm' style={{ marginTop: 10 }}
                        onClick={() => setShowClInput(p => ({ ...p, [c.id]: true }))}>
                        + 항목 추가
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editId ? '자격증 수정' : '자격증 추가'} onClose={() => setShowModal(false)}>
          <div className='form-group'>
            <label className='form-label'>자격증명 *</label>
            <input className='form-input' value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder='예: 정보처리기사' autoFocus />
          </div>
          <div className='form-group'>
            <label className='form-label'>발급기관</label>
            <input className='form-input' value={form.issuer}
              onChange={e => setForm(p => ({ ...p, issuer: e.target.value }))}
              placeholder='예: 한국산업인력공단' />
          </div>
          <div className='form-row'>
            <div className='form-group'>
              <label className='form-label'>필기 시험일</label>
              <input className='form-input' type='date' value={form.writtenDate} onChange={e => setForm(p => ({ ...p, writtenDate: e.target.value }))} />
            </div>
            <div className='form-group'>
              <label className='form-label'>실기 시험일</label>
              <input className='form-input' type='date' value={form.practicalDate} onChange={e => setForm(p => ({ ...p, practicalDate: e.target.value }))} />
            </div>
          </div>
          <div className='form-group'>
            <label className='form-label'>준비 현황</label>
            <select className='form-select' value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
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
