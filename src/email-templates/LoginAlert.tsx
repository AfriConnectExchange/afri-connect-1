import React from 'react';

type Props = { full_name?: string; time?: string; ip?: string; agent?: string; }

export default function LoginAlert({ full_name, time, ip, agent }: Props) {
  return (
    <html lang="en">
       <head>
        <style>{`
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd; }
          .details { background-color: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 15px; margin: 20px 0; }
          .details ul { padding-left: 20px; margin: 0; }
          .footer { text-align: center; font-size: 12px; color: #777; padding-top: 20px; border-top: 1px solid #ddd; margin-top: 20px;}
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1 style={{ margin: 0, fontSize: '24px', color: '#D32F2F' }}>Security Alert: New Sign-In</h1>
          </div>
          <div style={{ padding: '20px 0' }}>
            <p>Hi {full_name || 'there'},</p>
            <p>We detected a new sign-in to your AfriConnect Exchange account. If this was you, you can safely ignore this email.</p>
            <div className="details">
                <h3 style={{ marginTop: 0 }}>Sign-In Details:</h3>
                <ul>
                    <li><strong>Time:</strong> {time ? new Date(time).toUTCString() : 'N/A'}</li>
                    <li><strong>IP Address:</strong> {ip || 'N/A'}</li>
                    <li><strong>Device/Browser:</strong> {agent || 'N/A'}</li>
                </ul>
            </div>
            <p>If this wasn't you, please secure your account immediately by resetting your password and contacting our support team.</p>
            <p>Thank you,<br/>The AfriConnect Security Team</p>
          </div>
          <div className="footer">
             <p>&copy; {new Date().getFullYear()} AfriConnect Exchange. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  );
}
