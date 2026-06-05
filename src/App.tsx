import { useEffect, useRef, useState } from 'react'
import { socket } from './socket'
import Header from './components/Header'
import StartScreen from './components/StartScreen'
import SearchingScreen from './components/SearchingScreen'
import ChattingScreen from './components/ChattingScreen'
import Chatbox from './components/Chatbox'
import LiveIndicator from './components/LiveIndicator'
import type { Msg } from './types'

type Screen = 'start' | 'searching' | 'chat'
type FilterGender = 'male' | 'female' | 'any'

const toSocket = (g: FilterGender) => g === 'male' ? 'm' : g === 'female' ? 'f' : 'any'

const mainClass: Record<Screen, string> = {
  start:     'fresh-show',
  searching: 'searching-show',
  chat:      'chat_area-show',
}

export default function App() {
  const [screen, setScreen]       = useState<Screen>('start')
  const [iAm, setIAm]             = useState<FilterGender>('any')
  const [lookingFor, setLookingFor] = useState<FilterGender>('any')
  const [filterOpen, setFilterOpen] = useState(true)
  const [messages, setMessages]   = useState<Msg[]>([])
  const [matchTime, setMatchTime]         = useState('')
  const [notice, setNotice]               = useState<string | null>(null)
  const [isPartnerTyping, setIsPartnerTyping] = useState(false)
  const [onlineCount, setOnlineCount]         = useState(0)
  const [partnerLeft, setPartnerLeft]     = useState(false)
  const typingClearRef                    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── socket lifecycle ──────────────────────────────────────────────────────
  useEffect(() => {
    function onSearching() {
      setScreen('searching')
    }

    function onMatched(_: { roomId: string }) {
      const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      setMatchTime(now)
      setMessages([])
      setNotice(null)
      setFilterOpen(false)
      setIsPartnerTyping(false)
      setPartnerLeft(false)
      setScreen('chat')
    }

    function onMessage({ text, id }: { text: string; id: string }) {
      setMessages(prev => [...prev, { id, text, fromMe: false }])
    }

    function onPartnerReacted({ messageId, emoji }: { messageId: string; emoji: string | null }) {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, partnerReaction: emoji ?? undefined } : m
      ))
    }

    function onPartnerLeft() {
      setIsPartnerTyping(false)
      setPartnerLeft(true)
      // Stay on chat screen — user sees the bubble and decides when to search again
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

    socket.on('searching',         onSearching)
    socket.on('matched',           onMatched)
    socket.on('message',           onMessage)
    socket.on('partner_left',      onPartnerLeft)
    socket.on('partner_typing',    onPartnerTyping)
    socket.on('connected_count',   onConnectedCount)
    socket.on('partner_reacted',   onPartnerReacted)
    socket.on('error',             onError)

    return () => {
      socket.off('searching',        onSearching)
      socket.off('matched',          onMatched)
      socket.off('message',          onMessage)
      socket.off('partner_left',     onPartnerLeft)
      socket.off('partner_typing',   onPartnerTyping)
      socket.off('connected_count',  onConnectedCount)
      socket.off('partner_reacted',  onPartnerReacted)
      socket.off('error',            onError)
    }
  }, [])

  // ── action handlers ───────────────────────────────────────────────────────
  function handleStart() {
    socket.emit('set_filter', { iAm: toSocket(iAm), lookingFor: toSocket(lookingFor) })
    socket.emit('start_search')
  }

  function handleFindNext() {
    setFilterOpen(false)
    setMessages([])
    setPartnerLeft(false)
    socket.emit('set_filter', { iAm: toSocket(iAm), lookingFor: toSocket(lookingFor) })
    if (partnerLeft) {
      // Partner already left — server session is idle, skip straight to start_search
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
    socket.emit('set_filter', { iAm: toSocket(iAm), lookingFor: toSocket(lookingFor) })
    socket.emit('block')
    setScreen('searching')
  }

  function handleLeave() {
    socket.emit('leave')
    setScreen('start')
    setMessages([])
    setNotice(null)
    setFilterOpen(false)
    setPartnerLeft(false)
  }

  function handleSend(text: string) {
    if (screen !== 'chat') return
    const id = crypto.randomUUID()
    socket.emit('send_message', { text, id })
    setMessages(prev => [...prev, { id, text, fromMe: true }])
  }

  function handleReact(msgId: string, emoji: string | null) {
    socket.emit('react', { messageId: msgId, emoji })
    setMessages(prev => prev.map(m =>
      m.id === msgId ? { ...m, myReaction: emoji ?? undefined } : m
    ))
  }

  function handleTyping() {
    if (screen === 'chat') socket.emit('typing')
  }

  function handleFilterToggle() {
    setFilterOpen(o => !o)
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
        onFilterToggle={handleFilterToggle}
        onIAmChange={setIAm}
        onLookingForChange={setLookingFor}
        onFindNext={handleFindNext}
        onBlock={handleBlock}
        onLeave={handleLeave}
      />

      {screen === 'start'     && <StartScreen onStart={handleStart} />}
      {screen === 'searching' && <SearchingScreen notice={notice} />}
      {screen === 'chat' && (
        <ChattingScreen
          messages={messages}
          matchTime={matchTime}
          isTyping={isPartnerTyping}
          partnerLeft={partnerLeft}
          onFindNext={handleFindNext}
          onReact={handleReact}
        />
      )}

      <Chatbox onSend={handleSend} onTyping={handleTyping} canSend={screen === 'chat'} />
    </main>
    </>
  )
}
