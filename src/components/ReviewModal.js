'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import styles from './ReviewModal.module.css';
import { FaStar, FaTimes, FaSpinner } from 'react-icons/fa';

/**
 * ReviewModal
 * ──────────────────────────────────────────────────────────────────────────────
 * Props:
 *   taskId     {string}    — The MongoDB _id of the completed task
 *   workerName {string}    — Worker's display name (for UX)
 *   onClose    {function}  — Called after successful submission or dismiss
 */
export default function ReviewModal({ taskId, workerName, onClose }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await apiFetch('/api/reviews', {
                method: 'POST',
                body: JSON.stringify({ task_id: taskId, rating, comment }),
            });
            setDone(true);
        } catch (err) {
            setError(err.message || 'Failed to submit review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    <FaTimes />
                </button>

                {done ? (
                    <div className={styles.successState}>
                        <div className={styles.successIcon}>⭐</div>
                        <h2>Thank You!</h2>
                        <p>Your review for <strong>{workerName || 'the worker'}</strong> has been submitted.</p>
                        <button className={styles.doneBtn} onClick={onClose}>Done</button>
                    </div>
                ) : (
                    <>
                        <h2 className={styles.title}>Rate Your Experience</h2>
                        <p className={styles.subtitle}>
                            How was your experience with <strong>{workerName || 'this worker'}</strong>?
                        </p>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {/* Star selector */}
                            <div className={styles.stars}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        className={styles.star}
                                        color={(hover || rating) >= star ? '#f59e0b' : '#e2e8f0'}
                                        size={36}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </div>
                            <p className={styles.ratingLabel}>
                                {rating === 0 && 'Select a rating'}
                                {rating === 1 && 'Poor'}
                                {rating === 2 && 'Fair'}
                                {rating === 3 && 'Good'}
                                {rating === 4 && 'Very Good'}
                                {rating === 5 && 'Excellent!'}
                            </p>

                            <textarea
                                className={styles.textarea}
                                rows={4}
                                placeholder="Share your experience (optional)..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                maxLength={1000}
                            />

                            {error && <p className={styles.error}>{error}</p>}

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={loading}
                            >
                                {loading ? (
                                    <><FaSpinner style={{ animation: 'spin 1s linear infinite', marginRight: 8 }} />Submitting...</>
                                ) : 'Submit Review'}
                            </button>

                            <button
                                type="button"
                                className={styles.skipBtn}
                                onClick={onClose}
                            >
                                Skip for now
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
