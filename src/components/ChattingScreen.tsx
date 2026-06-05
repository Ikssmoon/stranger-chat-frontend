import { useEffect, useRef, useState } from 'react'
import type { Msg } from '../types'

interface Props {
  messages: Msg[]
  matchTime: string
  isTyping: boolean
  partnerLeft: boolean
  onFindNext: () => void
  onReact: (msgId: string, emoji: string | null) => void
}

function toGroups(msgs: Msg[]) {
  const groups: { fromMe: boolean; messages: Msg[] }[] = []
  for (const m of msgs) {
    const last = groups[groups.length - 1]
    if (last && last.fromMe === m.fromMe) last.messages.push(m)
    else groups.push({ fromMe: m.fromMe, messages: [m] })
  }
  return groups
}

function isEmojiOnly(s: string): boolean {
  const stripped = s
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[️⃣‍]/g, '')
    .replace(/[\uD83C][\uDDE0-\uDDFF]/g, '')
    .trim()
  return stripped.length === 0 && s.trim().length > 0
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢']

const SmileyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
    <path d="M480-480Zm.07 380q-78.84 0-148.21-29.92t-120.68-81.21q-51.31-51.29-81.25-120.63Q100-401.1 100-479.93q0-78.84 29.93-148.21 29.92-69.37 81.22-120.68t120.65-81.25Q401.15-860 480-860q41.46 0 80.31 8.31 38.84 8.31 74.3 24.31v67.3q-34.23-18.84-73.23-29.38Q522.38-800 480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160q133 0 226.5-93.5T800-480q0-30.46-5.73-59.12-5.73-28.65-15.96-55.49h64.46q8.61 27.46 12.92 55.71Q860-510.65 860-480q0 78.85-29.92 148.2t-81.21 120.65q-51.29 51.3-120.63 81.22Q558.9-100 480.07-100ZM810-690v-80h-80v-60h80v-80h60v80h80v60h-80v80h-60ZM616.24-527.69q21.84 0 37.03-15.29 15.19-15.28 15.19-37.11t-15.28-37.02q-15.28-15.2-37.12-15.2-21.83 0-37.02 15.29-15.19 15.28-15.19 37.11t15.28 37.02q15.28 15.2 37.11 15.2Zm-272.3 0q21.83 0 37.02-15.29 15.19-15.28 15.19-37.11t-15.28-37.02q-15.28-15.2-37.11-15.2-21.84 0-37.03 15.29-15.19 15.28-15.19 37.11t15.28 37.02q15.28 15.2 37.12 15.2Zm250.71 220.34q51.66-35.04 76.27-92.65H289.08q24.61 57.61 76.27 92.65Q417-272.31 480-272.31q63 0 114.65-35.04Z"/>
  </svg>
)

function MessageBubble({ msg, onReact }: { msg: Msg; onReact: (id: string, emoji: string | null) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onOutside)
    return () => document.removeEventListener('click', onOutside)
  }, [open])

  function handleReact(emoji: string) {
    onReact(msg.id, msg.myReaction === emoji ? null : emoji)
    setOpen(false)
  }

  const trigger = (
    <button
      className={`react-trigger${msg.myReaction ? ' active' : ''}`}
      onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
    >
      {msg.myReaction ?? <SmileyIcon />}
      {msg.partnerReaction && <div className="their-reaction">{msg.partnerReaction}</div>}
    </button>
  )

  return (
    <div className={`bubble-main${msg.myReaction ? ' reacted' : ''}`} ref={ref}>
      <span className={isEmojiOnly(msg.text) ? 'emoji-only' : ''}>{msg.text}</span>
      {trigger}
      <div className={`reactions-popup${open ? ' open' : ''}`}>
        {REACTIONS.map(emoji => (
          <button
            key={emoji}
            className={`react-btn${msg.myReaction === emoji ? ' active' : ''}`}
            onClick={e => { e.stopPropagation(); handleReact(emoji) }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ChattingScreen({ messages, matchTime, isTyping, partnerLeft, onFindNext, onReact }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, partnerLeft])

  return (
    <div className="chat_area" style={{ flexGrow: 1, height: '100%' }}>

      {!partnerLeft && (
        <div className="match-found-container">
          <h2>Match found, Start conversation quickly</h2>
          <div className="time"><span>{matchTime}</span></div>
        </div>
      )}

      {toGroups(messages).map((g, i) => (
        <div key={i} className={`group ${g.fromMe ? 'me' : 'match'}`}>
          {g.messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} onReact={onReact} />
          ))}
        </div>
      ))}

      {isTyping && !partnerLeft && (
        <div className="typing-indicator" ref={bottomRef}>
          <span></span><span></span><span></span>
        </div>
      )}

      {partnerLeft && (
        <div className="they_left_bubble" ref={bottomRef}>
          <span>Partner skipped or disconnected</span>
          <button className="btn" onClick={onFindNext}>Find next</button>
        </div>
      )}

      {!isTyping && !partnerLeft && <div ref={bottomRef} />}
    </div>
  )
}
