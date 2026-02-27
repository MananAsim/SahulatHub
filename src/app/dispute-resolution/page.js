import styles from '@/styles/legal.module.css';

export default function DisputeResolutionPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Dispute Resolution</h1>
                <p>How we handle issues between Clients and Professionals.</p>
            </div>

            <div className={styles.content}>
                <section>
                    <h2>1. Filing a Dispute</h2>
                    <p>If you are unsatisfied with the service provided, or if there is a disagreement regarding payment or damages, you can file a dispute directly from your dashboard under the specific job&apos;s details.</p>
                    <p>Disputes must be filed within 48 hours of the job completion timestamp.</p>
                </section>

                <section>
                    <h2>2. Mediation Process</h2>
                    <p>Once a dispute is filed, our support team will:</p>
                    <ol>
                        <li>Review the job details, chat logs, and any provided photo evidence.</li>
                        <li>Contact both the Client and the Professional for their statements.</li>
                        <li>Attempt to reach an amicable resolution within 2-3 business days.</li>
                    </ol>
                </section>

                <section>
                    <h2>3. Refunds and Compensation</h2>
                    <p>If the dispute is resolved in favor of the Client due to proven poor workmanship or worker no-show, SahulatHub may issue a partial or full refund depending on the case.</p>
                    <p>If damage to property occurs, claims up to a certain limit (as defined in our Terms of Service) may be covered by the platform&apos;s internal fund, provided sufficient evidence is submitted.</p>
                </section>

                <section>
                    <h2>4. Final Decision</h2>
                    <p>SahulatHub acts as a neutral third party. Our admin team&apos;s decision on disputes is final and binding for both users and professionals on the platform.</p>
                </section>
            </div>
        </div>
    );
}
