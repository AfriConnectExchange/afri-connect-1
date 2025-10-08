
import React from 'react';
import {
  Html,
  Body,
  Container,
  Head,
  Heading,
  Text,
  Link,
  Preview,
  Section,
  Row,
  Column,
  Img,
  Hr,
} from '@react-email/components';
import { Button } from '@react-email/components';

type Props = {
  full_name?: string;
  verify_link?: string;
  domain?: string;
};

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:9002';

export default function WelcomeEmail({
  full_name = 'Valued Member',
  verify_link,
}: Props) {
  const previewText = `Welcome to AfriConnect, ${full_name}!`;

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
          <Heading style={h1}>Welcome to AfriConnect Exchange!</Heading>

          <Text style={text}>Hi {full_name},</Text>
          <Text style={text}>
            We're thrilled to have you join our community. AfriConnect is your
            gateway to authentic African products, unique services, and empowering
            educational courses.
          </Text>

          {verify_link && (
            <Section style={ctaSection}>
              <Text style={text}>
                To get started, please verify your email address by clicking the
                button below:
              </Text>
              <Button href={verify_link} style={button}>
                Verify Your Email
              </Button>
            </Section>
          )}

          <Section style={threeStepsSection}>
            <Heading as="h2" style={h2}>
              What's Next?
            </Heading>
            <Row style={stepRow}>
              <Column align="center" style={stepColumn}>
                <Img
                  src={`${baseUrl}/marketplace-icon.png`}
                  alt="Marketplace"
                  width="48"
                  height="48"
                />
                <Heading as="h3" style={stepTitle}>
                  Explore the Marketplace
                </Heading>
                <Text style={stepText}>
                  Discover unique products from verified sellers across the continent.
                </Text>
              </Column>
              <Column align="center" style={stepColumn}>
                <Img
                  src={`${baseUrl}/seller-icon.png`}
                  alt="Become a Seller"
                  width="48"
                  height="48"
                />
                <Heading as="h3" style={stepTitle}>
                  Become a Seller
                </Heading>
                <Text style={stepText}>
                  Ready to sell? Complete your profile and KYC to start listing your products.
                </Text>
              </Column>
              <Column align="center" style={stepColumn}>
                <Img
                  src={`${baseUrl}/support-icon.png`}
                  alt="Get Help"
                  width="48"
                  height="48"
                />
                <Heading as="h3" style={stepTitle}>
                  Get Help
                </Heading>
                <Text style={stepText}>
                  Visit our Help Center or contact support if you have any questions.
                </Text>
              </Column>
            </Row>
          </Section>

          <Text style={text}>
            Happy trading!
            <br />- The AfriConnect Team
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            AfriConnect Exchange, 123 Innovation Drive, London, UK
          </Text>
          <Text style={footer}>
            You received this email because you signed up on our platform.
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

const h2 = {
  color: '#2d3748',
  fontSize: '20px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '0 0 30px',
};

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 30px',
};

const ctaSection = {
  padding: '20px 30px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#E65100',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};

const threeStepsSection = {
  padding: '30px',
  backgroundColor: '#fafafa',
  borderTop: '1px solid #e2e8f0',
  borderBottom: '1px solid #e2e8f0',
};

const stepRow = {
  width: '100%',
};

const stepColumn = {
  width: '33.33%',
  padding: '0 10px',
};

const stepTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#2d3748',
  margin: '12px 0 4px',
};

const stepText = {
  fontSize: '12px',
  color: '#718096',
  lineHeight: '18px',
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
