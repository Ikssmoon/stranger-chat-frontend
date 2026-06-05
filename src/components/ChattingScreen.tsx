import { useEffect, useRef } from 'react'

interface Msg {
  text: string
  fromMe: boolean
}

interface Props {
  messages: Msg[]
  matchTime: string
  isTyping: boolean
  partnerLeft: boolean
  onFindNext: () => void
}

// Returns true when the string contains only emoji characters (and whitespace).
function isEmojiOnly(s: string): boolean {
  const stripped = s
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[️⃣‍]/g, '')
    .replace(/[\uD83C][\uDDE0-\uDDFF]/g, '') // regional indicator pairs (flags)
    .trim()
  return stripped.length === 0 && s.trim().length > 0
}

function toGroups(msgs: Msg[]) {
  const groups: { fromMe: boolean; texts: string[] }[] = []
  for (const m of msgs) {
    const last = groups[groups.length - 1]
    if (last && last.fromMe === m.fromMe) {
      last.texts.push(m.text)
    } else {
      groups.push({ fromMe: m.fromMe, texts: [m.text] })
    }
  }
  return groups
}

export default function ChattingScreen({ messages, matchTime, isTyping, partnerLeft, onFindNext }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, partnerLeft])

  return (
    <div className="chat_area" style={{ flexGrow: 1, height: '100%' }}>

      {!partnerLeft && (
        <div className="match-found-container">
          <h2>Match found, Start conversation quickly</h2>
          <div className="time">
            <span>{matchTime}</span>
          </div>
        </div>
      )}

      {toGroups(messages).map((g, i) => (
        <div key={i} className={`group ${g.fromMe ? 'me' : 'match'}`}>
          {g.texts.map((text, j) => (
            <span key={j} className={isEmojiOnly(text) ? 'emoji-only' : ''}>
              {text}
            </span>
          ))}
        </div>
      ))}

      {isTyping && !partnerLeft && (
        <div className="typing-indicator" ref={bottomRef}>
          <span></span>
          <span></span>
          <span></span>
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
