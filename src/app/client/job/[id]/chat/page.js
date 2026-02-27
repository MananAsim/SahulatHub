'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { FaPaperPlane, FaArrowLeft, FaEllipsisV, FaImage } from 'react-icons/fa';

export default function ClientChatPage({ params }) {
    const { id } = use(params);
    const { user, loading, role } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi, I'm on my way to your location.", sender: 'worker', time: '10:05 AM' },
        { id: 2, text: "Great, please let me know when you arrive.", sender: 'client', time: '10:07 AM' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
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
            sender: 'client',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMsg]);
        setInputValue('');

        // Simulate worker typing back
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: "I should be there in about 5 minutes.",
                sender: 'worker',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 2500);
    };

    return (
        <div className={styles.container}>
            <div className={styles.chatBox}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <button className={styles.backBtn} onClick={() => router.push(`/client/job/${id}`)}>
                            <FaArrowLeft />
                        </button>
                        <div className={styles.avatar}>
                            <img src="https://ui-avatars.com/api/?name=Ali+Hassan&background=0D8ABC&color=fff" alt="Worker" />
                        </div>
                        <div className={styles.userInfo}>
                            <h2>Ali Hassan</h2>
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
                            className={`${styles.messageWrapper} ${msg.sender === 'client' ? styles.myMessage : styles.theirMessage}`}
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
                        placeholder="Type a message..."
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
