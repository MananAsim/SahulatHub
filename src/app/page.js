'use client';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import ServiceCard from '@/components/ServiceCard';
import styles from './page.module.css';
import {
  FaWrench,
  FaBolt,
  FaSnowflake,
  FaBroom,
  FaPaintRoller,
  FaHammer
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { role } = useAuth();

  const services = [
    { title: 'Plumbing', icon: FaWrench, desc: 'Leakages, installations, pipe fitting' },
    { title: 'Electrical', icon: FaBolt, desc: 'Wiring, appliances, repairs' },
    { title: 'AC Repair', icon: FaSnowflake, desc: 'Installation, servicing, gas refill' },
    { title: 'Cleaning', icon: FaBroom, desc: 'Deep cleaning, regular housekeeping' },
    { title: 'Painting', icon: FaPaintRoller, desc: 'Interior & exterior painting' },
    { title: 'Carpentry', icon: FaHammer, desc: 'Furniture repair, wood works' },
  ];

  const handleRoleSelection = (selectedRole) => {
    // Navigate to auth/login page with role predefined, or just to login.
    // For demo, we just pass role via query
    router.push(`/auth/login?role=${selectedRole}`);
  };

  const handleServiceClick = (service) => {
    // If client, route to book. If guest, route to login.
    if (role === 'client') {
      router.push(`/client/book?service=${service.title}`);
    } else {
      router.push(`/auth/login?role=client&redirect=/client/book`);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Reliable Home Services, <br />
            <span className={styles.highlight}>Just a Click Away.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Connect with verified professionals for plumbing, electrical, cleaning, and more across Pakistan.
          </p>

          <div className={styles.roleSelection}>
            <div className={styles.roleCard}>
              <h3>Need a Service?</h3>
              <p>Find AI-matched professionals for your household tasks.</p>
              <Button size="large" onClick={() => handleRoleSelection('client')}>
                I am a Client
              </Button>
            </div>

            <div className={styles.roleCard}>
              <h3>Are you a Professional?</h3>
              <p>Join our platform to find jobs and grow your earnings.</p>
              <Button variant="secondary" size="large" onClick={() => handleRoleSelection('worker')}>
                I am a Worker
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values / Features */}
      <section className="section" style={{ backgroundColor: 'var(--surface-color)' }}>
        <h2 className="section-title">Why Choose SahulatHub?</h2>
        <p className="section-subtitle">We prioritize quality, trust, and transparency in every job.</p>

        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🛡️</div>
            <h3>Verified Professionals</h3>
            <p>Every worker undergoes strict background and ID verification (CNIC).</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>🤖</div>
            <h3>AI Matchmaking</h3>
            <p>Our smart system connects you with the best available worker based on skills and location.</p>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>💰</div>
            <h3>Transparent Pricing</h3>
            <p>No hidden fees. See cost estimates upfront before booking a service.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section">
        <h2 className="section-title">Our Services</h2>
        <p className="section-subtitle">Browse through our wide range of professional household services.</p>

        <div className={styles.servicesGrid}>
          {services.map((srv, idx) => (
            <ServiceCard
              key={idx}
              title={srv.title}
              icon={srv.icon}
              description={srv.desc}
              onClick={() => handleServiceClick(srv)}
            />
          ))}
        </div>

        <div className="text-center mt-4">
          <Button variant="outline" size="large">View All Services</Button>
        </div>
      </section>
    </div>
  );
}
