import React from 'react';

type Props = {
  full_name?: string;
  verify_link?: string;
  domain?: string;
};

export default function WelcomeEmail({ full_name, verify_link, domain }: Props) {
  const siteUrl = domain || process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:9002';

  return (
    <html lang="en">
      <head>
        <style>{`
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd; }
          .button { background-color: #E65100; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold; }
          .footer { text-align: center; font-size: 12px; color: #777; padding-top: 20px; border-top: 1px solid #ddd; margin-top: 20px;}
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1 style={{ margin: 0, fontSize: '24px', color: '#E65100' }}>Welcome to AfriConnect Exchange!</h1>
          </div>
          <div style={{ padding: '20px 0' }}>
            <p>Hi {full_name || 'there'},</p>
            <p>Thank you for joining AfriConnect Exchange, the marketplace connecting Africa and the diaspora.</p>
            {verify_link ? (
              <>
                <p>To complete your registration, please verify your email address by clicking the button below:</p>
                <p style={{ textAlign: 'center', margin: '30px 0' }}>
                  <a href={verify_link} className="button">Verify Your Email</a>
                </p>
                <p>If the button doesn't work, you can copy and paste this link into your browser: <br/> <a href={verify_link}>{verify_link}</a></p>
              </>
            ) : (
              <>
                <p>You're all set! You can start exploring the marketplace right away.</p>
                 <p style={{ textAlign: 'center', margin: '30px 0' }}>
                  <a href={siteUrl} className="button">Explore Marketplace</a>
                </p>
              </>
            )}
            <p>We're excited to have you as part of our community!</p>
            <p>Best regards,<br/>The AfriConnect Team</p>
          </div>
          <div className="footer">
            <p>&copy; {new Date().getFullYear()} AfriConnect Exchange. All rights reserved.</p>
            <p>If you did not sign up for this account, please disregard this email.</p>
          </div>
        </div>
      </body>
    </html>
  );
}
