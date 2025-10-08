import React from 'react';
import { Html, Body, Container, Head, Heading, Text, Preview } from '@react-email/components';

type Props = { full_name?: string; time?: string; }

export default function PasswordResetConfirmation({ full_name, time }: Props) {
  const previewText = `Your AfriConnect password was successfully changed.`;

  return (
    <Html lang="en">
      <Head>
        <title>Password Changed</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Password Changed Successfully</Heading>
          
          <Text style={text}>Hi {full_name || 'there'},</Text>
          <Text style={text}>This is a confirmation that the password for your AfriConnect account was changed at {time ? new Date(time).toUTCString() : 'a recent time'}.</Text>
          <Text style={text}>If you didn't perform this action, please contact our support team immediately to secure your account.</Text>
          
          <Text style={text}>
            Best regards,
            <br/>
            The AfriConnect Team
          </Text>

          <Text style={footer}>
            &copy; {new Date().getFullYear()} AfriConnect Exchange. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
};

const h1 = {
  color: '#1976D2',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 20px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 20px',
};
