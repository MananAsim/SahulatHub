'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
// Reusing the same CSS module for consistent design
import styles from '@/app/client/job/[id]/chat/page.module.css';
import { FaPaperPlane, FaArrowLeft, FaEllipsisV, FaImage } from 'react-icons/fa';

export default function WorkerChatPage({ params }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Dummy Initial State (Opposite perspective of the client)
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi, I'm on my way to your location.", sender: 'myMessage', time: '10:05 AM' },
        { id: 2, text: "Great, please let me know when you arrive.", sender: 'theirMessage', time: '10:07 AM' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    if (loading || !user) return <div className="section text-center">Loading Chat...</div>;

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMsg = {
            id: Date.now(),
            text: inputValue,
            sender: 'myMessage',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMsg]);
        setInputValue('');

        // Simulate client typing back
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "Okay perfect, see you soon.",
                sender: 'theirMessage',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 2500);
    };

    return (
        <div className={styles.container}>
            <div className={styles.chatBox}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button className={styles.backBtn} onClick={() => router.push(`/worker/dashboard`)}>
                            <FaArrowLeft />
                        </button>
                        <div className={styles.avatar}>
                            <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--primary-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                A
                            </div>
                        </div>
                        <div className={styles.userInfo}>
                            <h2>Aisha K. (Client)</h2>
                            <p className={styles.status}>Online</p>
                        </div>
                    </div>
                    <button className={styles.menuBtn}><FaEllipsisV /></button>
                </div>

                <div className={styles.messageArea}>
                    <div className={styles.dateDivider}>Today</div>

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.messageWrapper} ${styles[msg.sender]}`}
                        >
                            <div className={styles.messageBubble}>
                                <p>{msg.text}</p>
                                <span className={styles.time}>{msg.time}</span>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className={`${styles.messageWrapper} ${styles.theirMessage}`}>
                            <div className={`${styles.messageBubble} ${styles.typingIndicator}`}>
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form className={styles.inputArea} onSubmit={handleSend}>
                    <button type="button" className={styles.attachBtn}><FaImage /></button>
                    <input
                        type="text"
                        placeholder="Type a message to the client..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button
                        type="submit"
                        className={styles.sendBtn}
                        disabled={!inputValue.trim()}
                    >
                        <FaPaperPlane />
                    </button>
                </form>
            </div>
        </div>
    );
}
