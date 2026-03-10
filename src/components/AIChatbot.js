'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CALL_GUIDANCE_SCRIPTS } from '@/lib/chatKnowledge';
import styles from './AIChatbot.module.css';

// ─── Animated Sahal Brand Icon ────────────────────────────────────────────────
const SahalIcon = ({ size = 24, animated = false }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={animated ? styles.iconSpin : ''}>
        <defs>
            <linearGradient id="sahal-g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="50%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="sahal-g2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
        </defs>
        {/* Outer diamond ring */}
        <path d="M24 3L45 24L24 45L3 24Z" stroke="url(#sahal-g1)" strokeWidth="1.5" fill="none" opacity="0.6" />
        {/* Inner octagon */}
        <path d="M24 10L36 18V30L24 38L12 30V18Z" stroke="url(#sahal-g1)" strokeWidth="1.5" fill="rgba(167,139,250,0.08)" />
        {/* Center neural nodes */}
        <circle cx="24" cy="16" r="2" fill="url(#sahal-g1)" />
        <circle cx="32" cy="24" r="2" fill="url(#sahal-g1)" />
        <circle cx="24" cy="32" r="2" fill="url(#sahal-g1)" />
        <circle cx="16" cy="24" r="2" fill="url(#sahal-g1)" />
        {/* Center sparkle */}
        <circle cx="24" cy="24" r="4" fill="url(#sahal-g1)" />
        <circle cx="24" cy="24" r="2" fill="white" opacity="0.9" />
        {/* Connecting lines */}
        <line x1="24" y1="18" x2="24" y2="20" stroke="url(#sahal-g1)" strokeWidth="1" opacity="0.8" />
        <line x1="30" y1="24" x2="28" y2="24" stroke="url(#sahal-g1)" strokeWidth="1" opacity="0.8" />
        <line x1="24" y1="30" x2="24" y2="28" stroke="url(#sahal-g1)" strokeWidth="1" opacity="0.8" />
        <line x1="18" y1="24" x2="20" y2="24" stroke="url(#sahal-g1)" strokeWidth="1" opacity="0.8" />
        {/* Spark dots */}
        <circle cx="38" cy="12" r="1.5" fill="#a78bfa" opacity="0.7" />
        <circle cx="10" cy="36" r="1.5" fill="#60a5fa" opacity="0.7" />
        <circle cx="10" cy="12" r="1.5" fill="#34d399" opacity="0.7" />
        <circle cx="38" cy="36" r="1.5" fill="#f472b6" opacity="0.7" />
    </svg>
);

const SendIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);
const MicIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);
const MicOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
    </svg>
);
const VolumeIcon = ({ muted }) => muted ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
);
const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const ChevronIcon = ({ dir }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
        style={{ transform: dir === 'left' ? 'rotate(180deg)' : 'none', display: 'block' }}>
        <polyline points="9 18 15 12 9 6" />
    </svg>
);
const CopyIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const CLIENT_CHIPS = ['How do I book a service?', 'Track my job status', 'Worker hasn\'t arrived', 'How does payment work?', 'Cancel my booking'];
const WORKER_CHIPS = ['How do I receive jobs?', 'View my earnings', 'Improve my rating', 'Handle a difficult client', 'Update my profile'];

const TABS = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'voice', label: 'Voice', icon: '🎙️' },
    { id: 'guide', label: 'Call Guide', icon: '📞' },
];

