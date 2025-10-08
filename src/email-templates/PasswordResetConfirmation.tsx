import React from 'react';

type Props = { full_name?: string; time?: string; }

export default function PasswordResetConfirmation({ full_name, time }: Props) {
  return (
    <html lang="en">
       <head>
        <style>{`
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd; }
          .footer { text-align: center; font-size: 12px; color: #777; padding-top: 20px; border-top: 1px solid #ddd; margin-top: 20px;}
        `}</style>
      </head>
      <body>
         <div className="container">
          <div className="header">
            <h1 style={{ margin: 0, fontSize: '24px', color: '#1976D2' }}>Password Changed</h1>
          </div>
          <div style={{ padding: '20px 0' }}>
            <p>Hi {full_name || 'there'},</p>
            <p>This is a confirmation that the password for your AfriConnect account was changed at {time ? new Date(time).toUTCString() : 'a recent time'}.</p>
            <p>If you didn't perform this action, please contact our support team immediately to secure your account.</p>
            <p>Best regards,<br/>The AfriConnect Team</p>
          </div>
           <div className="footer">
             <p>&copy; {new Date().getFullYear()} AfriConnect Exchange. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  );
}
