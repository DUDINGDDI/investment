import { useToast } from './ToastContext'

export default function Toast() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '\u2713 ' : ''}{toast.message}
        </div>
      ))}
    </>
  )
}
