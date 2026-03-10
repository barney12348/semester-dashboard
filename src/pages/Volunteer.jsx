import { useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import Modal from '../components/Modal'
import { genId, formatDate } from '../utils'

const emptyVol = () => ({ id: genId(), name: '', organization: '', date: '', hours: '', status: '예정' })

export default function Volunteer() {
  const [volunteers, setVolunteers] = useLocalStorage('volunteer-list', [])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyVol())
  const [filterStatus, setFilterStatus] = useState('전체')

  const totalHours = volunteers.filter(v => v.status === '완료').reduce((acc, v) => acc + Number(v.hours || 0), 0)
  const completedCount = volunteers.filter(v => v.status === '완료').length
  const plannedCount = volunteers.filter(v => v.status === '예정').length

  const openAdd = () => { setEditId(null); setForm(emptyVol()); setShowModal(true) }
  const openEdit = v => { setEditId(v.id); setForm({ ...v }); setShowModal(true) }
  const save = () => {
    if (!form.name.trim()) return
    if (editId) {
      setVolunteers(prev => prev.map(v => v.id === editId ? { ...form } : v))
    } else {
      setVolunteers(prev => [...prev, { ...form, id: genId() }])
    }
    setShowModal(false)
  }
  const del = id => { if (window.confirm('삭제할까요?')) setVolunteers(prev => prev.filter(v => v.id !== id)) }
  const toggleStatus = id => setVolunteers(prev => prev.map(v =>
    v.id === id ? { ...v, status: v.status === '완료' ? '예정' : '완료' } : v
  ))

  const filtered = filterStatus === '전체' ? volunteers : volunteers.filter(v => v.status === filterStatus)
  const sorted = [...filtered].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  return (
    <div>
      <div className='page-header'>
        <div className='page-header-tag'>Phase 04</div>
        <div className='page-header-row'>
          <h2>봉사활동</h2>
          <button className='btn btn-primary btn-sm' onClick={openAdd}>+ 봉사 추가</button>
        </div>
        <p>봉사 이력과 누적 시간을 관리하세요</p>
      </div>

      {/* Stats */}
      <div className='stats-row' style={{ marginBottom: '1.2rem' }}>
        <div className='stat-card'>
          <div className='stat-label'>누적 봉사시간</div>
          <div className='stat-value'>
            {totalHours}
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '1rem', fontWeight: 700 }}>h</span>
          </div>
        </div>
        <div className='stat-card'>
          <div className='stat-label'>완료 횟수</div>
          <div className='stat-value'>{completedCount}</div>
          <div className='stat-sub'>건</div>
        </div>
        <div className='stat-card'>
          <div className='stat-label'>예정 횟수</div>
          <div className='stat-value'>{plannedCount}</div>
          <div className='stat-sub'>건</div>
        </div>
        <div className='stat-card'>
          <div className='stat-label'>전체</div>
          <div className='stat-value'>{volunteers.length}</div>
          <div className='stat-sub'>건</div>
        </div>
      </div>

      <div className='filter-bar'>
        {['전체', '예정', '완료'].map(s => (
          <button key={s} className={`filter-btn${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>
            {s}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className='card'>
          <div className='empty-state'>
            <div className='icon'>♡</div>
            <p>{filterStatus === '전체' ? '등록된 봉사활동이 없습니다' : `${filterStatus} 상태의 활동이 없습니다`}</p>
            {filterStatus === '전체' && (
              <button className='btn btn-primary' style={{ marginTop: '1rem' }} onClick={openAdd}>+ 봉사 추가</button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ border: '2px solid var(--ink)', background: 'var(--card-bg)' }}>
          {sorted.map((v, i) => (
            <div key={v.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '.9rem 1.2rem',
              borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  onClick={() => toggleStatus(v.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{
                    width: 18, height: 18,
                    border: '2px solid var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    background: v.status === '완료' ? 'var(--ink)' : 'transparent',
                    color: v.status === '완료' ? 'var(--paper)' : 'transparent',
                  }}>✓</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'Noto Serif KR, serif',
                      fontWeight: 700, fontSize: 13,
                      textDecoration: v.status === '완료' ? 'line-through' : 'none',
                      color: v.status === '완료' ? 'var(--muted)' : 'var(--ink)',
                    }}>
                      {v.name}
                    </span>
                    <span className={`badge ${v.status === '완료' ? 'badge-green' : 'badge-gray'}`}>{v.status}</span>
                    {v.hours && <span className='badge badge-accent'>{v.hours}h</span>}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)', letterSpacing: '.04em' }}>
                    {[v.organization, v.date ? formatDate(v.date) : null].filter(Boolean).join(' · ')}
                  </div>
                </div>
              </div>
              <div className='item-actions' style={{ flexShrink: 0 }}>
                <button className='btn-icon btn-sm' onClick={() => openEdit(v)}>✏</button>
                <button className='btn-icon btn-sm' onClick={() => del(v.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editId ? '봉사활동 수정' : '봉사활동 추가'} onClose={() => setShowModal(false)}>
          <div className='form-group'>
            <label className='form-label'>활동명 *</label>
            <input className='form-input' value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder='예: 도서관 사서 도우미' autoFocus />
          </div>
          <div className='form-group'>
            <label className='form-label'>기관</label>
            <input className='form-input' value={form.organization}
              onChange={e => setForm(p => ({ ...p, organization: e.target.value }))}
              placeholder='예: OO 구립 도서관' />
          </div>
          <div className='form-row'>
            <div className='form-group'>
              <label className='form-label'>활동일</label>
              <input className='form-input' type='date' value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div className='form-group'>
              <label className='form-label'>시간 (h)</label>
              <input className='form-input' type='number' min='0' step='0.5'
                value={form.hours} onChange={e => setForm(p => ({ ...p, hours: e.target.value }))}
                placeholder='예: 3' />
            </div>
          </div>
          <div className='form-group'>
            <label className='form-label'>상태</label>
            <select className='form-select' value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value='예정'>예정</option>
              <option value='완료'>완료</option>
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
