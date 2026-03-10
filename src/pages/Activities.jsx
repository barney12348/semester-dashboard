import { useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import Modal from '../components/Modal'
import { genId, formatDate } from '../utils'

const CATEGORIES = ['공모전', '동아리', '인턴', '교내활동', '봉사', '기타']
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
  status: '지원예정', startDate: '', endDate: '', summary: '',
})

export default function Activities() {
  const [activities, setActivities] = useLocalStorage('activities-list', [])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyActivity())
  const [filterStatus, setFilterStatus] = useState('전체')

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
  const del = id => { if (window.confirm('삭제할까요?')) setActivities(prev => prev.filter(a => a.id !== id)) }

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
        <div style={{ border: '2px solid var(--ink)', background: 'var(--card-bg)' }}>
          {filtered.map((a, i) => (
            <div key={a.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '1rem 1.2rem',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'Noto Serif KR, serif', fontWeight: 700, fontSize: 14 }}>{a.name}</span>
                  <span className='badge badge-gray'>{a.category}</span>
                  <span className={`badge ${statusBadge(a.status)}`}>{a.status}</span>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--muted)', letterSpacing: '.04em' }}>
                  {a.organization}
                  {(a.startDate || a.endDate) && ` · ${formatDate(a.startDate)} ~ ${formatDate(a.endDate)}`}
                </div>
                {a.summary && (
                  <div style={{
                    marginTop: 6, fontSize: 12, color: 'var(--muted)',
                    borderLeft: '3px solid var(--accent)', paddingLeft: 8,
                    fontStyle: 'italic',
                  }}>
                    {a.summary}
                  </div>
                )}
              </div>
              <div className='item-actions' style={{ marginLeft: 12, flexShrink: 0 }}>
                <button className='btn-icon btn-sm' onClick={() => openEdit(a)}>✏</button>
                <button className='btn-icon btn-sm' onClick={() => del(a.id)}>✕</button>
              </div>
            </div>
          ))}
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
              <input className='form-input' value={form.organization} onChange={e => setForm(p => ({ ...p, organization: e.target.value }))} />
            </div>
            <div className='form-group'>
              <label className='form-label'>카테고리</label>
              <select className='form-select' value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className='form-group'>
            <label className='form-label'>지원 상태</label>
            <select className='form-select' value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className='form-row'>
            <div className='form-group'>
              <label className='form-label'>시작일</label>
              <input className='form-input' type='date' value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div className='form-group'>
              <label className='form-label'>종료일</label>
              <input className='form-input' type='date' value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            </div>
          </div>
          <div className='form-group'>
            <label className='form-label'>포트폴리오 한줄 요약</label>
            <input className='form-input' value={form.summary}
              onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
              placeholder='예: React 기반 팀 프로젝트로 대상 수상' />
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
