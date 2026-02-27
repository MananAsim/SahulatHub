import styles from '@/styles/legal.module.css';

export default function TermsPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Terms of Service</h1>
                <p>Last Updated: October 2026</p>
            </div>

            <div className={styles.content}>
                <section>
                    <h2>1. Terms</h2>
                    <p>By accessing the SahulatHub application, you agree to be bound by these terms of service and all applicable laws and regulations.</p>
                </section>

                <section>
                    <h2>2. Use License</h2>
                    <p>Permission is granted to temporarily download one copy of the materials on SahulatHub for personal, non-commercial transitory viewing only.</p>
                    <ul>
                        <li>You may not modify or copy the materials.</li>
                        <li>You may not use the materials for any commercial purpose.</li>
                        <li>You may not attempt to reverse engineer any software contained on SahulatHub.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Disclaimer</h2>
                    <p>The materials on SahulatHub are provided on an 'as is' basis. SahulatHub makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.</p>
                </section>

                <section>
                    <h2>4. User Responsibilities</h2>
                    <p>Clients are expected to provide accurate job details. Workers are expected to act professionally, arrive on time, and provide the quality of service advertised on their profile.</p>
                </section>
            </div>
        </div>
    );
}
