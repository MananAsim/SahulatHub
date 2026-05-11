'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CALL_GUIDANCE_SCRIPTS } from '@/lib/chatKnowledge';
import styles from './AIChatbot.module.css';

// ─── Icons ────────────────────────────────────────────────────────────────────
const SahalIcon = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="orb-gradient" x1="10%" y1="0%" x2="90%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="40%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="orb-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <radialGradient id="orb-glow" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="rgba(167,139,250,0.6)" />
                <stop offset="100%" stopColor="rgba(167,139,250,0)" />
            </radialGradient>
            <filter id="glass-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#3b82f6" floodOpacity="0.5"/>
            </filter>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#orb-glow)" />
        <circle cx="32" cy="32" r="24" fill="url(#orb-gradient)" filter="url(#drop-shadow)" />
        <ellipse cx="32" cy="18" rx="16" ry="8" fill="url(#orb-highlight)" opacity="0.7" filter="url(#glass-blur)" />
        <path d="M 12 32 A 20 20 0 0 0 52 32 A 22 22 0 0 1 12 32 Z" fill="rgba(255,255,255,0.2)" />
        <g opacity="0.95">
            <circle cx="32" cy="32" r="7" fill="#fff" filter="url(#glass-blur)"/>
            <circle cx="32" cy="32" r="3.5" fill="#fff" />
            <path d="M32 18 L32 26 M32 38 L32 46 M18 32 L26 32 M38 32 L46 32 M22 22 L27 27 M42 42 L37 37 M42 22 L37 27 M22 42 L27 37" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
            <circle cx="32" cy="18" r="2" fill="#fff" />
            <circle cx="32" cy="46" r="2" fill="#fff" />
            <circle cx="18" cy="32" r="2" fill="#fff" />
            <circle cx="46" cy="32" r="2" fill="#fff" />
            <circle cx="22" cy="22" r="1.5" fill="#fff" />
            <circle cx="42" cy="42" r="1.5" fill="#fff" />
            <circle cx="42" cy="22" r="1.5" fill="#fff" />
            <circle cx="22" cy="42" r="1.5" fill="#fff" />
        </g>
    </svg>
);

const SendIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>);
const MicIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>);
const MicOffIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /></svg>);
const VolumeIcon = ({ muted }) => muted
    ? (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>)
    : (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>);
const CloseIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
const ChevronIcon = ({ dir }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" style={{ transform: dir === 'left' ? 'rotate(180deg)' : 'none', display: 'block' }}><polyline points="9 18 15 12 9 6" /></svg>);
const CopyIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>);
const ImageIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>);

const CLIENT_CHIPS = ['Book a plumber now', 'Check my job status', "Worker hasn't arrived", 'Who built SahulatHub?', 'How does payment work?'];
const WORKER_CHIPS = ['How do I receive jobs?', 'View my earnings', 'Improve my rating', 'Handle a difficult client', 'Update my profile'];
const TABS = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'voice', label: 'Voice', icon: '🎙️' },
    { id: 'guide', label: 'Call Guide', icon: '📞' },
];

