'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Card from '@/components/Card';
import styles from './page.module.css';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1000);
    };

    return (
        <div className={styles.container}>
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1>Contact Us</h1>
                    <p>We are always here to help. Reach out to us for any queries or support.</p>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.grid}>
                    <div className={styles.contactInfo}>
                        <h2>Get in Touch</h2>
                        <p className={styles.infoSubtitle}>
                            Whether you are a professional seeking an update on your verification, or a client with a booking issue, our team is available 24/7 to assist.
                        </p>

                        <div className={styles.infoCards}>
                            <Card className={styles.infoCard}>
                                <div className={styles.infoIcon}><FaPhoneAlt /></div>
                                <div>
                                    <h3>Call Us</h3>
                                    <p>111-SAHULAT (111-724-852)</p>
                                    <p>+92 300 1234567</p>
                                </div>
                            </Card>

                            <Card className={styles.infoCard}>
                                <div className={styles.infoIcon}><FaWhatsapp /></div>
                                <div>
                                    <h3>WhatsApp Support</h3>
                                    <p>+92 311 7654321</p>
                                    <p className={styles.muted}>Fastest response time.</p>
                                </div>
                            </Card>

                            <Card className={styles.infoCard}>
                                <div className={styles.infoIcon}><FaEnvelope /></div>
                                <div>
                                    <h3>Email Us</h3>
                                    <p>support@sahulathub.pk</p>
                                    <p>info@sahulathub.pk</p>
                                </div>
                            </Card>

                            <Card className={styles.infoCard}>
                                <div className={styles.infoIcon}><FaMapMarkerAlt /></div>
                                <div>
                                    <h3>Head Office</h3>
                                    <p>10th Floor, Arfa Software Technology Park,</p>
                                    <p>Ferozepur Road, Lahore, Pakistan.</p>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <div className={styles.contactForm}>
                        <Card className={styles.formCard}>
                            <h2>Send a Message</h2>
                            {isSubmitted ? (
                                <div className={styles.successMessage}>
                                    <div className={styles.successIcon}>✓</div>
                                    <h3>Message Sent!</h3>
                                    <p>Thank you for reaching out. Our support team will respond to your email shortly.</p>
                                    <Button variant="outline" onClick={() => setIsSubmitted(false)} className="mt-4">
                                        Send another message
                                    </Button>
                                </div>
                            ) : (
                                <form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.inputGroup}>
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Subject</label>
                                        <select
                                            required
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        >
                                            <option value="" disabled>Select a topic...</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="booking">Booking Issue</option>
                                            <option value="verification">Worker Verification</option>
                                            <option value="billing">Billing & Refunds</option>
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Message</label>
                                        <textarea
                                            rows="5"
                                            placeholder="How can we help you today?"
                                            required
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <Button type="submit" size="large" className="mt-2">Submit Message</Button>
                                </form>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
