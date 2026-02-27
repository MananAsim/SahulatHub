'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import styles from './page.module.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function HelpCenterPage() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "How do I book a service?",
            answer: "Booking is easy! Simply sign in as a Client, go to your dashboard, select the category of service you need, describe the task, and our AI will immediately match you with nearby verified professionals."
        },
        {
            question: "Are the workers verified?",
            answer: "Yes. Every professional on SahulatHub undergoes a strict background check, which includes CNIC verification, skill assessment, and continuous monitoring of their ratings from other users."
        },
        {
            question: "How do I pay?",
            answer: "You can pay securely via Credit/Debit card, Mobile Wallets (EasyPaisa/JazzCash), or in cash after the service is successfully completed. The estimated price is shown upfront."
        },
        {
            question: "What if I am not satisfied with the work?",
            answer: "We offer a 100% satisfaction guarantee on many services. If you have an issue, you can file a dispute through your dashboard and our support team will resolve it within 24 hours."
        },
        {
            question: "How do I become a worker?",
            answer: "Click on 'Worker Mode' during sign-up. Fill out your profile, upload your CNIC and any relevant skill certificates. Once our team approves your profile, you can start accepting jobs!"
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1>Help Center & FAQ</h1>
                    <p>Find answers to common questions about using SahulatHub.</p>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.faqSection}>
                    <h2>Frequently Asked Questions</h2>
                    <div className={styles.faqList}>
                        {faqs.map((faq, index) => (
                            <Card
                                key={index}
                                className={styles.faqCard}
                            >
                                <div
                                    className={styles.question}
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                >
                                    <h3>{faq.question}</h3>
                                    {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                                {openIndex === index && (
                                    <div className={styles.answer}>
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                <div className={styles.supportBox}>
                    <h3>Still need help?</h3>
                    <p>Our dedicated support team is available 24/7 to assist you.</p>
                    <a href="/contact" className={styles.contactBtn}>Contact Support</a>
                </div>
            </div>
        </div>
    );
}
