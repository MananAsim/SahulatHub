'use client';

import { use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import styles from './page.module.css';
import { FaPhoneAlt, FaVideo, FaCommentDots, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

export default function JobDetailsPage({ params }) {
    const { id } = use(params);
    const { user, loading } = useAuth();
    const router = useRouter();

    // Dummy job data
    const status = 'On Route'; // Confirmed, On Route, In Progress, Completed
    const statuses = ['Confirmed', 'On Route', 'In Progress', 'Completed'];
    const currentStep = 1; // 0-indexed

    if (loading || !user) return <div className="section text-center">Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.mainCol}>
                    <div className={styles.header}>
                        <h1>Job Tracking #{id || '123'}</h1>
                        <span className={styles.statusBadge}>{status}</span>
                    </div>

                    <Card className={styles.trackerCard}>
                        <div className={styles.progressTracker}>
                            {statuses.map((item, index) => (
                                <div
                                    key={index}
                                    className={`${styles.step} ${index <= currentStep ? styles.activeStep : ''}`}
                                >
                                    <div className={styles.stepCircle}>
                                        {index < currentStep ? <FaCheckCircle /> : index + 1}
                                    </div>
                                    <span>{item}</span>
                                    {index < statuses.length - 1 && <div className={styles.stepLine}></div>}
                                </div>
                            ))}
                        </div>

                        <div className={styles.mapPlaceholder}>
                            {/* Dummy Map Area */}
                            <div className={styles.mapPin}>
                                <FaMapMarkerAlt size={32} />
                            </div>
                            <div className={styles.mapRoute}></div>
                            <div className={styles.workerPin}>
                                <img src={`https://ui-avatars.com/api/?name=Ali+Hassan&background=0D8ABC&color=fff`} alt="worker" />
                            </div>
                            <p className={styles.eta}>ETA: 12 minutes</p>
                        </div>
                    </Card>

                    <Card className="mt-4">
                        <h2>Job Details</h2>
                        <div className={styles.jobInfo}>
                            <p><strong>Service:</strong> Plumbing (Leakage Repair)</p>
                            <p><strong>Location:</strong> 123 Main St, Lahore</p>
                            <p><strong>Urgency:</strong> Normal</p>
                            <p><strong>Description:</strong> The kitchen sink pipe is leaking heavily under the cabinet.</p>
                        </div>
                    </Card>
                </div>

                <div className={styles.sideCol}>
                    <Card className={styles.workerProfile}>
                        <div className={styles.avatar}>
                            <img src={`https://ui-avatars.com/api/?name=Ali+Hassan&background=0D8ABC&color=fff`} alt="worker" />
                        </div>
                        <h3>Ali Hassan</h3>
                        <p className={styles.workerRole}>Professional Plumber</p>

                        <div className={styles.communication}>
                            <button className={styles.commBtn} onClick={() => router.push(`/client/job/${id}/chat`)} title="Chat"><FaCommentDots /></button>
                            <button className={styles.commBtn} title="Call"><FaPhoneAlt /></button>
                            <button className={styles.commBtn} title="Video"><FaVideo /></button>
                        </div>
                    </Card>

                    <Card className="mt-4">
                        <h3>Payment Summary</h3>
                        <div className={styles.receiptLine}>
                            <span>Base Fare</span>
                            <span>Rs 500</span>
                        </div>
                        <div className={styles.receiptLine}>
                            <span>Est. Materials</span>
                            <span>Rs 800</span>
                        </div>
                        <div className={styles.receiptLine}>
                            <span>Service Fee</span>
                            <span>Rs 200</span>
                        </div>
                        <hr className={styles.divider} />
                        <div className={`${styles.receiptLine} ${styles.total}`}>
                            <span>Total Estimate</span>
                            <span>Rs 1500</span>
                        </div>
                        <p className={styles.paymentNote}>Final price may vary after inspection.</p>

                        {status === 'Completed' || true ? (
                            <Button style={{ width: '100%', marginTop: '16px' }} onClick={() => router.push(`/client/payment/${id}`)}>
                                Proceed to Payment
                            </Button>
                        ) : null}
                    </Card>
                </div>
            </div>
        </div>
    );
}
