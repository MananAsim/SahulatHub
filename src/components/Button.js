import styles from './Button.module.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  className = '', 
  disabled = false, 
  ...props 
}) {
  const buttonClass = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;
  
  return (
    <button 
      className={buttonClass} 
      onClick={onClick} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
