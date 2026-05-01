import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react'
import { chatFollowUp } from '../../lib/ai'

export default function ChatPanel({ tripContext, noKey }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I'm your travel assistant for ${tripContext.destination}. Ask me anything — best restaurants, visa tips, local transport, packing advice, itinerary help, you name it.` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading || noKey) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const reply = await chatFollowUp(tripContext, messages, userMsg)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I ran into an error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const SUGGESTIONS = [
    'What should I pack?',
    'Best local restaurants?',
    'Do I need a visa?',
    'How to get around?',
  ]

  return (
    <div className="flex flex-col h-[600px] bg-white border border-sand">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 shrink-0 border flex items-center justify-center
              ${msg.role === 'assistant' ? 'border-terracotta/30 bg-terracotta/5' : 'border-ink/20 bg-ink/5'}`}>
              {msg.role === 'assistant' ? <Bot size={13} className="text-terracotta" /> : <User size={13} className="text-ink/50" />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 font-body text-sm leading-relaxed
              ${msg.role === 'assistant' ? 'bg-paper text-ink' : 'bg-ink text-paper'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 shrink-0 border border-terracotta/30 bg-terracotta/5 flex items-center justify-center">
              <Bot size={13} className="text-terracotta" />
            </div>
            <div className="bg-paper px-4 py-3 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin text-terracotta" />
              <span className="font-body text-sm text-ink/40">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => { setInput(s); }} className="font-body text-xs border border-sand px-3 py-1.5 hover:border-terracotta hover:text-terracotta transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-sand p-4 flex items-center gap-3">
        {noKey ? (
          <div className="flex-1 flex items-center gap-2 text-ink/30">
            <Sparkles size={14} />
            <span className="font-body text-sm">Add an API key in Settings to use chat.</span>
          </div>
        ) : (
          <>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about your trip…"
              rows={1}
              className="flex-1 resize-none input-field py-2.5 text-sm"
            />
            <button onClick={send} disabled={!input.trim() || loading} className="btn-primary p-2.5 shrink-0">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
