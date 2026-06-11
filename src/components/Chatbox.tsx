import { useEffect, useRef, useState } from 'react'
import { useLang } from '../contexts/LangContext'
import { formatTime } from '../utils/brb'

const TIMER_SVG = (
  <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.58333 2.87492C9.31181 2.87492 9.0842 2.78308 8.90052 2.5994C8.71684 2.41572 8.625 2.18811 8.625 1.91659C8.625 1.64506 8.71684 1.41745 8.90052 1.23377C9.0842 1.05009 9.31181 0.958252 9.58333 0.958252H13.4167C13.6882 0.958252 13.9158 1.05009 14.0995 1.23377C14.2832 1.41745 14.375 1.64506 14.375 1.91659C14.375 2.18811 14.2832 2.41572 14.0995 2.5994C13.9158 2.78308 13.6882 2.87492 13.4167 2.87492H9.58333ZM12.1828 13.1411C12.3665 12.9574 12.4583 12.7298 12.4583 12.4583V8.62492C12.4583 8.35339 12.3665 8.12579 12.1828 7.94211C11.9991 7.75843 11.7715 7.66659 11.5 7.66659C11.2285 7.66659 11.0009 7.75843 10.8172 7.94211C10.6335 8.12579 10.5417 8.35339 10.5417 8.62492V12.4583C10.5417 12.7298 10.6335 12.9574 10.8172 13.1411C11.0009 13.3247 11.2285 13.4166 11.5 13.4166C11.7715 13.4166 11.9991 13.3247 12.1828 13.1411ZM8.15781 20.4004C7.11163 19.9452 6.19722 19.3263 5.41458 18.5437C4.63194 17.761 4.01302 16.8466 3.55781 15.8004C3.1026 14.7543 2.875 13.6402 2.875 12.4583C2.875 11.2763 3.1026 10.1622 3.55781 9.11606C4.01302 8.06988 4.63194 7.15547 5.41458 6.37284C6.19722 5.5902 7.11163 4.97127 8.15781 4.51606C9.20399 4.06086 10.3181 3.83325 11.5 3.83325C12.4903 3.83325 13.4406 3.99297 14.351 4.31242C15.2615 4.63186 16.116 5.09506 16.9146 5.702L17.5854 5.03117C17.7611 4.85547 17.9847 4.76763 18.2562 4.76763C18.5278 4.76763 18.7514 4.85547 18.9271 5.03117C19.1028 5.20686 19.1906 5.43047 19.1906 5.702C19.1906 5.97353 19.1028 6.19714 18.9271 6.37284L18.2562 7.04367C18.8632 7.84228 19.3264 8.69679 19.6458 9.60721C19.9653 10.5176 20.125 11.468 20.125 12.4583C20.125 13.6402 19.8974 14.7543 19.4422 15.8004C18.987 16.8466 18.3681 17.761 17.5854 18.5437C16.8028 19.3263 15.8884 19.9452 14.8422 20.4004C13.796 20.8556 12.6819 21.0833 11.5 21.0833C10.3181 21.0833 9.20399 20.8556 8.15781 20.4004ZM16.2437 17.202C17.5535 15.8923 18.2083 14.311 18.2083 12.4583C18.2083 10.6055 17.5535 9.02422 16.2437 7.7145C14.934 6.40478 13.3528 5.74992 11.5 5.74992C9.64722 5.74992 8.06597 6.40478 6.75625 7.7145C5.44653 9.02422 4.79167 10.6055 4.79167 12.4583C4.79167 14.311 5.44653 15.8923 6.75625 17.202C8.06597 18.5117 9.64722 19.1666 11.5 19.1666C13.3528 19.1666 14.934 18.5117 16.2437 17.202Z"/>
  </svg>
)

const PRESETS = [
  { value: '30s',  seconds: 30,  label: '30 sec' },
  { value: '60s',  seconds: 60,  label: '1 min' },
  { value: '90s',  seconds: 90,  label: '1:30 min' },
  { value: '120s', seconds: 120, label: '2 min' },
]

interface Props {
  onSend: (text: string) => void
  onTyping: () => void
  canSend: boolean
  pendingReply: string | null
  onClearReply: () => void
}

