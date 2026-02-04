import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-top to-sky-bottom p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Game
        </Button>

        <div className="bg-card/90 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-lg">
          <h1 className="font-bengali text-3xl md:text-4xl font-bold text-foreground mb-2">
            Privacy Policy for Gandulaf
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: February 2026</p>

          <div className="space-y-6 text-foreground">
            <p>
              Gandulaf is a mini arcade game developed and published by an independent developer. 
              This Privacy Policy explains how information is handled when you use the application.
            </p>

            <section>
              <h2 className="text-xl font-semibold mb-2">1. Information Collection</h2>
              <p>
                Gandulaf does not require user registration and does not intentionally collect, 
                store, or share personal data such as names, email addresses, phone numbers, 
                or precise location information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">2. Automatically Collected Information</h2>
              <p>
                The app may rely on basic technical data (such as device type or system performance data) 
                provided automatically by the operating system or distribution platform solely for app 
                functionality and stability. This data is not used to identify individual users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">3. Third-Party Services</h2>
              <p>
                Gandulaf does not integrate third-party analytics, advertising SDKs, or tracking 
                services that collect personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
              <p>
                Reasonable technical and organizational measures are taken to ensure the security 
                of the application. No sensitive personal data is processed or stored by the developer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">5. Children's Privacy</h2>
              <p>
                Gandulaf does not knowingly collect any personal data from children under the age of 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">6. Changes to This Policy</h2>
              <p>
                This Privacy Policy may be updated from time to time. Any changes will be published on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
              <p>
                If you have any questions about this Privacy Policy, you may contact the developer 
                via the official app page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
