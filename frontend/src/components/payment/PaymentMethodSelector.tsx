import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Avatar,
} from '@mui/material';
import { ExpandMore, AccountBalance, Wallet, QrCode2 } from '@mui/icons-material';
import paymentService, { PaymentMethods } from '../../services/paymentService';

interface PaymentMethodSelectorProps {
  onSelect: (method: string, channel: string) => void;
  selectedMethod?: string;
  selectedChannel?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  onSelect,
  selectedMethod = '',
  selectedChannel = '',
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods | null>(null);
  const [expanded, setExpanded] = useState<string>('virtual_account');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      
      // Fallback to mock data for development
      const mockMethods: PaymentMethods = {
        virtual_account: {
          name: 'Virtual Account',
          channels: {
            bca: 'BCA Virtual Account',
            mandiri: 'Mandiri Virtual Account',
            bni: 'BNI Virtual Account',
            bri: 'BRI Virtual Account',
            permata: 'Permata Virtual Account',
          },
          fee: 4000,
        },
        ewallet: {
          name: 'E-Wallet',
          channels: {
            ovo: 'OVO',
            dana: 'DANA',
            linkaja: 'LinkAja',
            shopeepay: 'ShopeePay',
          },
          fee_percentage: 2.5,
        },
        qris: {
          name: 'QRIS',
          channels: {
            qris: 'QRIS (All E-Wallet)',
          },
          fee_percentage: 0.7,
        },
      };
      
      console.warn('Using mock payment methods for development');
      setPaymentMethods(mockMethods);
    }
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : '');
  };

  const handleChannelSelect = (method: string, channel: string) => {
    onSelect(method, channel);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'virtual_account':
        return <AccountBalance />;
      case 'ewallet':
        return <Wallet />;
      case 'qris':
        return <QrCode2 />;
      default:
        return <AccountBalance />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'virtual_account':
        return '#667eea';
      case 'ewallet':
        return '#4caf50';
      case 'qris':
        return '#ff9800';
      default:
        return '#667eea';
    }
  };

  if (!paymentMethods) {
    return <Typography>Loading payment methods...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Pilih Metode Pembayaran
      </Typography>

      {Object.entries(paymentMethods).map(([methodKey, methodData]) => (
        <Accordion
          key={methodKey}
          expanded={expanded === methodKey}
          onChange={handleAccordionChange(methodKey)}
          sx={{
            mb: 2,
            borderRadius: 2,
            border: selectedMethod === methodKey ? `2px solid ${getMethodColor(methodKey)}` : '1px solid rgba(0,0,0,0.12)',
            '&:before': { display: 'none' },
            boxShadow: selectedMethod === methodKey ? `0 4px 12px ${getMethodColor(methodKey)}33` : '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              '& .MuiAccordionSummary-content': {
                alignItems: 'center',
                gap: 2,
              },
            }}
          >
            <Avatar sx={{ bgcolor: getMethodColor(methodKey), width: 40, height: 40 }}>
              {getMethodIcon(methodKey)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {methodData.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {methodData.fee
                  ? `Biaya: ${paymentService.formatCurrency(methodData.fee)}`
                  : `Biaya: ${methodData.fee_percentage}%`}
              </Typography>
            </Box>
            {selectedMethod === methodKey && (
              <Chip label="Dipilih" size="small" color="primary" />
            )}
          </AccordionSummary>

          <AccordionDetails>
            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={selectedMethod === methodKey ? selectedChannel : ''}
                onChange={(e) => handleChannelSelect(methodKey, e.target.value)}
              >
                {Object.entries(methodData.channels).map(([channelKey, channelName]) => (
                  <FormControlLabel
                    key={channelKey}
                    value={channelKey}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{String(channelName)}</Typography>
                      </Box>
                    }
                    sx={{
                      mb: 1,
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid rgba(0,0,0,0.08)',
                      bgcolor: selectedChannel === channelKey ? `${getMethodColor(methodKey)}11` : 'transparent',
                      '&:hover': {
                        bgcolor: `${getMethodColor(methodKey)}08`,
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default PaymentMethodSelector;
