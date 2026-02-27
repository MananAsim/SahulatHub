'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import styles from './page.module.css';
import { FaArrowLeft, FaMoneyBillWave, FaCalendarAlt, FaDownload } from 'react-icons/fa';

export default function WorkerEarnings() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading || !user) return <div className="section text-center">Loading earnings...</div>;

    const transactions = [
        { id: 'tx-001', date: 'Oct 24, 2026', service: 'Plumbing Repair', client: 'Ahmed Raza', amount: '+ Rs 1,500', status: 'completed' },
        { id: 'tx-002', date: 'Oct 22, 2026', service: 'AC Servicing', client: 'Fatima Ali', amount: '+ Rs 3,000', status: 'completed' },
        { id: 'tx-003', date: 'Oct 18, 2026', service: 'Electrical Wiring', client: 'Usman Khan', amount: '+ Rs 2,500', status: 'completed' },
        { id: 'tx-004', date: 'Oct 15, 2026', service: 'Weekly Payout', client: 'Bank Transfer', amount: '- Rs 7,000', status: 'withdrawn' },
        { id: 'tx-005', date: 'Oct 10, 2026', service: 'Ceiling Fan Install', client: 'Zainab Bibi', amount: '+ Rs 800', status: 'completed' }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <button className={styles.backButton} onClick={() => router.push('/worker/dashboard')}>
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <h1>Earnings History</h1>
                    <p>Track your payouts and overall performance.</p>
                </div>
            </header>

            <main className={styles.mainContent}>
                <section className={styles.summarySection}>
                    <Card className={styles.balanceCard}>
                        <div className={styles.balanceHeader}>
                            <h3>Available Balance</h3>
                            <FaMoneyBillWave className={styles.cashIcon} />
                        </div>
                        <div className={styles.balanceAmount}>Rs 8,300</div>
                        <p className={styles.balanceSubtitle}>Next auto-payout on Oct 30, 2026</p>
                        <div className={styles.balanceActions}>
                            <Button size="large" style={{ flex: 1 }}>Withdraw Now</Button>
                        </div>
                    </Card>

                    <div className={styles.statsGrid}>
                        <Card className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#eff6ff', color: 'var(--primary-blue)' }}>
                                <FaCalendarAlt />
                            </div>
                            <div className={styles.statInfo}>
                                <h4>Rs 14,500</h4>
                                <p>This Month</p>
                            </div>
                        </Card>
                        <Card className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#ecfdf5', color: 'var(--success)' }}>
                                <FaMoneyBillWave />
                            </div>
                            <div className={styles.statInfo}>
                                <h4>Rs 45,000</h4>
                                <p>Total Lifetime Earnings</p>
                            </div>
                        </Card>
                    </div>
                </section>

                <section className={styles.ledgerSection}>
                    <div className={styles.ledgerHeader}>
                        <h2>Recent Transactions</h2>
                        <Button variant="outline" size="small"><FaDownload style={{ marginRight: '8px' }} /> Export CSV</Button>
                    </div>

                    <Card className={styles.ledgerCard}>
                        <div className={styles.transactionList}>
                            {transactions.map(tx => (
                                <div key={tx.id} className={styles.transactionRow}>
                                    <div className={styles.txInfo}>
                                        <div className={styles.txIconContainer}>
                                            {tx.status === 'withdrawn' ? (
                                                <div className={`${styles.txIcon} ${styles.txWithdraw}`}><FaArrowLeft style={{ transform: 'rotate(45deg)' }} /></div>
                                            ) : (
                                                <div className={`${styles.txIcon} ${styles.txDeposit}`}><FaMoneyBillWave /></div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className={styles.txTitle}>{tx.service}</h4>
                                            <p className={styles.txSubtitle}>{tx.date} • {tx.client}</p>
                                        </div>
                                    </div>
                                    <div className={`${styles.txAmount} ${tx.status === 'withdrawn' ? styles.amountNegative : styles.amountPositive}`}>
                                        {tx.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>
            </main>
        </div>
    );
}
