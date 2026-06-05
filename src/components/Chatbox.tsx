import { useRef, useState } from 'react'

interface Props {
  onSend: (text: string) => void
  onTyping: () => void
  canSend: boolean
}

export default function Chatbox({ onSend, onTyping, canSend }: Props) {
  const [draft, setDraft]         = useState('')
  const [multiline, setMultiline] = useState(false)
  const textareaRef               = useRef<HTMLTextAreaElement>(null)
  const typingTimeout             = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
    setDraft(el.value)
    setMultiline(el.scrollHeight > 40)

    if (canSend && el.value.trim()) {
      onTyping()
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => { typingTimeout.current = null }, 2000)
    }
  }

  function handleSend() {
    const text = draft.trim()
    if (!text || !canSend) return
    onSend(text)
    setDraft('')
    setMultiline(false)
    const el = textareaRef.current
    if (el) { el.value = ''; el.style.height = 'auto' }
  }

  const sendEnabled = draft.trim() !== '' && canSend

  return (
    <div className={`chatbox${multiline ? ' multiline' : ''}`}>
      <textarea
        ref={textareaRef}
        placeholder="Type shit..."
        rows={1}
        onInput={handleInput}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
      />
      <button
        className={`btn btn_send${sendEnabled ? ' enabled' : ''}`}
        onClick={handleSend}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.8625 20.2033V8.15375L5.394 13.6223L3.79675 12L12 3.79675L20.2033 12L18.606 13.6223L13.1375 8.15375V20.2033H10.8625Z"/>
        </svg>
      </button>
    </div>
  )
}