export default function Chatbox({ onSend, onTyping, canSend, pendingReply, onClearReply }: Props) {
  const { t } = useLang()
  const [hasContent, setHasContent]         = useState(false)
  const [multiline, setMultiline]           = useState(false)
  const [toolsOpen, setToolsOpen]           = useState(false)
  const [timerOpen, setTimerOpen]           = useState(false)
  const [timerChipTime, setTimerChipTime]   = useState('00:00')
  const [selectedPreset, setSelectedPreset] = useState('')
  const [focused, setFocused]               = useState(false)
  const inputRef                            = useRef<HTMLDivElement>(null)
  const singleLineH                         = useRef(0)
  const typingTimeout                       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMobile                            = window.innerWidth <= 768

  // Capture single-line height after layout settles — rAF ensures element is painted
  useEffect(() => {
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const h = inputRef.current.offsetHeight
        singleLineH.current = h > 0 ? h : 36
      }
    })
  }, [])

  useEffect(() => {
    if (pendingReply) inputRef.current?.focus()
  }, [pendingReply])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab') { e.preventDefault(); inputRef.current?.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!(e.target as Element).closest('.tools-menu')) setToolsOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  // ── contenteditable helpers ───────────────────────────────────────────────

  function getInputText(): string {
    const el = inputRef.current
    if (!el) return ''
    let result = ''
    el.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent ?? ''
      } else if ((node as HTMLElement).classList?.contains('input-chip')) {
        result += (node as HTMLElement).dataset.value ?? ''
      } else {
        result += (node as HTMLElement).textContent ?? ''
      }
    })
    return result.trim()
  }

  function clearInput() {
    const el = inputRef.current
    if (!el) return
    el.innerHTML = ''
    setHasContent(false)
    setMultiline(false)
    if (isMobile) setFocused(false)
  }

  function injectTimerChip(seconds: number) {
    const el = inputRef.current
    if (!el) return
    const chip = document.createElement('span')
    chip.className = 'input-chip'
    chip.contentEditable = 'false'
    chip.dataset.value = `/brb ${seconds}sec`
    chip.innerHTML = `<span>${formatTime(seconds)}</span>`

    const sel = window.getSelection()
    if (sel && sel.rangeCount && el.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0)
      range.deleteContents()
      range.insertNode(chip)
      range.setStartAfter(chip)
      range.collapse(true)
      sel.removeAllRanges()
      sel.addRange(range)
    } else {
      el.appendChild(chip)
    }

    setHasContent(true)
    el.focus()
  }

  // ── event handlers ────────────────────────────────────────────────────────

  function handleInput() {
    const el = inputRef.current
    if (!el) return
    const text = getInputText()
    setHasContent(text.length > 0)
    setMultiline(el.scrollHeight > singleLineH.current + 8)
    if (isMobile) setFocused(text.length > 0)

    if (timerOpen) {
      const match = text.match(/^\/brb (\d+)sec$/)
      if (match) {
        const secs = parseInt(match[1])
        if (secs > 0 && secs <= 600) setTimerChipTime(formatTime(secs))
      }
    }

    if (canSend && text.length > 0) {
      onTyping()
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      typingTimeout.current = setTimeout(() => { typingTimeout.current = null }, 2000)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
      return
    }

    // Space after /timer N → inject chip
    if (e.key === ' ') {
      const sel = window.getSelection()
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0)
        const textNode = range.startContainer
        if (textNode.nodeType === Node.TEXT_NODE) {
          const textBefore = (textNode.textContent ?? '').slice(0, range.startOffset)
          const timerMatch = textBefore.match(/\/timer (\d+)$/)
          if (timerMatch) {
            const seconds = parseInt(timerMatch[1])
            if (seconds > 0 && seconds <= 600) {
              e.preventDefault()
              const idx = textBefore.lastIndexOf('/timer ' + timerMatch[1])
              const before = (textNode.textContent ?? '').slice(0, idx)
              const after  = (textNode.textContent ?? '').slice(idx + timerMatch[0].length)

              const chip = document.createElement('span')
              chip.className = 'input-chip'
              chip.contentEditable = 'false'
              chip.dataset.value = `/brb ${seconds}sec`
              chip.innerHTML = `<span>${formatTime(seconds)}</span>`

              ;(textNode as Text).textContent = before
              const afterNode = document.createTextNode(' ' + (after.length ? after : ''))
              textNode.parentNode!.insertBefore(chip, textNode.nextSibling)
              textNode.parentNode!.insertBefore(afterNode, chip.nextSibling)

              const newRange = document.createRange()
              newRange.setStart(afterNode, 1)
              newRange.collapse(true)
              sel.removeAllRanges()
              sel.addRange(newRange)
              // force caret repaint
              inputRef.current!.blur()
              inputRef.current!.focus()

              setHasContent(true)
            }
          }
        }
      }
    }

    // Backspace at start of text node right after a chip → restore to /timer N text
    if (e.key === 'Backspace') {
      const sel = window.getSelection()
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0)
        if (range.collapsed) {
          const prev = range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset === 0
            ? (range.startContainer as Text).previousSibling
            : null
          if (prev && (prev as HTMLElement).classList?.contains('input-chip')) {
            e.preventDefault()
            const chipValue = (prev as HTMLElement).dataset.value ?? ''
            const brbMatch  = chipValue.match(/^\/brb (\d+)sec$/)
            const seconds   = brbMatch ? parseInt(brbMatch[1]) : null
            const textNode  = document.createTextNode(seconds ? `/timer ${seconds}` : chipValue)
            prev.parentNode!.insertBefore(textNode, prev)
            prev.remove()
            const newRange = document.createRange()
            newRange.setStartAfter(textNode)
            newRange.collapse(true)
            sel.removeAllRanges()
            sel.addRange(newRange)
            setHasContent(getInputText().length > 0)
          }
        }
      }
    }
  }

  function handleSend() {
    const text = getInputText()
    if (!text || !canSend) return
    onSend(text)
    clearInput()
    if (timerOpen) closeTimer()
  }

  function resetTimer() {
    setTimerChipTime('00:00')
    setSelectedPreset('')
    clearInput()
  }

  function closeTimer() {
    setTimerOpen(false)
    resetTimer()
  }

  function handleBrbClick() {
    setTimerOpen(true)
    setToolsOpen(false)
  }

  function handlePresetChange(seconds: number, value: string) {
    setSelectedPreset(value)
    setTimerChipTime(formatTime(seconds))
    clearInput()
    injectTimerChip(seconds)
  }

  const sendEnabled = hasContent && canSend

  return (
    <div className="chatbox_holder">
    <div className={`chatbox${pendingReply ? ' replaying' : ''}${focused ? ' focused' : ''}`}>
      <div className="replay">
        <div className="quote-header">
          <span>{t('chatbox.replaying')}</span>
          <button className="close" onClick={onClearReply}>
            <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.5 12.8417L6.80417 17.5375C6.62847 17.7132 6.40486 17.801 6.13333 17.801C5.86181 17.801 5.6382 17.7132 5.4625 17.5375C5.28681 17.3618 5.19896 17.1382 5.19896 16.8667C5.19896 16.5951 5.28681 16.3715 5.4625 16.1958L10.1583 11.5L5.4625 6.80415C5.28681 6.62846 5.19896 6.40485 5.19896 6.13332C5.19896 5.86179 5.28681 5.63818 5.4625 5.46249C5.6382 5.28679 5.86181 5.19894 6.13333 5.19894C6.40486 5.19894 6.62847 5.28679 6.80417 5.46249L11.5 10.1583L16.1958 5.46249C16.3715 5.28679 16.5951 5.19894 16.8667 5.19894C17.1382 5.19894 17.3618 5.28679 17.5375 5.46249C17.7132 5.63818 17.801 5.86179 17.801 6.13332C17.801 6.40485 17.7132 6.62846 17.5375 6.80415L12.8417 11.5L17.5375 16.1958C17.7132 16.3715 17.801 16.5951 17.801 16.8667C17.801 17.1382 17.7132 17.3618 17.5375 17.5375C17.3618 17.7132 17.1382 17.801 16.8667 17.801C16.5951 17.801 16.3715 17.7132 16.1958 17.5375L11.5 12.8417Z"/>
            </svg>
          </button>
        </div>
        <p>{pendingReply}</p>
      </div>

      <div className={`timer${timerOpen ? ' show' : ''}`}>
        <div className="timer-chip">
          {TIMER_SVG}
          <span>{timerChipTime}</span>
        </div>

        <span className="dvd">‒</span>

        <div className="presets-list">
          {PRESETS.map(p => (
            <label key={p.value} className="radio-option">
              <input
                type="radio"
                name="timer-presets"
                value={p.value}
                checked={selectedPreset === p.value}
                onChange={() => handlePresetChange(p.seconds, p.value)}
              />
              <div className="btn">{p.label}</div>
            </label>
          ))}
        </div>

        <button className="btn-close" onClick={closeTimer}>
          <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5003 12.8417L6.80443 17.5375C6.62873 17.7132 6.40512 17.8011 6.13359 17.8011C5.86207 17.8011 5.63845 17.7132 5.46276 17.5375C5.28707 17.3618 5.19922 17.1382 5.19922 16.8667C5.19922 16.5952 5.28707 16.3715 5.46276 16.1959L10.1586 11.5L5.46276 6.80418C5.28707 6.62849 5.19922 6.40488 5.19922 6.13335C5.19922 5.86182 5.28707 5.63821 5.46276 5.46252C5.63845 5.28682 5.86207 5.19897 6.13359 5.19897C6.40512 5.19897 6.62873 5.28682 6.80443 5.46252L11.5003 10.1583L16.1961 5.46252C16.3718 5.28682 16.5954 5.19897 16.8669 5.19897C17.1385 5.19897 17.3621 5.28682 17.5378 5.46252C17.7135 5.63821 17.8013 5.86182 17.8013 6.13335C17.8013 6.40488 17.7135 6.62849 17.5378 6.80418L12.8419 11.5L17.5378 16.1959C17.7135 16.3715 17.8013 16.5952 17.8013 16.8667C17.8013 17.1382 17.7135 17.3618 17.5378 17.5375C17.3621 17.7132 17.1385 17.8011 16.8669 17.8011C16.5954 17.8011 16.3718 17.7132 16.1961 17.5375L11.5003 12.8417Z"/>
          </svg>
        </button>
      </div>

      <div className={`textarea${multiline ? ' multiline' : ''}`}>
        <div className="tools-menu">
          <div className={`tools-list${toolsOpen ? ' open' : ''}`}>
            <button className="action_btn" onClick={handleBrbClick}>
              {TIMER_SVG}
              <span>{t('chatbox.brbTimer')}</span>
            </button>
            <button className="action_btn">
              <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.8295 9.39175L8.91283 7.47508C8.81699 7.37925 8.74512 7.27144 8.6972 7.15164C8.64928 7.03185 8.62533 6.90807 8.62533 6.78029V2.87508C8.62533 2.60355 8.71717 2.37595 8.90085 2.19227C9.08453 2.00859 9.31213 1.91675 9.58366 1.91675H13.417C13.6885 1.91675 13.9161 2.00859 14.0998 2.19227C14.2835 2.37595 14.3753 2.60355 14.3753 2.87508V6.78029C14.3753 6.90807 14.3514 7.03185 14.3035 7.15164C14.2555 7.27144 14.1837 7.37925 14.0878 7.47508L12.1712 9.39175C12.0753 9.48758 11.9715 9.55546 11.8597 9.59539C11.7479 9.63532 11.6281 9.65529 11.5003 9.65529C11.3725 9.65529 11.2528 9.63532 11.141 9.59539C11.0291 9.55546 10.9253 9.48758 10.8295 9.39175ZM13.6087 12.1709C13.5128 12.0751 13.4449 11.9713 13.405 11.8595C13.3651 11.7477 13.3451 11.6279 13.3451 11.5001C13.3451 11.3723 13.3651 11.2525 13.405 11.1407C13.4449 11.0289 13.5128 10.9251 13.6087 10.8292L15.5253 8.91258C15.6212 8.81675 15.729 8.74487 15.8488 8.69696C15.9686 8.64904 16.0923 8.62508 16.2201 8.62508H20.1253C20.3969 8.62508 20.6245 8.71692 20.8081 8.9006C20.9918 9.08428 21.0837 9.31189 21.0837 9.58341V13.4167C21.0837 13.6883 20.9918 13.9159 20.8081 14.0996C20.6245 14.2832 20.3969 14.3751 20.1253 14.3751H16.2201C16.0923 14.3751 15.9686 14.3511 15.8488 14.3032C15.729 14.2553 15.6212 14.1834 15.5253 14.0876L13.6087 12.1709ZM1.91699 13.4167V9.58341C1.91699 9.31189 2.00883 9.08428 2.19251 8.9006C2.37619 8.71692 2.6038 8.62508 2.87533 8.62508H6.78053C6.90831 8.62508 7.0321 8.64904 7.15189 8.69696C7.27168 8.74487 7.37949 8.81675 7.47533 8.91258L9.39199 10.8292C9.48783 10.9251 9.55571 11.0289 9.59564 11.1407C9.63557 11.2525 9.65553 11.3723 9.65553 11.5001C9.65553 11.6279 9.63557 11.7477 9.59564 11.8595C9.55571 11.9713 9.48783 12.0751 9.39199 12.1709L7.47533 14.0876C7.37949 14.1834 7.27168 14.2553 7.15189 14.3032C7.0321 14.3511 6.90831 14.3751 6.78053 14.3751H2.87533C2.6038 14.3751 2.37619 14.2832 2.19251 14.0996C2.00883 13.9159 1.91699 13.6883 1.91699 13.4167ZM8.62533 20.1251V16.2199C8.62533 16.0921 8.64928 15.9683 8.6972 15.8485C8.74512 15.7287 8.81699 15.6209 8.91283 15.5251L10.8295 13.6084C10.9253 13.5126 11.0291 13.4447 11.141 13.4048C11.2528 13.3648 11.3725 13.3449 11.5003 13.3449C11.6281 13.3449 11.7479 13.3648 11.8597 13.4048C11.9715 13.4447 12.0753 13.5126 12.1712 13.6084L14.0878 15.5251C14.1837 15.6209 14.2555 15.7287 14.3035 15.8485C14.3514 15.9683 14.3753 16.0921 14.3753 16.2199V20.1251C14.3753 20.3966 14.2835 20.6242 14.0998 20.8079C13.9161 20.9916 13.6885 21.0834 13.417 21.0834H9.58366C9.31213 21.0834 9.08453 20.9916 8.90085 20.8079C8.71717 20.6242 8.62533 20.3966 8.62533 20.1251ZM11.5003 7.33133L12.4587 6.373V3.83341H10.542V6.373L11.5003 7.33133ZM3.83366 12.4584H6.37324L7.33158 11.5001L6.37324 10.5417H3.83366V12.4584ZM10.542 19.1667H12.4587V16.6272L11.5003 15.6688L10.542 16.6272V19.1667ZM16.6274 12.4584H19.167V10.5417H16.6274L15.6691 11.5001L16.6274 12.4584Z"/>
              </svg>
              <span>{t('chatbox.miniGames')}</span>
              <span className="coming-soon">{t('chatbox.comingSoon')}</span>
            </button>
            <button className="action_btn">
              <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.78678 20.3287C6.62081 19.8256 5.60258 19.1388 4.7321 18.2683C3.86161 17.3978 3.1748 16.3796 2.67168 15.2136C2.16855 14.0477 1.91699 12.8058 1.91699 11.4881C1.91699 10.1704 2.16855 8.93255 2.67168 7.77456C3.1748 6.61657 3.86161 5.60234 4.7321 4.73185C5.60258 3.86137 6.62081 3.17456 7.78678 2.67144C8.95276 2.16831 10.1946 1.91675 11.5123 1.91675C12.83 1.91675 14.0679 2.16831 15.2258 2.67144C16.3838 3.17456 17.3981 3.86137 18.2686 4.73185C19.139 5.60234 19.8258 6.61657 20.329 7.77456C20.8321 8.93255 21.0837 10.1704 21.0837 11.4881C21.0837 12.8058 20.8321 14.0477 20.329 15.2136C19.8258 16.3796 19.139 17.3978 18.2686 18.2683C17.3981 19.1388 16.3838 19.8256 15.2258 20.3287C14.0679 20.8319 12.83 21.0834 11.5123 21.0834C10.1946 21.0834 8.95276 20.8319 7.78678 20.3287ZM11.5003 19.1188C11.9156 18.5438 12.275 17.9449 12.5785 17.322C12.8819 16.699 13.1295 16.0362 13.3212 15.3334H9.67949C9.87116 16.0362 10.1187 16.699 10.4222 17.322C10.7257 17.9449 11.085 18.5438 11.5003 19.1188ZM9.00866 18.7355C8.72116 18.2084 8.4696 17.6614 8.25397 17.0944C8.03835 16.5273 7.85866 15.9404 7.71491 15.3334H4.88783C5.35102 16.132 5.93001 16.8268 6.6248 17.4178C7.3196 18.0088 8.11421 18.448 9.00866 18.7355ZM13.992 18.7355C14.8864 18.448 15.6811 18.0088 16.3758 17.4178C17.0706 16.8268 17.6496 16.132 18.1128 15.3334H15.2857C15.142 15.9404 14.9623 16.5273 14.7467 17.0944C14.5311 17.6614 14.2795 18.2084 13.992 18.7355ZM4.07324 13.4167H7.33158C7.28366 13.0973 7.24772 12.7819 7.22376 12.4704C7.1998 12.1589 7.18783 11.8355 7.18783 11.5001C7.18783 11.1647 7.1998 10.8412 7.22376 10.5298C7.24772 10.2183 7.28366 9.90286 7.33158 9.58341H4.07324C3.99338 9.90286 3.93349 10.2183 3.89355 10.5298C3.85362 10.8412 3.83366 11.1647 3.83366 11.5001C3.83366 11.8355 3.85362 12.1589 3.89355 12.4704C3.93349 12.7819 3.99338 13.0973 4.07324 13.4167ZM9.24824 13.4167H13.7524C13.8003 13.0973 13.8363 12.7819 13.8602 12.4704C13.8842 12.1589 13.8962 11.8355 13.8962 11.5001C13.8962 11.1647 13.8842 10.8412 13.8602 10.5298C13.8363 10.2183 13.8003 9.90286 13.7524 9.58341H9.24824C9.20033 9.90286 9.16439 10.2183 9.14043 10.5298C9.11647 10.8412 9.10449 11.1647 9.14043 12.4704C9.16439 12.7819 9.20033 13.0973 9.24824 13.4167ZM15.6691 13.4167H18.9274C19.0073 13.0973 19.0672 12.7819 19.1071 12.4704C19.147 12.1589 19.167 11.8355 19.167 11.5001C19.167 11.1647 19.147 10.8412 19.1071 10.5298C19.0672 10.2183 19.0073 9.90286 18.9274 9.58341H15.6691C15.717 9.90286 15.7529 10.2183 15.7769 10.5298C15.8008 10.8412 15.8128 11.1647 15.7769 12.4704C15.7529 12.7819 15.717 13.0973 15.6691 13.4167ZM15.2857 7.66675H18.1128C17.6496 6.86814 17.0706 6.17335 16.3758 5.58237C15.6811 4.9914 14.8864 4.55216 13.992 4.26466C14.2795 4.79175 14.5311 5.3388 14.7467 5.90581C14.9623 6.47282 15.142 7.0598 15.2857 7.66675ZM9.67949 7.66675H13.3212C13.1295 6.96397 12.8819 6.30112 12.5785 5.67821C12.275 5.05529 11.9156 4.45633 11.5003 3.88133C11.085 4.45633 10.7257 5.05529 10.4222 5.67821C10.1187 6.30112 9.87116 6.96397 9.67949 7.66675ZM4.88783 7.66675H7.71491C7.85866 7.0598 8.03835 6.47282 8.25397 5.90581C8.4696 5.3388 8.72116 4.79175 9.00866 4.26466C8.11421 4.55216 7.3196 4.9914 6.6248 5.58237C5.93001 6.17335 5.35102 6.86814 4.88783 7.66675Z"/>
              </svg>
              <span>{t('chatbox.shareContacts')}</span>
              <span className="coming-soon">{t('chatbox.comingSoon')}</span>
            </button>
          </div>
          <button
            className={`tools-trigger${toolsOpen ? ' active' : ''}`}
            onClick={e => { e.stopPropagation(); setToolsOpen(o => !o) }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.4655 20.2845C11.3218 20.1408 11.25 19.9627 11.25 19.7502V12.7502H4.25C4.0375 12.7502 3.85942 12.6783 3.71575 12.5345C3.57192 12.3907 3.5 12.2125 3.5 12C3.5 11.7873 3.57192 11.6092 3.71575 11.4657C3.85942 11.3221 4.0375 11.2502 4.25 11.2502H11.25V4.25024C11.25 4.03774 11.3219 3.85966 11.4658 3.71599C11.6096 3.57216 11.7878 3.50024 12.0003 3.50024C12.2129 3.50024 12.391 3.57216 12.5345 3.71599C12.6782 3.85966 12.75 4.03774 12.75 4.25024V11.2502H19.75C19.9625 11.2502 20.1406 11.3222 20.2843 11.466C20.4281 11.6098 20.5 11.788 20.5 12.0005C20.5 12.2132 20.4281 12.3912 20.2843 12.5347C20.1406 12.6784 19.9625 12.7502 19.75 12.7502L12.75 12.7502L12.75 19.7502C12.75 19.9627 12.6781 20.1408 12.5343 20.2845C12.3904 20.4283 12.2122 20.5002 11.9997 20.5002C11.7871 20.5002 11.609 20.4283 11.4655 20.2845Z"/>
            </svg>
          </button>
        </div>

        <div
          ref={inputRef}
          contentEditable
          suppressContentEditableWarning
          className="text-area-element"
          data-placeholder={t('chatbox.placeholder')}
          inputMode="text"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (isMobile) setFocused(true) }}
          onBlur={() => { if (isMobile) setFocused(false) }}
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
    </div>
  )
}
