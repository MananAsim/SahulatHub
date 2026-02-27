'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import styles from './page.module.css';
import { FaCreditCard, FaMoneyBillWave, FaWallet } from 'react-icons/fa';

export default function PaymentPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [method, setMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePayment = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setSuccess(true);
        }, 2000);
    };

    if (success) {
        return (
            <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Card className={styles.successCard}>
                    <div className={styles.successIcon}>✓</div>
                    <h2>Payment Successful!</h2>
                    <p>Your payment of Rs 1500 has been processed.</p>
                    <Button onClick={() => router.push('/client/dashboard')} className="mt-4">
                        Return to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Secure Checkout</h1>
                <p>Complete your payment for Job #{id || '123'}</p>
            </div>

            <div className={styles.content}>
                <div className={styles.paymentCol}>
                    <Card>
                        <h2>Select Payment Method</h2>

                        <div className={styles.methodSelector}>
                            <button
                                className={`${styles.methodBtn} ${method === 'card' ? styles.activeMethod : ''}`}
                                onClick={() => setMethod('card')}
                            >
                                <FaCreditCard className={styles.methodIcon} />
                                Credit/Debit Card
                            </button>
                            <button
                                className={`${styles.methodBtn} ${method === 'wallet' ? styles.activeMethod : ''}`}
                                onClick={() => setMethod('wallet')}
                            >
                                <FaWallet className={styles.methodIcon} />
                                EasyPaisa / JazzCash
                            </button>
                            <button
                                className={`${styles.methodBtn} ${method === 'cash' ? styles.activeMethod : ''}`}
                                onClick={() => setMethod('cash')}
                            >
                                <FaMoneyBillWave className={styles.methodIcon} />
                                Cash
                            </button>
                        </div>

                        {method === 'card' && (
                            <form className={styles.cardForm} onSubmit={handlePayment}>
                                <div className={styles.inputGroup}>
                                    <label>Cardholder Name</label>
                                    <input type="text" placeholder="John Doe" required />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Card Number</label>
                                    <input type="text" placeholder="0000 0000 0000 0000" required />
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                                        <label>Expiry Date</label>
                                        <input type="text" placeholder="MM/YY" required />
                                    </div>
                                    <div className={styles.inputGroup} style={{ flex: 1 }}>
                                        <label>CVV</label>
                                        <input type="text" placeholder="123" required />
                                    </div>
                                </div>
                                <Button type="submit" size="large" className="mt-4" disabled={isProcessing}>
                                    {isProcessing ? 'Processing...' : 'Pay Rs 1500'}
                                </Button>
                            </form>
                        )}

                        {method === 'wallet' && (
                            <form className={styles.cardForm} onSubmit={handlePayment}>
                                <div className={styles.inputGroup}>
                                    <label>Mobile Number</label>
                                    <input type="text" placeholder="03XX XXXXXXX" required />
                                </div>
                                <Button type="submit" size="large" className="mt-4" disabled={isProcessing}>
                                    {isProcessing ? 'Processing...' : 'Pay Rs 1500'}
                                </Button>
                            </form>
                        )}

                        {method === 'cash' && (
                            <div className={styles.cashNotice}>
                                <p>Please pay the exact amount <strong>Rs 1500</strong> to the professional manually.</p>
                                <Button size="large" className="mt-4" onClick={(e) => handlePayment(e)} disabled={isProcessing}>
                                    Confirm Cash Payment
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>

                <div className={styles.summaryCol}>
                    <Card>
                        <h3>Order Summary</h3>
                        <div className={styles.receiptLine}>
                            <span>Plumbing Service</span>
                            <span>Rs 500</span>
                        </div>
                        <div className={styles.receiptLine}>
                            <span>Material Cost</span>
                            <span>Rs 800</span>
                        </div>
                        <div className={styles.receiptLine}>
                            <span>Tax & Fees</span>
                            <span>Rs 200</span>
                        </div>
                        <hr className={styles.divider} />
                        <div className={`${styles.receiptLine} ${styles.total}`}>
                            <span>Total to Pay</span>
                            <span>Rs 1500</span>
                        </div>

                        <div className={styles.secureNotice}>
                            <FaCreditCard /> Payments are secure and encrypted.
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
