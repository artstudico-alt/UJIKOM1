import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

interface PasswordRequirement {
  id: string;
  text: string;
  isValid: boolean;
}

interface PasswordRequirementsProps {
  password: string;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      text: 'Minimal 8 karakter',
      isValid: password.length >= 8,
    },
    {
      id: 'uppercase',
      text: 'Mengandung 1 huruf kapital',
      isValid: /[A-Z]/.test(password),
    },
    {
      id: 'number',
      text: 'Mengandung 1 angka',
      isValid: /[0-9]/.test(password),
    },
    {
      id: 'special',
      text: 'Mengandung 1 karakter khusus',
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  return (
    <Box sx={{ mt: 1 }}>
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'text.secondary', 
          fontSize: '0.8rem', 
          fontWeight: 500, 
          mb: 1 
        }}
      >
        Syarat Password:
      </Typography>
      <Stack spacing={1}>
        {requirements.map((requirement) => (
          <Box
            key={requirement.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {requirement.isValid ? (
              <CheckCircle
                sx={{
                  fontSize: 16,
                  color: 'success.main',
                }}
              />
            ) : (
              <RadioButtonUnchecked
                sx={{
                  fontSize: 16,
                  color: 'text.disabled',
                }}
              />
            )}
            <Typography
              variant="body2"
              sx={{
                color: requirement.isValid ? 'success.main' : 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: requirement.isValid ? 500 : 400,
              }}
            >
              {requirement.text}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default PasswordRequirements;
