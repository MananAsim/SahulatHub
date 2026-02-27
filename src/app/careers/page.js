import styles from '@/styles/legal.module.css';

export default function CareersPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Careers at SahulatHub</h1>
                <p>Join our team and help build the future of household services.</p>
            </div>

            <div className={styles.content}>
                <section>
                    <h2>Why Join Us?</h2>
                    <p>We are a fast-growing startup revolutionizing a massive, unstructured market. By joining SahulatHub, you get to work on hard technical and operational problems that directly impact the daily lives of thousands of Pakistanis.</p>
                    <p>We offer competitive salaries, flexible remote-first work hours, and a culture of ownership and innovation.</p>
                </section>

                <section>
                    <h2>Open Positions</h2>
                    <p>We are currently looking for passionate individuals for the following roles:</p>
                    <ul>
                        <li><strong>Senior Frontend Engineer (Next.js/React):</strong> Build beautiful, performant user interfaces for our core product.</li>
                        <li><strong>Backend Engineer (Go/Node.js):</strong> Architect scalable microservices and optimize our AI matchmaking engine.</li>
                        <li><strong>Operations Manager (Lahore):</strong> Oversee professional onboarding, verification, and local market expansion.</li>
                        <li><strong>Customer Success Representative:</strong> Resolve daily user queries, handle disputes, and ensure a five-star experience.</li>
                    </ul>
                </section>

                <section>
                    <h2>How to Apply</h2>
                    <p>If you see a fit, send us your resume and a brief intro at <strong>careers@sahulathub.pk</strong>.</p>
                    <p>Please mention the role you are applying for in the email subject line.</p>
                </section>
            </div>
        </div>
    );
}
