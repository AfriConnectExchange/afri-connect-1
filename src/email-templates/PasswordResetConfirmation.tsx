
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
};

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:9002';

export default function PasswordResetConfirmation({
  full_name,
  time,
}: Props) {
  const previewText = `Your AfriConnect password was successfully changed.`;

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
          <Heading style={h1}>Password Changed Successfully</Heading>

          <Text style={text}>Hi {full_name || 'there'},</Text>
          <Text style={text}>
            This is a confirmation that the password for your AfriConnect
            account was changed at{' '}
            {time ? new Date(time).toUTCString() : 'a recent time'}.
          </Text>
          <Text style={text}>
            If you did not perform this action, please contact our support team
            immediately to secure your account.
          </Text>

          <Text style={text}>
            Best regards,
            <br />- The AfriConnect Team
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
  color: '#1a202c',
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
