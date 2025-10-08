
import React from 'react';
import {
  Html,
  Body,
  Container,
  Head,
  Heading,
  Text,
  Preview,
  Section,
  Img,
  Hr,
} from '@react-email/components';

type Props = {
  full_name?: string;
  time?: string;
  ip?: string;
  agent?: string;
};

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:9002';

export default function LoginAlert({ full_name, time, ip, agent }: Props) {
  const previewText = `Security Alert: New Sign-In to your account.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={`${baseUrl}/logo-email.png`}
              width="180"
              alt="AfriConnect Exchange"
            />
          </Section>
          <Heading style={h1}>Security Alert</Heading>

          <Text style={text}>Hi {full_name || 'there'},</Text>
          <Text style={text}>
            We detected a new sign-in to your AfriConnect Exchange account. If
            this was you, you can safely ignore this email.
          </Text>

          <Section style={detailsSection}>
            <Heading as="h3" style={detailsTitle}>
              Sign-In Details:
            </Heading>
            <Text style={detailsText}>
              <strong>Time:</strong> {time ? new Date(time).toUTCString() : 'N/A'}
            </Text>
            <Text style={detailsText}>
              <strong>IP Address:</strong> {ip || 'N/A'}
            </Text>
            <Text style={detailsText}>
              <strong>Device/Browser:</strong> {agent || 'N/A'}
            </Text>
          </Section>

          <Text style={text}>
            If this wasn't you, please secure your account immediately by
            resetting your password and contacting our support team.
          </Text>

          <Text style={text}>
            Thank you,
            <br />- The AfriConnect Security Team
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            AfriConnect Exchange, 123 Innovation Drive, London, UK
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f0f2f5',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};

const header = {
  padding: '20px',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#D32F2F',
  fontSize: '26px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 0 30px',
};

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 30px',
};

const detailsSection = {
  backgroundColor: '#fffbe6',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 30px',
};

const detailsTitle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 10px',
};

const detailsText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 4px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '30px',
};

const footer = {
  color: '#a0aec0',
  fontSize: '12px',
  lineHeight: '18px',
  textAlign: 'center' as const,
  padding: '0 30px',
};
