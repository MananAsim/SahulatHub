import styles from './ServiceCard.module.css';

export default function ServiceCard({ title, icon: Icon, description, onClick }) {
    return (
        <div className={styles.card} onClick={onClick}>
            <div className={styles.iconWrapper}>
                <Icon className={styles.icon} />
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
        </div>
    );
}
