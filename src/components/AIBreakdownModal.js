'use client';

/**
 * AIBreakdownModal — SOTA AI Explainability Panel
 * ─────────────────────────────────────────────────────────────────────────────
 * Shows the internal scoring breakdown for a single matched worker.
 * Renders animated progress bars for each sub-score, the exact formula used,
 * and the algorithmic source (Python AI engine / CSV rule engine / DB fallback).
 *
 * Props:
 *   worker  {object}    — The matched worker object from the API (must have .breakdown)
 *   onClose {function}  — Callback to close the modal
 */

import { useEffect } from 'react';
import styles from './AIBreakdownModal.module.css';
import { FaTimes, FaBrain, FaMapMarkerAlt, FaStar, FaCheckCircle, FaSearchPlus, FaKey } from 'react-icons/fa';

// ── Helpers ───────────────────────────────────────────────────────────────────

const pct = (val) => (val == null ? null : Math.round(val * 100));

const BAR_COLORS = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#3b82f6', // blue
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
];

function ScoreBar({ label, icon: Icon, value, weight, color, description }) {
    const percentage = pct(value);
    if (percentage === null) return null;

    return (
        <div className={styles.scoreRow}>
            <div className={styles.scoreLabel}>
                <span className={styles.scoreName}>
                    <Icon className={styles.scoreIcon} style={{ color }} />
                    {label}
                    {description && (
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>
                            &nbsp;·&nbsp;{description}
                        </span>
                    )}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {weight != null && (
                        <span className={styles.scoreWeight}>×{(weight * 100).toFixed(0)}%</span>
                    )}
                    <span className={styles.scoreValue}>{percentage}%</span>
                </span>
            </div>
            <div className={styles.barTrack}>
                <div
                    className={styles.barFill}
                    style={{ width: `${percentage}%`, background: color }}
                />
            </div>
        </div>
    );
}

// ── Build rows based on breakdown source ─────────────────────────────────────

function buildRows(breakdown) {
    if (!breakdown) return [];

    const { source, weights } = breakdown;

    if (source === 'ai_python') {
        return [
            {
                label: 'Semantic Similarity',
                icon: FaBrain,
                value: breakdown.hybrid,   // hybrid = RRF(semantic + BM25)
                weight: weights?.hybrid,
                color: BAR_COLORS[0],
                description: 'SentenceTransformer + BM25 RRF fusion',
            },
            {
                label: 'Proximity Score',
                icon: FaMapMarkerAlt,
                value: breakdown.proximity,
                weight: weights?.proximity,
                color: BAR_COLORS[2],
                description: 'Inverse-distance from your location',
            },
            {
                label: 'Rating Score',
                icon: FaStar,
                value: breakdown.rating,
                weight: weights?.rating,
                color: BAR_COLORS[4],
                description: 'Normalised avg client rating ÷ 5',
            },
            {
                label: 'Availability',
                icon: FaCheckCircle,
                value: breakdown.availability,
                weight: weights?.availability,
                color: BAR_COLORS[5],
                description: 'Active account status',
            },
        ];
    }

    if (source === 'rule_csv') {
        return [
            {
                label: 'Proximity Score',
                icon: FaMapMarkerAlt,
                value: breakdown.proximity,
                weight: weights?.proximity,
                color: BAR_COLORS[2],
                description: '1 − distance ÷ radius',
            },
            {
                label: 'Rating Score',
                icon: FaStar,
                value: breakdown.rating,
                weight: weights?.rating,
                color: BAR_COLORS[4],
                description: 'Avg customer rating ÷ 5',
            },
            {
                label: 'Trust Index',
                icon: FaCheckCircle,
                value: breakdown.trust,
                weight: weights?.trust,
                color: BAR_COLORS[0],
                description: 'Platform trust score ÷ 100',
            },
            {
                label: 'Jobs Completed',
                icon: FaKey,
                value: breakdown.experience,
                weight: weights?.experience,
                color: BAR_COLORS[1],
                description: 'Normalised completed job count',
            },
            {
                label: 'Years of Experience',
                icon: FaSearchPlus,
                value: breakdown.exp_years,
                weight: weights?.exp_years,
                color: BAR_COLORS[3],
                description: 'Normalised years in service',
            },
        ];
    }

    // rule_db fallback
    return [
        {
            label: 'Proximity Score',
            icon: FaMapMarkerAlt,
            value: breakdown.proximity,
            weight: weights?.proximity,
            color: BAR_COLORS[2],
            description: '1 − distance ÷ radius',
        },
        {
            label: 'Skill Match',
            icon: FaBrain,
            value: breakdown.skill,
            weight: weights?.skill,
            color: BAR_COLORS[0],
            description: 'Keyword overlap with your query',
        },
        {
            label: 'Urgency Factor',
            icon: FaKey,
            value: breakdown.urgency,
            weight: weights?.urgency,
            color: BAR_COLORS[5],
            description: 'Adjusts score based on urgency level',
        },
        {
            label: 'Rating Score',
            icon: FaStar,
            value: breakdown.rating,
            weight: weights?.rating,
            color: BAR_COLORS[4],
            description: 'Avg platform rating ÷ 5',
        },
    ];
}

