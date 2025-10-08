import React from 'react';

type Props = {
  full_name?: string;
  verify_link?: string;
  domain?: string;
};

export default function WelcomeEmail({ full_name, verify_link, domain }: Props) {
  return (
    <html>
      <body style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", color: '#111827' }}>
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
          <tbody>
            <tr>
              <td align="center">
                <table style={{ maxWidth: 600, width: '100%' }} cellPadding={0} cellSpacing={0} role="presentation">
                  <tbody>
                    <tr>
                      <td style={{ padding: '24px 16px', textAlign: 'center' }}>
                        <h2 style={{ margin: 0 }}>Welcome to AfriConnect{full_name ? `, ${full_name}` : ''}!</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0 16px 24px' }}>
                        <p style={{ marginTop: 0 }}>Thanks for joining AfriConnect. Your account is almost ready.</p>
                        {verify_link ? (
                          <p>
                            <a href={verify_link} style={{ background: '#0370f6', color: '#fff', padding: '10px 16px', borderRadius: 6, textDecoration: 'none' }}>
                              Verify your email
                            </a>
                          </p>
                        ) : null}
                        <p style={{ marginBottom: 0 }}>Get started: <a href={`${domain || process.env.NEXT_PUBLIC_DOMAIN || ''}/onboarding`}>Complete onboarding</a></p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '24px 16px 40px', fontSize: 12, color: '#6b7280' }}>
                        <hr />
                        <p style={{ margin: '8px 0 0' }}>If you didn't create an account, contact us at support@africonnectexchange.org</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
