import React from 'react';

type Props = { full_name?: string; time?: string; }

export default function PasswordResetConfirmation({ full_name, time }: Props) {
  return (
    <html>
      <body style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", color: '#111827' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
          <h2>Password changed</h2>
          <p>Hi {full_name || ''},</p>
          <p>This is a confirmation that the password for your AfriConnect account was changed at {time}.</p>
          <p>If you didn't perform this action, please contact support immediately.</p>
        </div>
      </body>
    </html>
  );
}
