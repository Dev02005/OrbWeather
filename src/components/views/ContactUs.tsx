import { Mail } from 'lucide-react';
import { StandaloneLayout } from './StandaloneLayout';

export function ContactUs() {
  return (
    <StandaloneLayout title="Contact Us">
      <p>
        Have a question, an idea, or found something that is not working? We would love to hear
        from you.
      </p>

      <div className="contact-card">
        <div className="contact-icon">
          <Mail size={24} aria-hidden="true" />
        </div>
        <div>
          <h2 className="contact-title">Email</h2>
          <a className="contact-link" href="mailto:orbwheather@gmail.com">
            orbwheather@gmail.com
          </a>
        </div>
      </div>

      <p>
        Reporting a problem? Mention the city you were viewing, your device and your browser — it
        helps us track the issue down quickly.
      </p>
    </StandaloneLayout>
  );
}
