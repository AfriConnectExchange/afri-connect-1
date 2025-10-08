import React from 'react';

type Props = { full_name?: string; time?: string; ip?: string; agent?: string; }

export default function LoginAlert({ full_name, time, ip, agent }: Props) {
  return (
    <html>
      <body style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", color: '#111827' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
          <h2>New sign-in to your AfriConnect account</h2>
          <p>Hi {full_name || ''},</p>
          <p>We detected a sign-in to your account.</p>
          <ul>
            <li><strong>Time:</strong> {time}</li>
            <li><strong>IP:</strong> {ip}</li>
            <li><strong>Agent:</strong> {agent}</li>
          </ul>
          <p>If this wasn't you, please reset your password or contact support.</p>
        </div>
      </body>
    </html>
  );
}
