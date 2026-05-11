'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';
import { FaPaperPlane, FaArrowLeft, FaEllipsisV, FaImage } from 'react-icons/fa';

export default function ClientChatPage({ params }) {
    const { id } = use(params);
    const { user, loading } = useAuth();
    const router = useRouter();
    
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchChat = async () => {
        try {
            const res = await apiFetch(`/api/tasks/${id}/chat`);
            if (res.success) {
                setMessages(prev => {
                    // Only update if lengths differ to prevent re-renders
                    if (prev.length !== res.data.length) return res.data;
                    return prev;
                });
            }
        } catch (err) {
            console.error('Fetch chat error', err);
        }
    };

    useEffect(() => {
        fetchChat();
        const interval = setInterval(fetchChat, 3000);
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (loading || !user) return <div className="section text-center">Loading Chat...</div>;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const text = inputValue;
        setInputValue('');

        // Optimistic update
        setMessages(prev => [...prev, { _id: Date.now(), sender: 'client', text, timestamp: new Date() }]);

        try {
            const res = await apiFetch(`/api/tasks/${id}/chat`, {
                method: 'POST',
                body: JSON.stringify({ sender: 'client', text })
            });
            if (res.success) setMessages(res.data);
        } catch (err) {
            console.error('Send error', err);
        }
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
                            <img src="https://ui-avatars.com/api/?name=Worker&background=0D8ABC&color=fff" alt="Worker" />
                        </div>
                        <div className={styles.userInfo}>
                            <h2>Worker Chat</h2>
                            <p className={styles.status}>Live P2P</p>
                        </div>
                    </div>
                    <button className={styles.menuBtn}><FaEllipsisV /></button>
                </div>

                <div className={styles.messageArea}>
                    <div className={styles.dateDivider}>Today</div>

                    {messages.length === 0 && <div className="text-center text-sm text-gray-500 mt-4">Send a message to start chatting</div>}

                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`${styles.messageWrapper} ${msg.sender === 'client' ? styles.myMessage : styles.theirMessage}`}
                        >
                            <div className={styles.messageBubble}>
                                <p>{msg.text}</p>
                                <span className={styles.time}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
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
