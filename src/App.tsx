import { useEffect, useRef, useState } from 'react'
import { socket, visitorId } from './socket'
import Header from './components/Header'
import StartScreen from './components/StartScreen'
import SearchingScreen from './components/SearchingScreen'
import ChattingScreen from './components/ChattingScreen'
import Chatbox from './components/Chatbox'
import LiveIndicator from './components/LiveIndicator'
import type { Msg } from './types'
import { detectSocialLink } from './utils/social'

type Screen = 'start' | 'searching' | 'chat'
type FilterGender = 'male' | 'female' | 'any'

const toSocket = (g: FilterGender) => g === 'male' ? 'm' : g === 'female' ? 'f' : 'any'

const mainClass: Record<Screen, string> = {
  start:     'fresh-show',
  searching: 'searching-show',
  chat:      'chat_area-show',
}

function newMsg(partial: Omit<Msg, 'replaid' | 'myReaction' | 'theirReaction'> & { replaid?: string }): Msg {
  return { replaid: '', myReaction: '', theirReaction: '', ...partial }
}

export default function App() {
  const [screen, setScreen]             = useState<Screen>('start')
  const [iAm, setIAm]                   = useState<FilterGender>('any')
  const [lookingFor, setLookingFor]     = useState<FilterGender>('any')
  const [filterOpen, setFilterOpen]     = useState(true)
  const [messages, setMessages]         = useState<Msg[]>([])
  const [matchTime, setMatchTime]       = useState('')
  const [isPartnerTyping, setIsPartnerTyping] = useState(false)
  const [onlineCount, setOnlineCount]   = useState(0)
  const [partnerLeft, setPartnerLeft]   = useState(false)
  const [pendingReply, setPendingReply] = useState<string | null>(null)
  const typingClearRef                  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unreadCount                     = useRef(0)
  const baseTitle                       = useRef('Matchy, ანონიმური ჩატი')

  // ── page title: restore on tab focus ─────────────────────────────────────
  useEffect(() => {
    function onVisibilityChange() {
      if (!document.hidden) {
        unreadCount.current = 0
        document.title = baseTitle.current
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  // ── socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    function onSearching() {
      document.title = 'Matchy ეძებს პარტნიორს'
      setScreen('searching')
    }

    function onMatched(_: { roomId: string }) {
      document.title = '✅ მეტჩია'
      baseTitle.current = '✅ მეტჩია'
      unreadCount.current = 0
      new Audio('/audio.mp3').play().catch(() => {})
      const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      setMatchTime(now)
      setMessages([])
      setFilterOpen(false)
      setIsPartnerTyping(false)
      setPartnerLeft(false)
      setPendingReply(null)
      setScreen('chat')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onMessage(raw: any) {
      console.log('[onMessage] raw:', JSON.stringify(raw))
      const msg: Msg = {
        id:           String(raw.id   ?? ''),
        text:         String(raw.text ?? ''),
        direction:    'incoming',
        replaid:      String(raw.replyTo ?? ''),
        myReaction:   '',
        theirReaction: '',
      }
      console.log('[onMessage] msg.replaid:', msg.replaid)
      if (document.hidden) {
        unreadCount.current++
        document.title = unreadCount.current === 1
          ? '💌 ახალი შეტყობინება'
          : `${unreadCount.current} ახალი შეტყობინება`
      }
      setMessages(prev => [...prev, msg])
    }

    function onPartnerReacted({ messageId, emoji }: { messageId: string; emoji: string | null }) {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, theirReaction: emoji ?? '' } : m
      ))
    }

    function onPartnerLeft() {
      document.title = '❌ ჩატი დასრულდა'
      baseTitle.current = 'Matchy, ანონიმური ჩატი'
      setIsPartnerTyping(false)
      setPartnerLeft(true)
    }

    function onPartnerTyping() {
      setIsPartnerTyping(true)
      if (typingClearRef.current) clearTimeout(typingClearRef.current)
      typingClearRef.current = setTimeout(() => setIsPartnerTyping(false), 2000)
    }

    function onConnectedCount({ count }: { count: number }) {
      setOnlineCount(count)
    }

    function onError({ code, message }: { code: string; message: string }) {
      console.warn(`[socket error] ${code}: ${message}`)
    }

    function onSocialRequest({ platform }: { platform: string }) {
      console.log('[social_request] received:', { platform })
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), text: '', direction: 'incoming',
        replaid: '', myReaction: '', theirReaction: '',
        linkState: 'pending' as const, linkPlatform: platform,
      }])
    }

    function onSocialReveal({ yourUrl, theirUrl }: { yourUrl: string; theirUrl: string }) {
      console.log('[social_reveal] received:', { yourUrl, theirUrl })
      setMessages(prev => {
        let outDone = false, inDone = false
        return prev.map(m => {
          if (!outDone && m.direction === 'outgoing' && m.linkState === 'pending') {
            outDone = true
            return { ...m, linkState: 'revealed' as const, linkUrl: yourUrl }
          }
          if (!inDone && m.direction === 'incoming' && m.linkState === 'pending') {
            inDone = true
            return { ...m, linkState: 'revealed' as const, linkUrl: theirUrl }
          }
          return m
        })
      })
    }

    socket.on('searching',       onSearching)
    socket.on('matched',         onMatched)
    socket.on('message',         onMessage)
    socket.on('partner_left',    onPartnerLeft)
    socket.on('partner_typing',  onPartnerTyping)
    socket.on('connected_count', onConnectedCount)
    socket.on('partner_reacted', onPartnerReacted)
    socket.on('error',           onError)
    socket.on('social_request',  onSocialRequest)
    socket.on('social_reveal',   onSocialReveal)

    return () => {
      socket.off('searching',       onSearching)
      socket.off('matched',         onMatched)
      socket.off('message',         onMessage)
      socket.off('partner_left',    onPartnerLeft)
      socket.off('partner_typing',  onPartnerTyping)
      socket.off('connected_count', onConnectedCount)
      socket.off('partner_reacted', onPartnerReacted)
      socket.off('error',           onError)
      socket.off('social_request',  onSocialRequest)
      socket.off('social_reveal',   onSocialReveal)
    }
  }, [])

  // ── client error tracking ─────────────────────────────────────────────────
  useEffect(() => {
    function handleWindowError(event: ErrorEvent) {
      socket.emit('client_error', {
        message: event.message,
        stack: (event.error as Error | null)?.stack ?? '',
        pageState: screen,
        userAgent: navigator.userAgent,
        visitorId,
      })
    }
    window.addEventListener('error', handleWindowError)
    return () => window.removeEventListener('error', handleWindowError)
  }, [screen])

  // ── action handlers ───────────────────────────────────────────────────────
  function handleStart() {
    socket.emit('set_filter', { iAm: toSocket(iAm), lookingFor: toSocket(lookingFor) })
    socket.emit('start_search')
  }

  function handleFindNext() {
    setFilterOpen(false)
    setMessages([])
    setPartnerLeft(false)
    setPendingReply(null)
    socket.emit('set_filter', { iAm: toSocket(iAm), lookingFor: toSocket(lookingFor) })
    if (partnerLeft) {
      socket.emit('start_search')
    } else if (screen === 'chat') {
      socket.emit('skip')
    } else if (screen === 'searching') {
      socket.emit('leave')
      socket.emit('start_search')
    } else {
      socket.emit('start_search')
    }
    setScreen('searching')
  }

  function handleBlock() {
    setFilterOpen(false)
    setMessages([])
    setPendingReply(null)
    socket.emit('set_filter', { iAm: toSocket(iAm), lookingFor: toSocket(lookingFor) })
    socket.emit('block')
    setScreen('searching')
  }

  function handleLeave() {
    socket.emit('leave')
    setScreen('start')
    setMessages([])
    setFilterOpen(false)
    setPartnerLeft(false)
    setPendingReply(null)
  }

  function handleSend(text: string) {
    if (screen !== 'chat') return

    const socialPlatform = detectSocialLink(text)
    if (socialPlatform) {
      socket.emit('social_link', { platform: socialPlatform.name, url: text })
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), text, direction: 'outgoing',
        replaid: '', myReaction: '', theirReaction: '',
        linkState: 'pending' as const, linkPlatform: socialPlatform.name,
      }])
      setPendingReply(null)
      return
    }

    // Split on /brb Nsec and /timer N tokens — each becomes its own bubble (same as mockup)
    const parts = text
      .split(/(\/brb \d+sec|\/timer \d+(?:sec)?)/g)
      .map(p => p.trim())
      .filter(p => p.length > 0)

    const outgoing = parts.map((part, index) => {
      const id = crypto.randomUUID()
      const replaid = index === 0 ? (pendingReply || '') : ''
      socket.emit('send_message', { text: part, id, replyTo: replaid })
      return newMsg({ id, text: part, direction: 'outgoing', replaid })
    })

    setMessages(prev => [...prev, ...outgoing])
    setPendingReply(null)
  }

  function handleReact(msgId: string, emoji: string) {
    // emoji = '' means clear
    socket.emit('react', { messageId: msgId, emoji: emoji || null })
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, myReaction: emoji } : m
    ))
  }

  function handleTyping() {
    if (screen === 'chat') socket.emit('typing')
  }

  return (
    <>
      <LiveIndicator count={onlineCount} />
      <main className={mainClass[screen]}>
        <Header
          filterOpen={filterOpen}
          iAm={iAm}
          lookingFor={lookingFor}
          dimmed={filterOpen}
          onFilterToggle={() => setFilterOpen(o => !o)}
          onIAmChange={setIAm}
          onLookingForChange={setLookingFor}
          onFindNext={handleFindNext}
          onBlock={handleBlock}
          onLeave={handleLeave}
        />

        {screen === 'start'     && <StartScreen onStart={handleStart} />}
        {screen === 'searching' && <SearchingScreen notice={null} />}
        {screen === 'chat' && (
          <ChattingScreen
            messages={messages}
            matchTime={matchTime}
            isTyping={isPartnerTyping}
            partnerLeft={partnerLeft}
            onFindNext={handleFindNext}
            onReact={handleReact}
            onReply={setPendingReply}
          />
        )}

        <Chatbox
          onSend={handleSend}
          onTyping={handleTyping}
          canSend={screen === 'chat'}
          pendingReply={pendingReply}
          onClearReply={() => setPendingReply(null)}
        />
      </main>
    </>
  )
}