export default function AIChatbot({ role: propRole }) {
    const { role: authRole, getAuthToken } = useAuth() || {};
    const role = propRole || authRole || 'client';

    const [isOpen, setIsOpen] = useState(false);
    const [tab, setTab] = useState('chat');
    const [messages, setMessages] = useState([{
        id: 0, role: 'assistant', ts: Date.now(),
        content: role === 'worker'
            ? `Assalam o Alaikum! I'm **Sahal**, your SahulatHub AI Agent 🤖\n\nI can check your jobs, guide you through client calls, and answer any platform questions. What do you need?`
            : `Hi! I'm **Sahal** — your SahulatHub AI Agent 👋\n\nI can **book services for you**, check your job status, analyze photos of your home problems, and much more. Just ask or upload an image!`,
    }]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [tts, setTts] = useState(true);
    const [guideStep, setGuideStep] = useState(0);
    const [copied, setCopied] = useState(null);
    const [hasOpened, setHasOpened] = useState(false);
    const [source, setSource] = useState(null);
    // Image upload state
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [voiceStatus, setVoiceStatus] = useState('idle'); // idle | recording | transcribing | done

    const endRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const scripts = CALL_GUIDANCE_SCRIPTS[role] || CALL_GUIDANCE_SCRIPTS.client;
    const chips = role === 'worker' ? WORKER_CHIPS : CLIENT_CHIPS;

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
    useEffect(() => { if (isOpen) { setHasOpened(true); if (tab === 'chat') setTimeout(() => inputRef.current?.focus(), 350); } }, [isOpen, tab]);

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

    // ── Image upload ──────────────────────────────────────────────────────────
    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setImageBase64(ev.target.result); // data URL = base64
            setImagePreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const clearImage = () => { setImageBase64(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

    // ── Whisper Voice Recording ───────────────────────────────────────────────
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunksRef.current = [];
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                setVoiceStatus('transcribing');
                setIsTranscribing(true);
                try {
                    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const fd = new FormData();
                    fd.append('audio', blob, 'voice.webm');
                    const res = await fetch('/api/chat/voice', { method: 'POST', body: fd });
                    const data = await res.json();
                    if (data.text) {
                        setInput(data.text);
                        setVoiceStatus('done');
                        setTab('chat');
                        setTimeout(() => inputRef.current?.focus(), 300);
                    } else {
                        setVoiceStatus('idle');
                    }
                } catch {
                    setVoiceStatus('idle');
                } finally {
                    setIsTranscribing(false);
                }
            };
            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
            setVoiceStatus('recording');
        } catch {
            alert('Microphone access denied. Please allow microphone access in your browser.');
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const toggleRecording = () => { isRecording ? stopRecording() : startRecording(); };

    // ── Send ──────────────────────────────────────────────────────────────────
    const send = useCallback(async (text) => {
        const content = (text ?? input).trim();
        if ((!content && !imageBase64) || loading) return;
        setInput('');

        const displayContent = imageBase64 ? (content || '📎 Image uploaded — please analyze this.') : content;
        const userMsg = { id: Date.now(), role: 'user', content: displayContent, ts: Date.now(), hasImage: !!imageBase64 };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true); setSource(null);

        const capturedImage = imageBase64;
        clearImage();

        const history = [...messages, userMsg].slice(-10).map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant', content: m.content,
        }));

        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history, role, token, image_base64: capturedImage || undefined }),
            });
            const data = await res.json();
            const reply = data.message || "I'm having trouble right now. Please try again.";
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: reply, ts: Date.now(), src: data.source }]);
            setSource(data.source);
            speak(reply);
        } catch {
            setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Connection issue. Please try again.', ts: Date.now() }]);
        } finally { setLoading(false); }
    }, [input, imageBase64, loading, messages, role, getAuthToken, speak]);

    const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
    const copy = (text, id) => { navigator.clipboard.writeText(text).then(() => { setCopied(id); setTimeout(() => setCopied(null), 2000); }); };
    const fmt = t => t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
    const clearChat = () => setMessages([{ id: Date.now(), role: 'assistant', content: "Chat cleared! I'm Sahal — how can I help you today?", ts: Date.now() }]);

    const sourceLabel = source === 'groq' ? '⚡ Llama 3.3' : source === 'groq_vision' ? '👁️ Vision AI' : '🟢 Online';

    return (
        <>
            {/* FAB */}
            <button id="sahal-fab" className={`${styles.fab} ${!hasOpened ? styles.fabIdle : ''} ${isOpen ? styles.fabClose : ''}`}
                onClick={() => setIsOpen(o => !o)} aria-label="Open Sahal AI Agent">
                {isOpen ? <CloseIcon /> : <>
                    <div className={styles.fabOrb} />
                    <div className={styles.fabIcon}><SahalIcon size={28} /></div>
                    {messages.length > 1 && <span className={styles.fabBadge}>{Math.min(messages.filter(m => m.role === 'assistant').length - 1, 9)}</span>}
                </>}
            </button>

            {/* Panel */}
            <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`} role="dialog" aria-label="Sahal AI Agent">

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
                                <div className={styles.hName}>Sahal <span className={styles.hBadge}>Agent</span></div>
                                <div className={styles.hSub}>{sourceLabel} · SahulatHub AI</div>
                            </div>
                        </div>
                        <div className={styles.hActions}>
                            <button className={styles.hBtn} onClick={() => setTts(v => !v)} title={tts ? 'Mute' : 'Unmute'}><VolumeIcon muted={!tts} /></button>
                            <button className={styles.hBtn} onClick={clearChat} title="Clear chat">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.31" /></svg>
                            </button>
                            <button className={styles.hBtn} onClick={() => setIsOpen(false)} title="Close"><CloseIcon /></button>
                        </div>
                    </div>
                    <div className={styles.tabs}>
                        {TABS.map(t => (
                            <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>
                                <span>{t.icon}</span>{t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Chat Tab ──────────────────────────────────────────────── */}
                {tab === 'chat' && (<>
                    {messages.length <= 1 && (
                        <div className={styles.chips}>
                            {chips.map((c, i) => (<button key={i} className={styles.chip} onClick={() => send(c)}>{c}</button>))}
                        </div>
                    )}
                    <div className={styles.msgs}>
                        {messages.map(m => (
                            <div key={m.id} className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : styles.msgAI}`}>
                                {m.role === 'assistant' && <div className={styles.aAvatar}><SahalIcon size={14} /></div>}
                                <div className={styles.bubble}>
                                    {m.hasImage && <div className={styles.imgAttachment}>📎 Image attached</div>}
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
                                <div className={styles.bubble}><div className={styles.dots}><span /><span /><span /></div></div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Image preview strip */}
                    {imagePreview && (
                        <div className={styles.imagePreviewStrip}>
                            <img src={imagePreview} alt="upload preview" className={styles.imageThumb} />
                            <span className={styles.imagePreviewLabel}>Image ready to analyze</span>
                            <button className={styles.removeImageBtn} onClick={clearImage}>✕</button>
                        </div>
                    )}

                    <div className={styles.input}>
                        {/* Hidden file input */}
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} id="image-upload-input" />
                        <button className={`${styles.micBtn} ${imagePreview ? styles.micActive : ''}`} onClick={() => fileInputRef.current?.click()} title="Upload image for AI diagnosis" id="image-upload-btn">
                            <ImageIcon />
                        </button>
                        <textarea ref={inputRef} id="chat-input" className={styles.textarea}
                            placeholder={imagePreview ? 'Describe the issue or just send the image...' : 'Ask Sahal to book a service, check your jobs...'}
                            value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} rows={1} />
                        <button id="send-btn" className={`${styles.sendBtn} ${(input.trim() || imageBase64) && !loading ? styles.sendActive : ''}`}
                            onClick={() => send()} disabled={(!input.trim() && !imageBase64) || loading}>
                            <SendIcon />
                        </button>
                    </div>
                </>)}

                {/* ── Voice Tab (Whisper-powered) ───────────────────────────── */}
                {tab === 'voice' && (
                    <div className={styles.voiceTab}>
                        <div className={styles.voiceOrbWrap} onClick={toggleRecording} id="voice-orb">
                            <div className={`${styles.vRing} ${isRecording ? styles.vRingOn : ''}`} />
                            <div className={`${styles.vRing2} ${isRecording ? styles.vRingOn : ''}`} />
                            <div className={`${styles.vCore} ${isRecording ? styles.vCoreOn : ''}`}>
                                {isRecording ? <MicOffIcon /> : <MicIcon />}
                            </div>
                        </div>
                        <p className={styles.vStatus}>
                            {isRecording ? '🔴 Recording... tap to stop' :
                             isTranscribing ? '⚡ Transcribing with Whisper AI...' :
                             voiceStatus === 'done' ? '✅ Done! Check the Chat tab.' :
                             'Tap to speak — Whisper AI will transcribe'}
                        </p>
                        {input && voiceStatus === 'done' && (
                            <div className={styles.vTranscript}>
                                <p>"{input}"</p>
                                <button id="voice-send-btn" className={styles.vSend} onClick={() => { setTab('chat'); send(input); }}>
                                    Send to Sahal →
                                </button>
                            </div>
                        )}
                        <div className={styles.vPowered}>⚡ Powered by Groq Whisper Large V3 Turbo</div>
                        <label className={styles.vToggle}>
                            <input type="checkbox" checked={tts} onChange={e => setTts(e.target.checked)} />
                            <span className={styles.vSlider} />
                            <span>Sahal speaks responses aloud</span>
                        </label>
                    </div>
                )}

                {/* ── Call Guide Tab ─────────────────────────────────────────── */}
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
                            <div className={styles.stepTip}><span>💡</span><p>{scripts[guideStep].tip}</p></div>
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
                    <span>Powered by <strong>⚡ Groq (Llama 3.3 · Vision · Whisper)</strong> · SahulatHub AI</span>
                </div>
            </div>

            {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)} />}
        </>
    );
}
