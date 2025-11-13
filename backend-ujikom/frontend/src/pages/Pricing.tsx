import React from 'react';
import { Container, Box } from '@mui/material';
import PricingSection from '../components/profile/PricingSection';
import FeatureComparisonTable from '../components/pricing/FeatureComparisonTable';
import Testimonials from '../components/pricing/Testimonials';
import FAQ from '../components/pricing/FAQ';

const PricingPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        <PricingSection />
        <FeatureComparisonTable />
        <Testimonials />
        <FAQ />
      </Box>
    </Container>
  );
};

export default PricingPage;
