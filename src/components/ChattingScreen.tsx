import { useEffect, useRef, useState } from 'react'
import type { Msg } from '../types'
import { useLang } from '../contexts/LangContext'
import { BRB_PATTERN, formatTime } from '../utils/brb'
import { SOCIAL_PLATFORMS } from '../utils/social'

const SOCIAL_ICON: Record<string, string> = Object.fromEntries(
  SOCIAL_PLATFORMS.map(p => [p.name, p.icon])
)

function SocialLinkBubble({ msg, isDimmed }: { msg: Msg; isDimmed: boolean }) {
  const icon = SOCIAL_ICON[msg.linkPlatform ?? ''] ?? ''
  const hint = msg.direction === 'outgoing'
    ? 'They should also send to reveal link'
    : 'You should also send to reveal link'

  return (
    <div
      className={`message${isDimmed ? ' dimmed' : ''}`}
      data-direction={msg.direction}
      data-link-state={msg.linkState}
    >
      <div className="link-message">
        <div className="link-pill">
          <img src={icon} alt={msg.linkPlatform} />
          {msg.linkState === 'revealed' ? (
            <a
              className="link-url"
              href={msg.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {msg.linkUrl}
            </a>
          ) : (
            <span className="link-url blurred">{msg.linkPlatform}.com/••••••••</span>
          )}
        </div>
        {msg.linkState === 'pending' && (
          <span className="link-hint">{hint}</span>
        )}
      </div>
    </div>
  )
}

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

const TIMER_SVG = (
  <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.58333 2.87492C9.31181 2.87492 9.0842 2.78308 8.90052 2.5994C8.71684 2.41572 8.625 2.18811 8.625 1.91659C8.625 1.64506 8.71684 1.41745 8.90052 1.23377C9.0842 1.05009 9.31181 0.958252 9.58333 0.958252H13.4167C13.6882 0.958252 13.9158 1.05009 14.0995 1.23377C14.2832 1.41745 14.375 1.64506 14.375 1.91659C14.375 2.18811 14.2832 2.41572 14.0995 2.5994C13.9158 2.78308 13.6882 2.87492 13.4167 2.87492H9.58333ZM12.1828 13.1411C12.3665 12.9574 12.4583 12.7298 12.4583 12.4583V8.62492C12.4583 8.35339 12.3665 8.12579 12.1828 7.94211C11.9991 7.75843 11.7715 7.66659 11.5 7.66659C11.2285 7.66659 11.0009 7.75843 10.8172 7.94211C10.6335 8.12579 10.5417 8.35339 10.5417 8.62492V12.4583C10.5417 12.7298 10.6335 12.9574 10.8172 13.1411C11.0009 13.3247 11.2285 13.4166 11.5 13.4166C11.7715 13.4166 11.9991 13.3247 12.1828 13.1411ZM8.15781 20.4004C7.11163 19.9452 6.19722 19.3263 5.41458 18.5437C4.63194 17.761 4.01302 16.8466 3.55781 15.8004C3.1026 14.7543 2.875 13.6402 2.875 12.4583C2.875 11.2763 3.1026 10.1622 3.55781 9.11606C4.01302 8.06988 4.63194 7.15547 5.41458 6.37284C6.19722 5.5902 7.11163 4.97127 8.15781 4.51606C9.20399 4.06086 10.3181 3.83325 11.5 3.83325C12.4903 3.83325 13.4406 3.99297 14.351 4.31242C15.2615 4.63186 16.116 5.09506 16.9146 5.702L17.5854 5.03117C17.7611 4.85547 17.9847 4.76763 18.2562 4.76763C18.5278 4.76763 18.7514 4.85547 18.9271 5.03117C19.1028 5.20686 19.1906 5.43047 19.1906 5.702C19.1906 5.97353 19.1028 6.19714 18.9271 6.37284L18.2562 7.04367C18.8632 7.84228 19.3264 8.69679 19.6458 9.60721C19.9653 10.5176 20.125 11.468 20.125 12.4583C20.125 13.6402 19.8974 14.7543 19.4422 15.8004C18.987 16.8466 18.3681 17.761 17.5854 18.5437C16.8028 19.3263 15.8884 19.9452 14.8422 20.4004C13.796 20.8556 12.6819 21.0833 11.5 21.0833C10.3181 21.0833 9.20399 20.8556 8.15781 20.4004ZM16.2437 17.202C17.5535 15.8923 18.2083 14.311 18.2083 12.4583C18.2083 10.6055 17.5535 9.02422 16.2437 7.7145C14.934 6.40478 13.3528 5.74992 11.5 5.74992C9.64722 5.74992 8.06597 6.40478 6.75625 7.7145C5.44653 9.02422 4.79167 10.6055 4.79167 12.4583C4.79167 14.311 5.44653 15.8923 6.75625 17.202C8.06597 18.5117 9.64722 19.1666 11.5 19.1666C13.3528 19.1666 14.934 18.5117 16.2437 17.202Z"/>
  </svg>
)

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

  // Social link bubble — no popup, no container promotion
  if (msg.linkState) {
    return <SocialLinkBubble msg={msg} isDimmed={isDimmed} />
  }

  // BRB timer detection — mirrors renderMessage from mockup script.js
  const brbMatch = msg.text.match(BRB_PATTERN)
  const isTimer = !!brbMatch
  const [remaining, setRemaining] = useState(brbMatch ? parseInt(brbMatch[1]) : 0)
  const [timerDone, setTimerDone] = useState(false)

  useEffect(() => {
    if (!isTimer) return
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setTimerDone(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const messageContent = isTimer ? (
    <div className="timer-chip">
      {TIMER_SVG}
      <span>{formatTime(remaining)}</span>
    </div>
  ) : msg.text

  const timerProps = isTimer
    ? { 'data-timer': 'true', ...(timerDone ? { 'data-timer-done': 'true' } : {}) }
    : {}

  // Plain .message — not yet promoted to container
  if (!isContainer) {
    return (
      <div
        className={`message${isDimmed ? ' dimmed' : ''}`}
        data-direction={msg.direction}
        {...timerProps}
        onClick={onFirstClick}
        onContextMenu={onFirstClick}
      >
        {messageContent}
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
          {...timerProps}
          onClick={onTogglePopup}
          onContextMenu={onTogglePopup}
        >
          {messageContent}
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
    const brbMatch = msgText.match(BRB_PATTERN)
    onReply(brbMatch ? formatTime(parseInt(brbMatch[1])) : msgText)
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
