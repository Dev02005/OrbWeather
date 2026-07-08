import React from 'react';
import { Mail } from 'lucide-react';
import './Standalone.css';

export function ContactUs() {
  return (
    <div className="standalone-container">
      <h1 className="standalone-title">Contact Us</h1>
      <div className="standalone-content">
        <p>Have questions, feedback, or need support? We'd love to hear from you. Reach out to us through any of the channels below.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '32px' }}>
          
          <div className="contact-card">
            <div className="contact-icon">
              <Mail size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Email Support</h3>
              <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>orbwheather@gmail.com</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
