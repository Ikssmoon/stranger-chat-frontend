import { useEffect, useRef, useState } from 'react'
import type { Msg } from '../types'
import { useLang } from '../contexts/LangContext'

interface Props {
  messages: Msg[]
  matchTime: string
  isTyping: boolean
  partnerLeft: boolean
  onFindNext: () => void
  onReact: (msgId: string, emoji: string) => void
  onReply: (text: string) => void
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢']

const REPLAY_SVG = (
  <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.2083 18.2084V14.3751C18.2083 13.5765 17.9288 12.8977 17.3698 12.3386C16.8108 11.7796 16.1319 11.5001 15.3333 11.5001H6.54062L9.99062 14.9501L8.625 16.2917L2.875 10.5417L8.625 4.79175L9.99062 6.13341L6.54062 9.58341H15.3333C16.659 9.58341 17.7891 10.0506 18.7234 10.985C19.6578 11.9194 20.125 13.0494 20.125 14.3751V18.2084H18.2083Z"/>
  </svg>
)

const COPY_SVG = (
  <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.625 17.2501C8.09792 17.2501 7.6467 17.0624 7.27135 16.6871C6.89601 16.3117 6.70833 15.8605 6.70833 15.3334V3.83341C6.70833 3.30633 6.89601 2.85512 7.27135 2.47977C7.6467 2.10442 8.09792 1.91675 8.625 1.91675H17.25C17.7771 1.91675 18.2283 2.10442 18.6036 2.47977C18.979 2.85512 19.1667 3.30633 19.1667 3.83341V15.3334C19.1667 15.8605 18.979 16.3117 18.6036 16.6871C18.2283 17.0624 17.7771 17.2501 17.25 17.2501H8.625ZM8.625 15.3334H17.25V3.83341H8.625V15.3334ZM4.79167 21.0834C4.26458 21.0834 3.81337 20.8957 3.43802 20.5204C3.06267 20.145 2.875 19.6938 2.875 19.1667V6.70841C2.875 6.43689 2.96684 6.20928 3.15052 6.0256C3.3342 5.84192 3.56181 5.75008 3.83333 5.75008C4.10486 5.75008 4.33247 5.84192 4.51615 6.0256C4.69983 6.20928 4.79167 6.43689 4.79167 6.70841V19.1667H14.375C14.6465 19.1667 14.8741 19.2586 15.0578 19.4423C15.2415 19.6259 15.3333 19.8536 15.3333 20.1251C15.3333 20.3966 15.2415 20.6242 15.0578 20.8079C14.8741 20.9916 14.6465 21.0834 14.375 21.0834H4.79167Z"/>
  </svg>
)

// Group consecutive messages by direction — mirrors message-group in the mockup
function toGroups(msgs: Msg[]) {
  const groups: { direction: 'incoming' | 'outgoing'; messages: Msg[] }[] = []
  for (const m of msgs) {
    const last = groups[groups.length - 1]
    if (last && last.direction === m.direction) last.messages.push(m)
    else groups.push({ direction: m.direction, messages: [m] })
  }
  return groups
}

function reactionsText(msg: Msg): string {
  const mine = msg.myReaction
  const theirs = msg.theirReaction
  if (!mine && !theirs) return ''
  if (mine && theirs && mine === theirs) return `${mine} 2`
  return [theirs, mine].filter(Boolean).join(' ')
}

interface MessageItemProps {
  msg: Msg
  isContainer: boolean
  isPopupOpen: boolean
  isDimmed: boolean
  copyLabel: string
  onFirstClick: (e: React.MouseEvent) => void
  onTogglePopup: (e: React.MouseEvent) => void
  onReact: (emoji: string, e: React.MouseEvent) => void
  onReply: (e: React.MouseEvent) => void
  onCopy: (e: React.MouseEvent) => void
}

function MessageItem({
  msg, isContainer, isPopupOpen, isDimmed, copyLabel,
  onFirstClick, onTogglePopup, onReact, onReply, onCopy,
}: MessageItemProps) {
  const { t } = useLang()
  const reactions = reactionsText(msg)

  // Plain .message — not yet promoted to container
  if (!isContainer) {
    return (
      <div
        className={`message${isDimmed ? ' dimmed' : ''}`}
        data-direction={msg.direction}
        onClick={onFirstClick}
        onContextMenu={onFirstClick}
      >
        {msg.text}
      </div>
    )
  }

  // .message-container — with popup, optional reply quote, optional reactions
  return (
    <div
      className={`message-container${isDimmed ? ' dimmed' : ''}`}
      data-direction={msg.direction}
    >
      {msg.replaid && (
        <div className="reply-quote">
          <div className="indicator" />
          <div className="quote">{msg.replaid}</div>
        </div>
      )}
      <div className="message-main">
        <div
          className="message"
          data-direction={msg.direction}
          onClick={onTogglePopup}
          onContextMenu={onTogglePopup}
        >
          {msg.text}
        </div>

        {reactions && (
          <div className="message-reactions">{reactions}</div>
        )}

        <div className={`message-popup${isPopupOpen ? ' open' : ''}`}>
          <div className="reactions_bar">
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                className={`react-btn${msg.myReaction === emoji ? ' active' : ''}`}
                onClick={e => onReact(emoji, e)}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="actions_bar">
            <button className="action_btn" onClick={onReply}>
              {REPLAY_SVG}<div>{t('chat.replay')}</div>
            </button>
            <button className="action_btn" onClick={onCopy}>
              {COPY_SVG}<div>{copyLabel}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChattingScreen({
  messages, matchTime, isTyping, partnerLeft, onFindNext, onReact, onReply,
}: Props) {
  const { t } = useLang()
  // Set of message ids that have been promoted to containers (popup ever opened)
  const [containerIds, setContainerIds] = useState<Set<string>>(new Set())
  const [openPopupId, setOpenPopupId] = useState<string | null>(null)
  const [copyingId, setCopyingId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Messages with a replaid are always containers
  function isContainer(msg: Msg) {
    return msg.replaid !== '' || containerIds.has(msg.id)
  }

  // Close all popups on outside click
  useEffect(() => {
    function handleDocClick() { setOpenPopupId(null) }
    document.addEventListener('click', handleDocClick)
    return () => document.removeEventListener('click', handleDocClick)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, partnerLeft])

  useEffect(() => {
    if (!partnerLeft) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') onFindNext()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [partnerLeft, onFindNext])

  function handleFirstClick(msgId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setContainerIds(prev => new Set(prev).add(msgId))
    setOpenPopupId(msgId)
  }

  function handleTogglePopup(msgId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setOpenPopupId(prev => prev === msgId ? null : msgId)
  }

  function handleReact(msg: Msg, emoji: string, e: React.MouseEvent) {
    e.stopPropagation()
    onReact(msg.id, msg.myReaction === emoji ? '' : emoji)
    setOpenPopupId(null)
  }

  function handleReply(msgText: string, e: React.MouseEvent) {
    e.stopPropagation()
    onReply(msgText)
    setOpenPopupId(null)
  }

  function handleCopy(msgId: string, text: string, e: React.MouseEvent) {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopyingId(msgId)
    setTimeout(() => setCopyingId(null), 1500)
    setOpenPopupId(null)
  }

  return (
    <div className="chat_area">
      {!partnerLeft && (
        <div className="match-found-container">
          <h2>{t('chat.matchFound')}</h2>
          <div className="time"><span>{matchTime}</span></div>
        </div>
      )}

      {toGroups(messages).map((group, gi) => (
        <div key={gi} className="message-group">
          {group.messages.map(msg => (
            <MessageItem
              key={msg.id}
              msg={msg}
              isContainer={isContainer(msg)}
              isPopupOpen={openPopupId === msg.id}
              isDimmed={openPopupId !== null && openPopupId !== msg.id}
              copyLabel={copyingId === msg.id ? t('chat.copied') : t('chat.copy')}
              onFirstClick={e => handleFirstClick(msg.id, e)}
              onTogglePopup={e => handleTogglePopup(msg.id, e)}
              onReact={(emoji, e) => handleReact(msg, emoji, e)}
              onReply={e => handleReply(msg.text, e)}
              onCopy={e => handleCopy(msg.id, msg.text, e)}
            />
          ))}
        </div>
      ))}

      {isTyping && !partnerLeft && (
        <div className="typing-indicator" ref={bottomRef}>
          <span /><span /><span />
        </div>
      )}

      {partnerLeft && (
        <div className="they_left_bubble" ref={bottomRef}>
          <span>{t('chat.partnerLeft')}</span>
          <button className="btn" onClick={onFindNext}>{t('chat.findNext')}</button>
        </div>
      )}

      {!isTyping && !partnerLeft && <div ref={bottomRef} style={{ display: 'none' }} />}
    </div>
  )
}
