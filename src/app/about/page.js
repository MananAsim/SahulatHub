'use client';

import Button from '@/components/Button';
import Card from '@/components/Card';
import styles from './page.module.css';

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1>About SahulatHub</h1>
                    <p>We are on a mission to organize the unstructured household services market in Pakistan.</p>
                </div>
            </div>

            <div className={styles.content}>
                <section className={styles.storySection}>
                    <div className={styles.storyText}>
                        <h2>Our Story</h2>
                        <p>
                            Finding a reliable, skilled, and safe professional for household repairs has always been a
                            challenge in Pakistan. Whether it&apos;s a leaky pipe at 9 AM or a broken AC in the middle
                            of July, you either rely on word-of-mouth or take a chance with a stranger.
                        </p>
                        <p>
                            <strong>SahulatHub</strong> was born out of this frustration. We recognized the need for a
                            standardized, transparent, and technology-driven solution. By connecting vetted professionals
                            with homeowners through an incredible AI matching system, we bring peace of mind to your doorstep.
                        </p>
                    </div>
                    <div className={styles.storyImage}>
                        <div className={styles.imagePlaceholder}>
                            {/* Replace with actual team/story image later */}
                            <span>Building Trust. Delivering Quality.</span>
                        </div>
                    </div>
                </section>

                <section className={styles.statsSection}>
                    <div className={styles.statBox}>
                        <h3>10,000+</h3>
                        <p>Happy Customers</p>
                    </div>
                    <div className={styles.statBox}>
                        <h3>5,000+</h3>
                        <p>Verified Professionals</p>
                    </div>
                    <div className={styles.statBox}>
                        <h3>15+</h3>
                        <p>Cities Covered</p>
                    </div>
                    <div className={styles.statBox}>
                        <h3>4.8/5</h3>
                        <p>Average Rating</p>
                    </div>
                </section>

                <section className={styles.valuesSection}>
                    <h2 className="text-center mb-4">Our Core Values</h2>
                    <div className={styles.valuesGrid}>
                        <Card className={styles.valueCard}>
                            <div className={styles.valueIcon}>🛡️</div>
                            <h3>Trust & Safety</h3>
                            <p>Every worker undergoes rigorous background checks and CNIC verification. We never compromise on your safety.</p>
                        </Card>
                        <Card className={styles.valueCard}>
                            <div className={styles.valueIcon}>💎</div>
                            <h3>Quality Service</h3>
                            <p>We believe in doing things right the first time. We continuously monitor worker ratings to ensure top-tier quality.</p>
                        </Card>
                        <Card className={styles.valueCard}>
                            <div className={styles.valueIcon}>💸</div>
                            <h3>Transparent Pricing</h3>
                            <p>No hidden charges or surprise fees. You get a clear estimate before the professional even reaches your door.</p>
                        </Card>
                    </div>
                </section>

                <section className={styles.ctaSection}>
                    <div className={styles.ctaContent}>
                        <h2>Ready to experience the difference?</h2>
                        <p>Join thousands of Pakistanis who have simplified their household maintenance.</p>
                        <div className={styles.ctaButtons}>
                            <Button size="large">Book a Service</Button>
                            <Button size="large" variant="secondary">Become a Professional</Button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
