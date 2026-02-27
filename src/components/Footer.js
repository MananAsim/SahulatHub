import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.brand}>
                        <h3 className={styles.logo}>SahulatHub</h3>
                        <p className={styles.description}>
                            Connecting you with verified professionals for all your household needs in Pakistan.
                        </p>
                    </div>

                    <div className={styles.links}>
                        <h4 className={styles.heading}>Company</h4>
                        <Link href="/about" className={styles.link}>About Us</Link>
                        <Link href="/contact" className={styles.link}>Contact Us</Link>
                        <Link href="/careers" className={styles.link}>Careers</Link>
                    </div>

                    <div className={styles.links}>
                        <h4 className={styles.heading}>Support & Safety</h4>
                        <Link href="/help" className={styles.link}>Help Center & FAQ</Link>
                        <Link href="/safety" className={styles.link}>Safety Tips</Link>
                        <Link href="/dispute-resolution" className={styles.link}>Dispute Resolution</Link>
                    </div>

                    <div className={styles.links}>
                        <h4 className={styles.heading}>Legal</h4>
                        <Link href="/terms" className={styles.link}>Terms of Service</Link>
                        <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
                        <Link href="/cookies" className={styles.link}>Cookie Policy</Link>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} SahulatHub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
