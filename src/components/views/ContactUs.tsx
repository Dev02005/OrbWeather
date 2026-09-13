import { Mail } from 'lucide-react';
import './Standalone.css';

export function ContactUs() {
  return (
    <div className="standalone-container">
      <h1 className="standalone-title">Contact Us</h1>
      <div className="standalone-content">
        <p>
          Have a question, an idea, or found something that is not working? We would love to hear
          from you.
        </p>

        <div className="contact-list">
          <div className="contact-card">
            <div className="contact-icon">
              <Mail size={24} aria-hidden="true" />
            </div>
            <div>
              <h2 className="contact-title">Email Support</h2>
              <a className="contact-link" href="mailto:orbwheather@gmail.com">
                orbwheather@gmail.com
              </a>
            </div>
          </div>
        </div>

        <p className="contact-footnote">
          Reporting a problem? Mention the city you were viewing, your device and your browser — it
          helps us track the issue down quickly.
        </p>
      </div>
    </div>
  );
}
