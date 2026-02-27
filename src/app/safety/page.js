import styles from '@/styles/legal.module.css';

export default function SafetyPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Safety Tips</h1>
                <p>Guidelines for a secure SahulatHub experience.</p>
            </div>

            <div className={styles.content}>
                <section>
                    <h2>For Clients</h2>
                    <ul>
                        <li><strong>Verify the Professional:</strong> Before allowing someone into your home, ensure their name and photo match the profile on SahulatHub.</li>
                        <li><strong>Communicate on Platform:</strong> Keep all communication and payments within the SahulatHub app to ensure we can assist you if something goes wrong.</li>
                        <li><strong>Secure Valuables:</strong> Keep your personal belongings and valuables in a safe place while the professional is working.</li>
                        <li><strong>Report Issues Immediately:</strong> If you feel unsafe or notice inappropriate behavior, report it to our 24/7 support team immediately.</li>
                    </ul>
                </section>

                <section>
                    <h2>For Professionals</h2>
                    <ul>
                        <li><strong>Confirm Job Details:</strong> Before heading out, understand clearly what the task entails to avoid misunderstandings on-site.</li>
                        <li><strong>Professional Behavior:</strong> Maintain a respectful and professional attitude at all times.</li>
                        <li><strong>Safety Gear:</strong> Bring and wear appropriate safety equipment necessary for the specific service you are providing.</li>
                        <li><strong>Emergency Protocol:</strong> If a location feels unsafe, you have the right to leave. Contact our support immediately to report the address.</li>
                    </ul>
                </section>

                <section>
                    <h2>Our Commitment</h2>
                    <p>We are dedicated to building a trusted community. All our professionals undergo CNIC verification and background checks. Furthermore, our AI-driven rating system constantly weeds out low performers to ensure consistent quality and safety.</p>
                </section>
            </div>
        </div>
    );
}
