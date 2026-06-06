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

  // ── socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    function onSearching() {
      setScreen('searching')
    }

    function onMatched(_: { roomId: string }) {
      const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      setMatchTime(now)
      setMessages([])
      setFilterOpen(false)
      setIsPartnerTyping(false)
      setPartnerLeft(false)
      setPendingReply(null)
      setScreen('chat')
    }

    function onMessage({ text, id, replaid }: { text: string; id: string; replaid?: string }) {
      setMessages(prev => [...prev, newMsg({ id, text, direction: 'incoming', replaid: replaid || '' })])
    }

    function onPartnerReacted({ messageId, emoji }: { messageId: string; emoji: string | null }) {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, theirReaction: emoji ?? '' } : m
      ))
    }

    function onPartnerLeft() {
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

    socket.on('searching',       onSearching)
    socket.on('matched',         onMatched)
    socket.on('message',         onMessage)
    socket.on('partner_left',    onPartnerLeft)
    socket.on('partner_typing',  onPartnerTyping)
    socket.on('connected_count', onConnectedCount)
    socket.on('partner_reacted', onPartnerReacted)
    socket.on('error',           onError)

    return () => {
      socket.off('searching',       onSearching)
      socket.off('matched',         onMatched)
      socket.off('message',         onMessage)
      socket.off('partner_left',    onPartnerLeft)
      socket.off('partner_typing',  onPartnerTyping)
      socket.off('connected_count', onConnectedCount)
      socket.off('partner_reacted', onPartnerReacted)
      socket.off('error',           onError)
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
    const id = crypto.randomUUID()
    const replaid = pendingReply || ''
    socket.emit('send_message', { text, id, replaid })
    setMessages(prev => [...prev, newMsg({ id, text, direction: 'outgoing', replaid })])
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