export default function AIChatbot({ role: propRole }) {
    const { role: authRole } = useAuth() || {};
    const role = propRole || authRole || 'client';

    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState('chat');
    const [messages, setMessages] = useState([{
        id: 0,
        role: 'assistant',
        content: role === 'worker'
            ? `Assalam o Alaikum! I'm **Sahal**, your SahulatHub AI specialist.\n\nI'm here to help you navigate jobs, earnings, client communication, and anything else on the platform. What can I help you with today?`
            : `Hi there! I'm **Sahal**, your SahulatHub support specialist 👋\n\nI can help you book services, track jobs, understand pricing, resolve issues, and navigate the platform — just like a real support agent. What do you need help with?`,
        ts: Date.now(),
    }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [listening, setListening] = useState(false);
    const [tts, setTts] = useState(true);
    const [guideStep, setGuideStep] = useState(0);
    const [sessionId] = useState(() => `s-${Date.now()}`);
    const [copied, setCopied] = useState(null);
    const [hasOpened, setHasOpened] = useState(false);
    const [source, setSource] = useState(null);

    const endRef = useRef(null);
    const inputRef = useRef(null);
    const recRef = useRef(null);

    const scripts = CALL_GUIDANCE_SCRIPTS[role] || CALL_GUIDANCE_SCRIPTS.client;
    const chips = role === 'worker' ? WORKER_CHIPS : CLIENT_CHIPS;

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
    useEffect(() => {
        if (isOpen) {
            setHasOpened(true);
            if (tab === 'chat') setTimeout(() => inputRef.current?.focus(), 350);
        }
    }, [isOpen, tab]);

    // ── STT ───────────────────────────────────────────────────────────────────
    const toggleListen = useCallback(() => {
        if (listening) { recRef.current?.stop(); setListening(false); return; }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return alert('Voice input requires Chrome or Edge browser.');
        const r = new SR();
        r.continuous = false; r.interimResults = true; r.lang = 'en-US';
        r.onresult = e => setInput(Array.from(e.results).map(x => x[0].transcript).join(''));
        r.onend = () => setListening(false);
        r.onerror = () => setListening(false);
        recRef.current = r; r.start(); setListening(true);
    }, [listening]);

    // ── TTS ───────────────────────────────────────────────────────────────────
    const speak = useCallback((text) => {
        if (!tts || typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text.replace(/\*\*/g, '').replace(/\n/g, ' '));
        u.rate = 0.95; u.pitch = 1;
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name.includes('Natural') || v.name.includes('Neural') || v.lang === 'en-US') || voices[0];
        if (voice) u.voice = voice;
        window.speechSynthesis.speak(u);
    }, [tts]);

    // ── Send ──────────────────────────────────────────────────────────────────
    const send = useCallback(async (text) => {
        const content = (text ?? input).trim();
        if (!content || loading) return;
        setInput(''); recRef.current?.stop(); setListening(false);

        const userMsg = { id: Date.now(), role: 'user', content, ts: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true); setSource(null);

        const history = [...messages, userMsg].slice(-10).map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant', content: m.content,
        }));

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history, role, sessionId }),
            });
            const data = await res.json();
            const reply = data.message || "I'm having trouble right now. Please try again in a moment.";
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: reply, ts: Date.now(), src: data.source }]);
            setSource(data.source);
            speak(reply);
        } catch {
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: "Connection issue. Make sure Ollama is running: `ollama serve`", ts: Date.now() }]);
        } finally { setLoading(false); }
    }, [input, loading, messages, role, sessionId, speak]);

    const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

    const copy = (text, id) => {
        navigator.clipboard.writeText(text).then(() => { setCopied(id); setTimeout(() => setCopied(null), 2000); });
    };

    const fmt = t => t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

    const clearChat = () => setMessages([{
        id: Date.now(), role: 'assistant',
        content: "Chat cleared! I'm Sahal — how can I help you today?", ts: Date.now(),
    }]);

    return (
        <>
            {/* ── FAB ─────────────────────────────────────────────────────────── */}
            <button
                id="sahal-fab"
                className={`${styles.fab} ${!hasOpened ? styles.fabIdle : ''} ${isOpen ? styles.fabClose : ''}`}
                onClick={() => setIsOpen(o => !o)}
                aria-label="Open Sahal AI Support"
            >
                {isOpen
                    ? <CloseIcon />
                    : <>
                        <div className={styles.fabOrb} />
                        <div className={styles.fabIcon}><SahalIcon size={28} /></div>
                        {messages.length > 1 && !isOpen && (
                            <span className={styles.fabBadge}>{Math.min(messages.filter(m => m.role === 'assistant').length - 1, 9)}</span>
                        )}
                    </>
                }
            </button>

            {/* ── Panel ────────────────────────────────────────────────────────── */}
            <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`} role="dialog" aria-label="Sahal AI Assistant">

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerBg} />
                    <div className={styles.headerContent}>
                        <div className={styles.headerLeft}>
                            <div className={styles.hAvatar}>
                                <SahalIcon size={22} />
                                <span className={styles.hDot} />
                            </div>
                            <div className={styles.hInfo}>
                                <div className={styles.hName}>Sahal <span className={styles.hBadge}>AI</span></div>
                                <div className={styles.hSub}>
                                    {source === 'n8n' ? '⚡ n8n' : source === 'ollama' ? '🦙 Ollama' : '🟢 Online'} · SahulatHub Support
                                </div>
                            </div>
                        </div>
                        <div className={styles.hActions}>
                            <button className={styles.hBtn} onClick={() => setTts(v => !v)} title={tts ? 'Mute' : 'Unmute'}>
                                <VolumeIcon muted={!tts} />
                            </button>
                            <button className={styles.hBtn} onClick={clearChat} title="Clear chat">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.31" />
                                </svg>
                            </button>
                            <button className={styles.hBtn} onClick={() => setIsOpen(false)} title="Close">
                                <CloseIcon />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className={styles.tabs}>
                        {TABS.map(t => (
                            <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>
                                <span>{t.icon}</span>{t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Chat ─────────────────────────────────────────────────────── */}
                {tab === 'chat' && (
                    <>
                        {messages.length <= 1 && (
                            <div className={styles.chips}>
                                {chips.map((c, i) => (
                                    <button key={i} className={styles.chip} onClick={() => send(c)}>{c}</button>
                                ))}
                            </div>
                        )}
                        <div className={styles.msgs}>
                            {messages.map(m => (
                                <div key={m.id} className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : styles.msgAI}`}>
                                    {m.role === 'assistant' && (
                                        <div className={styles.aAvatar}><SahalIcon size={14} /></div>
                                    )}
                                    <div className={styles.bubble}>
                                        <div className={styles.bubbleText} dangerouslySetInnerHTML={{ __html: fmt(m.content) }} />
                                        <div className={styles.bubbleMeta}>
                                            <span>{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {m.role === 'assistant' && m.id !== 0 && (
                                                <button className={styles.copyBtn} onClick={() => copy(m.content, m.id)}>
                                                    {copied === m.id ? '✓' : <CopyIcon />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className={`${styles.msg} ${styles.msgAI}`}>
                                    <div className={styles.aAvatar}><SahalIcon size={14} /></div>
                                    <div className={styles.bubble}>
                                        <div className={styles.dots}><span /><span /><span /></div>
                                    </div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>
                        <div className={styles.input}>
                            <button id="mic-btn" className={`${styles.micBtn} ${listening ? styles.micActive : ''}`} onClick={toggleListen}>
                                {listening ? <MicOffIcon /> : <MicIcon />}
                            </button>
                            <textarea
                                ref={inputRef} id="chat-input"
                                className={styles.textarea}
                                placeholder={listening ? '🎙️ Listening...' : 'Ask Sahal anything...'}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={onKey}
                                rows={1}
                            />
                            <button
                                id="send-btn"
                                className={`${styles.sendBtn} ${input.trim() && !loading ? styles.sendActive : ''}`}
                                onClick={() => send()} disabled={!input.trim() || loading}
                            >
                                <SendIcon />
                            </button>
                        </div>
                    </>
                )}

                {/* ── Voice ────────────────────────────────────────────────────── */}
                {tab === 'voice' && (
                    <div className={styles.voiceTab}>
                        <div className={styles.voiceOrbWrap} onClick={toggleListen} id="voice-orb">
                            <div className={`${styles.vRing} ${listening ? styles.vRingOn : ''}`} />
                            <div className={`${styles.vRing2} ${listening ? styles.vRingOn : ''}`} />
                            <div className={`${styles.vCore} ${listening ? styles.vCoreOn : ''}`}>
                                {listening ? <MicOffIcon /> : <MicIcon />}
                            </div>
                        </div>
                        <p className={styles.vStatus}>{listening ? '🔴 Listening... speak your question' : 'Tap to start speaking'}</p>
                        {input && (
                            <div className={styles.vTranscript}>
                                <p>"{input}"</p>
                                <button id="voice-send-btn" className={styles.vSend} onClick={() => { setTab('chat'); send(input); }}>
                                    Send to Sahal →
                                </button>
                            </div>
                        )}
                        <label className={styles.vToggle}>
                            <input type="checkbox" checked={tts} onChange={e => setTts(e.target.checked)} />
                            <span className={styles.vSlider} />
                            <span>AI speaks responses aloud</span>
                        </label>
                        <p className={styles.vHint}>💡 Voice requires Chrome or Edge. Works best in English.</p>
                    </div>
                )}

                {/* ── Call Guide ──────────────────────────────────────────────── */}
                {tab === 'guide' && (
                    <div className={styles.guideTab}>
                        <div className={styles.guideHeader}>
                            <div className={styles.guideHeaderIcon}>📞</div>
                            <div>
                                <p className={styles.guideTitle}>{role === 'worker' ? 'Worker Script Guide' : 'Client Call Guide'}</p>
                                <p className={styles.guideSub}>Professional scripts for every situation</p>
                            </div>
                        </div>

                        <div className={styles.stepTrack}>
                            {scripts.map((_, i) => (
                                <button key={i} className={`${styles.stepDot} ${i === guideStep ? styles.dotActive : i < guideStep ? styles.dotDone : ''}`}
                                    onClick={() => setGuideStep(i)} />
                            ))}
                        </div>

                        <div className={styles.stepCard}>
                            <div className={styles.stepTag}>Step {scripts[guideStep].step} of {scripts.length}</div>
                            <h4 className={styles.stepTitle}>{scripts[guideStep].title}</h4>
                            <p className={styles.stepBody}>{scripts[guideStep].content}</p>
                            <div className={styles.stepTip}>
                                <span>💡</span><p>{scripts[guideStep].tip}</p>
                            </div>
                            <button id={`copy-step-${guideStep}`} className={styles.copyScript}
                                onClick={() => copy(scripts[guideStep].content + '\n\nTip: ' + scripts[guideStep].tip, 'step')}>
                                {copied === 'step' ? '✓ Copied!' : <><CopyIcon /> Copy Script</>}
                            </button>
                        </div>

                        <div className={styles.guideNav}>
                            <button id="guide-prev" className={styles.navBtn} onClick={() => setGuideStep(s => Math.max(0, s - 1))} disabled={guideStep === 0}>
                                <ChevronIcon dir="left" /> Back
                            </button>
                            <span className={styles.navCount}>{guideStep + 1} / {scripts.length}</span>
                            <button id="guide-next" className={styles.navBtn} onClick={() => setGuideStep(s => Math.min(scripts.length - 1, s + 1))} disabled={guideStep === scripts.length - 1}>
                                Next <ChevronIcon dir="right" />
                            </button>
                        </div>

                        <button id="ask-sahal-btn" className={styles.askSahal} onClick={() => { setTab('chat'); send(`Give me personalized call guidance for a ${role} on SahulatHub`); }}>
                            💬 Get personalized advice from Sahal
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className={styles.footer}>
                    <span className={styles.footerDot} />
                    <span>Powered by <strong>🦙 Ollama</strong> · <strong>⚡ n8n</strong> · SahulatHub AI</span>
                </div>
            </div>

            {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)} />}
        </>
    );
}
