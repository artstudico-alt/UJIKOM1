// 🎨 CONTOH IMPLEMENTASI LOGO GOMOMENT
// File ini adalah contoh bagaimana menggunakan logo image menggantikan text

import React from 'react';
import { Box, Typography } from '@mui/material';

// ===== CONTOH 1: Logo di Header (PublicLayout.tsx) =====
const HeaderLogoExample = ({ scrolled }: { scrolled: boolean }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Icon/Logo Image */}
      <img 
        src="/images/logos/logo-gomoment-icon.png" 
        alt="GOMOMENT"
        style={{
          height: scrolled ? '32px' : '40px',
          width: 'auto',
          transition: 'all 0.3s ease',
        }}
      />
      
      {/* Text Logo (opsional, bisa dihilangkan jika logo sudah include text) */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          background: 'linear-gradient(135deg, #9c27b0, #2196f3)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          fontSize: scrolled ? '1.4rem' : '1.6rem',
          transition: 'all 0.3s ease',
        }}
      >
        GOMOMENT
      </Typography>
    </Box>
  );
};

// ===== CONTOH 2: Logo Full di Footer =====
const FooterLogoExample = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <img 
        src="/images/logos/logo-gomoment.png" 
        alt="GOMOMENT"
        style={{
          height: '48px',
          width: 'auto',
          marginRight: '16px'
        }}
      />
    </Box>
  );
};

// ===== CONTOH 3: Logo Responsive =====
const ResponsiveLogoExample = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <picture>
        {/* Logo untuk mobile */}
        <source 
          media="(max-width: 768px)" 
          srcSet="/images/logos/logo-gomoment-icon.png"
        />
        {/* Logo untuk desktop */}
        <img 
          src="/images/logos/logo-gomoment.png" 
          alt="GOMOMENT"
          style={{
            height: 'auto',
            maxHeight: '40px',
            width: 'auto',
            maxWidth: '200px'
          }}
        />
      </picture>
    </Box>
  );
};

// ===== CONTOH 4: Logo dengan Dark Mode Support =====
const DarkModeLogoExample = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <img 
      src={isDarkMode 
        ? "/images/logos/logo-gomoment-white.png" 
        : "/images/logos/logo-gomoment.png"
      }
      alt="GOMOMENT"
      style={{
        height: '40px',
        width: 'auto',
        transition: 'opacity 0.3s ease'
      }}
    />
  );
};

// ===== CONTOH 5: Logo di Sidebar (AdminLayout.tsx) =====
const SidebarLogoExample = ({ collapsed }: { collapsed: boolean }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
      {/* Icon selalu tampil */}
      <img 
        src="/images/logos/logo-gomoment-icon.png" 
        alt="GOMOMENT"
        style={{
          height: '32px',
          width: '32px',
        }}
      />
      
      {/* Text/Full logo hanya tampil jika tidak collapsed */}
      {!collapsed && (
        <img 
          src="/images/logos/logo-gomoment-white.png" 
          alt="GOMOMENT"
          style={{
            height: '24px',
            width: 'auto',
          }}
        />
      )}
    </Box>
  );
};

export {
  HeaderLogoExample,
  FooterLogoExample,
  ResponsiveLogoExample,
  DarkModeLogoExample,
  SidebarLogoExample
};
