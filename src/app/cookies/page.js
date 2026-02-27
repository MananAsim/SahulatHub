import styles from '@/styles/legal.module.css';

export default function CookiesPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Cookie Policy</h1>
                <p>Last Updated: October 2026</p>
            </div>

            <div className={styles.content}>
                <section>
                    <h2>What are cookies?</h2>
                    <p>Cookies are small pieces of text sent by your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.</p>
                </section>

                <section>
                    <h2>How SahulatHub uses cookies</h2>
                    <p>When you use and access the Service, we may place a number of cookie files in your web browser. We use cookies for the following purposes:</p>
                    <ul>
                        <li>To enable certain functions of the Service.</li>
                        <li>To provide analytics.</li>
                        <li>To store your preferences, such as authentication status and selected role.</li>
                    </ul>
                </section>

                <section>
                    <h2>Your choices regarding cookies</h2>
                    <p>If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser.</p>
                    <p>Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.</p>
                </section>
            </div>
        </div>
    );
}
