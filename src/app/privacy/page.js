import styles from '@/styles/legal.module.css';

export default function PrivacyPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Privacy Policy</h1>
                <p>Last Updated: October 2026</p>
            </div>

            <div className={styles.content}>
                <section>
                    <h2>1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>
                    <p>This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.</p>
                </section>

                <section>
                    <h2>2. How We Use the Information</h2>
                    <p>We use the information we collect about you to:</p>
                    <ul>
                        <li>Provide, maintain, and improve our Services.</li>
                        <li>Perform internal operations necessary to provide our Services.</li>
                        <li>Send you communications we think will be of interest to you.</li>
                        <li>Personalize and improve the Services.</li>
                    </ul>
                </section>

                <section>
                    <h2>3. Sharing of Information</h2>
                    <p>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows:</p>
                    <p>With Service Providers to enable them to provide the Services you request.</p>
                </section>
            </div>
        </div>
    );
}
