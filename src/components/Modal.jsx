export default function Modal({ title, onClose, children, maxWidth = 560 }) {
  return (
    <div className='modal-overlay' onClick={e => e.target === e.currentTarget && onClose()}>
      <div className='modal' style={{ maxWidth }}>
        <div className='modal-header'>
          <h3>{title}</h3>
          <button className='btn-icon' onClick={onClose} style={{ fontSize: 18 }}>✕</button>
        </div>
        <div className='modal-body'>
          {children}
        </div>
      </div>
    </div>
  )
}
