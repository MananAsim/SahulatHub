import styles from './Card.module.css';

export default function Card({ children, className = '', hoverable = false, ...props }) {
    const cardClass = `${styles.card} ${hoverable ? styles.hoverable : ''} ${className}`;

    return (
        <div className={cardClass} {...props}>
            {children}
        </div>
    );
}
