import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | VirtMCU',
  description: 'How VirtMCU handles your data. Professional, secure, and transparent.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar activeSection="" />
      <main className="section-container" style={{ paddingTop: '160px', maxWidth: '800px' }}>
        <article>
          <div className="doc-section">
            <h1 style={{ fontSize: '40px', marginBottom: '24px' }}>Privacy Policy</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              <strong>Last Updated: April 10, 2026</strong>
            </p>
          </div>

          <div className="doc-section" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>1. Data Collection</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.8' }}>
              We only collect information necessary to provide updates about the VirtMCU project:
            </p>
            <ul
              style={{
                color: 'var(--text-secondary)',
                paddingLeft: '24px',
                lineHeight: '1.8',
                listStyle: 'disc',
              }}
            >
              <li>
                <strong>Identification:</strong> Your email address, provided voluntarily for
                project updates.
              </li>
              <li>
                <strong>Analytics:</strong> Aggregate, non-identifiable usage patterns to improve
                the website experience.
              </li>
            </ul>
          </div>

          <div className="doc-section" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>2. Service Providers</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.8' }}>
              We use <strong>Google Firebase</strong> for infrastructure and database services. Your
              data is stored on secure servers and is never sold or traded to third parties.
            </p>
          </div>

          <div className="doc-section" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>3. Your Rights</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.8' }}>
              You may request access to, correction of, or deletion of your personal data at any
              time by contacting <strong>legal@refractsystems.com</strong>.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
