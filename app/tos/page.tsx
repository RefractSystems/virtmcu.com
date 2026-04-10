import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | Virtmcu',
  description: 'Terms of service for the Virtmcu high-performance simulation platform.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar activeSection="" />
      <main className="section-container" style={{ paddingTop: '160px', maxWidth: '800px' }}>
        <article>
          <div className="doc-section">
            <h1 style={{ fontSize: '40px', marginBottom: '24px' }}>Terms of Service</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              <strong>Last Updated: April 10, 2026</strong>
            </p>
          </div>

          <div className="doc-section" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>1. Usage</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.8' }}>
              Virtmcu is an open-source project. Usage of the software is governed by the <strong>GPL-2.0 License</strong>. The website and its contents are provided "AS-IS" for informational purposes.
            </p>
          </div>

          <div className="doc-section" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>2. Limitation of Liability</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.8' }}>
              Refract Systems and the Virtmcu contributors are not liable for any damages arising from the use of the simulation tools or the information provided on this site.
            </p>
          </div>

          <div className="doc-section" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>3. Intellectual Property</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.8' }}>
              The Virtmcu name and branding are properties of Refract Systems. The simulation engine code is available under the GPL-2.0 License.
            </p>
          </div>

          <div className="doc-section" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>4. Contact</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.8' }}>
              For legal inquiries, please contact <strong>legal@refractsystems.com</strong>.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