// ── Formula string ────────────────────────────────────────────────────────────

function buildFormula(breakdown) {
    if (!breakdown) return '';
    const { source, weights } = breakdown;

    if (source === 'ai_python') {
        return `Final = ${(weights.hybrid * 100).toFixed(0)}% × hybrid_rrf  +  ${(weights.rating * 100).toFixed(0)}% × rating  +  ${(weights.proximity * 100).toFixed(0)}% × proximity  +  ${(weights.availability * 100).toFixed(0)}% × availability`;
    }
    if (source === 'rule_csv') {
        return `Final = ${(weights.proximity * 100).toFixed(0)}% × proximity  +  ${(weights.rating * 100).toFixed(0)}% × rating  +  ${(weights.trust * 100).toFixed(0)}% × trust  +  ${(weights.experience * 100).toFixed(0)}% × jobs  +  ${(weights.exp_years * 100).toFixed(0)}% × exp_years`;
    }
    return `Final = ${(weights.proximity * 100).toFixed(0)}% × proximity  +  ${(weights.skill * 100).toFixed(0)}% × skill  +  ${(weights.urgency * 100).toFixed(0)}% × urgency  +  ${(weights.rating * 100).toFixed(0)}% × rating`;
}

// ── Source label ──────────────────────────────────────────────────────────────

const SOURCE_META = {
    ai_python: { label: '🤖 Python AI Engine  (SentenceTransformer + BM25 + RRF)', cls: 'ai' },
    rule_csv:  { label: '📊 Hybrid Rule Engine  (CSV Dataset)', cls: 'csv' },
    rule_db:   { label: '⚙️ Rule Engine  (Live DB Workers)', cls: 'db' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AIBreakdownModal({ worker, onClose }) {
    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!worker) return null;

    const { breakdown, name, final_score, primary_skill } = worker;
    const rows = buildRows(breakdown);
    const formula = buildFormula(breakdown);
    const sourceMeta = SOURCE_META[breakdown?.source] || SOURCE_META['rule_csv'];

    return (
        <div
            className={styles.overlay}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-label="AI Match Breakdown"
        >
            <div className={styles.modal}>

                {/* Close */}
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    <FaTimes />
                </button>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.iconBadge}>
                        <FaBrain />
                    </div>
                    <div className={styles.headerText}>
                        <h2>AI Match Explanation</h2>
                        <p>Why this worker was ranked for your request</p>
                    </div>
                </div>

                {/* Worker chip */}
                <div className={styles.workerChip}>
                    <div className={styles.workerAvatar}>
                        {(name || 'W').charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.workerMeta}>
                        <strong>{name || 'Service Professional'}</strong>
                        <span>{primary_skill || 'General Services'}</span>
                    </div>
                    <div className={styles.finalScorePill}>
                        {Math.round((final_score || 0) * 100)}% Match
                    </div>
                </div>

                {/* Source badge */}
                <span className={`${styles.sourceBadge} ${styles[sourceMeta.cls]}`}>
                    {sourceMeta.label}
                </span>

                {/* Score bars */}
                <p className={styles.sectionTitle}>Scoring Breakdown</p>
                <div className={styles.scoresGrid}>
                    {rows.map((row, i) => (
                        <ScoreBar key={i} {...row} />
                    ))}
                </div>

                {/* Formula */}
                <p className={styles.sectionTitle}>Algorithm Formula</p>
                <div className={styles.formula}>
                    <strong>{formula}</strong>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    Scores are computed in real-time by the SahulatHub Hybrid AI Engine.<br />
                    Higher scores across all dimensions indicate a better match for your request.
                </div>
            </div>
        </div>
    );
}
