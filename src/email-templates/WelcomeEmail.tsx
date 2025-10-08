
import React from 'react';
import { Html, Button, Body, Container, Head, Heading, Text, Link, Preview, Section } from '@react-email/components';

type Props = {
  full_name?: string;
  verify_link?: string;
  domain?: string;
};

export default function WelcomeEmail({ full_name, verify_link, domain }: Props) {
  const siteUrl = domain || process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:9002';
  const previewText = `Welcome to AfriConnect, ${full_name || 'there'}!`;

  return (
    <Html lang="en">
      <Head>
        <title>Welcome to AfriConnect Exchange</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to AfriConnect Exchange!</Heading>
          
          <Text style={text}>Hi {full_name || 'there'},</Text>
          <Text style={text}>Thank you for joining AfriConnect Exchange, the marketplace connecting Africa and the diaspora.</Text>
          
          {verify_link ? (
            <>
              <Text style={text}>To complete your registration, please verify your email address by clicking the button below:</Text>
              <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
                <Button style={button} href={verify_link}>
                  Verify Your Email
                </Button>
              </Section>
              <Text style={text}>
                If the button doesn't work, you can copy and paste this link into your browser:
                <br />
                <Link href={verify_link} style={link}>
                  {verify_link}
                </Link>
              </Text>
            </>
          ) : (
            <>
              <Text style={text}>You're all set! You can start exploring the marketplace right away.</Text>
              <Section style={{ textAlign: 'center', marginTop: '32px', marginBottom: '32px' }}>
                <Button style={button} href={siteUrl}>
                  Explore Marketplace
                </Button>
              </Section>
            </>
          )}

          <Text style={text}>We're excited to have you as part of our community!</Text>
          <Text style={text}>
            Best regards,
            <br />
            The AfriConnect Team
          </Text>

          <Text style={footer}>
            &copy; {new Date().getFullYear()} AfriConnect Exchange. All rights reserved.
            <br />
            If you did not sign up for this account, please disregard this email.
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
  color: '#E65100',
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

const button = {
  backgroundColor: '#E65100',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
};

const link = {
  color: '#E65100',
  wordBreak: 'break-all' as const,
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 20px',
};
