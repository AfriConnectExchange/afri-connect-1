
import React from 'react';
import { Html, Body, Container, Head, Heading, Text, Preview, Section } from '@react-email/components';

type Props = { full_name?: string; time?: string; ip?: string; agent?: string; }

export default function LoginAlert({ full_name, time, ip, agent }: Props) {
  const previewText = `Security Alert: New Sign-In to your account.`;

  return (
    <Html lang="en">
      <Head>
        <title>Security Alert: New Sign-In</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Security Alert: New Sign-In</Heading>
          
          <Text style={text}>Hi {full_name || 'there'},</Text>
          <Text style={text}>We detected a new sign-in to your AfriConnect Exchange account. If this was you, you can safely ignore this email.</Text>
          
          <Section style={details}>
            <Heading as="h3" style={{ marginTop: 0 }}>Sign-In Details:</Heading>
            <ul style={ul}>
                <li><strong>Time:</strong> {time ? new Date(time).toUTCString() : 'N/A'}</li>
                <li><strong>IP Address:</strong> {ip || 'N/A'}</li>
                <li><strong>Device/Browser:</strong> {agent || 'N/A'}</li>
            </ul>
          </Section>
          
          <Text style={text}>If this wasn't you, please secure your account immediately by resetting your password and contacting our support team.</Text>
          
          <Text style={text}>
            Thank you,
            <br/>
            The AfriConnect Security Team
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
  color: '#D32F2F',
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

const details = {
    backgroundColor: '#f9f9f9',
    border: '1px solid #eee',
    borderRadius: '6px',
    padding: '15px',
    margin: '20px 20px',
};

const ul = {
    paddingLeft: '20px',
    margin: 0,
    listStyleType: 'disc',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 20px',
};
