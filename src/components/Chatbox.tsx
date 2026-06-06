import { useRef, useState } from 'react'

interface Props {
  onSend: (text: string) => void
  onTyping: () => void
  canSend: boolean
  pendingReply: string | null
  onClearReply: () => void
}

export default function Chatbox({ onSend, onTyping, canSend, pendingReply, onClearReply }: Props) {
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
    <div className={`chatbox${pendingReply ? ' replaying' : ''}`}>
      <div className="replay">
        <div className="quote-header">
          <span>Replaying</span>
          <button className="close" onClick={onClearReply}>
            <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.5 12.8417L6.80417 17.5375C6.62847 17.7132 6.40486 17.801 6.13333 17.801C5.86181 17.801 5.6382 17.7132 5.4625 17.5375C5.28681 17.3618 5.19896 17.1382 5.19896 16.8667C5.19896 16.5951 5.28681 16.3715 5.4625 16.1958L10.1583 11.5L5.4625 6.80415C5.28681 6.62846 5.19896 6.40485 5.19896 6.13332C5.19896 5.86179 5.28681 5.63818 5.4625 5.46249C5.6382 5.28679 5.86181 5.19894 6.13333 5.19894C6.40486 5.19894 6.62847 5.28679 6.80417 5.46249L11.5 10.1583L16.1958 5.46249C16.3715 5.28679 16.5951 5.19894 16.8667 5.19894C17.1382 5.19894 17.3618 5.28679 17.5375 5.46249C17.7132 5.63818 17.801 5.86179 17.801 6.13332C17.801 6.40485 17.7132 6.62846 17.5375 6.80415L12.8417 11.5L17.5375 16.1958C17.7132 16.3715 17.801 16.5951 17.801 16.8667C17.801 17.1382 17.7132 17.3618 17.5375 17.5375C17.3618 17.7132 17.1382 17.801 16.8667 17.801C16.5951 17.801 16.3715 17.7132 16.1958 17.5375L11.5 12.8417Z"/>
            </svg>
          </button>
        </div>
        <p>{pendingReply}</p>
      </div>

      <div className={`textarea${multiline ? ' multiline' : ''}`}>
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
    </div>
  )
}
