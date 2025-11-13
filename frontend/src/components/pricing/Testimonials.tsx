import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Rating,
  Grid,
} from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const testimonials = [
  {
    name: 'Andi Wijaya',
    role: 'Event Organizer, Tech Conference 2024',
    avatar: 'https://i.pravatar.cc/150?img=1',
    testimonial: 'Platform ini sangat mengubah cara kami mengelola event. Dashboard analitiknya memberikan wawasan yang luar biasa dan sangat membantu kami dalam mengambil keputusan.',
    rating: 5,
  },
  {
    name: 'Siti Aminah',
    role: 'Marketing Manager, Startup Fest',
    avatar: 'https://i.pravatar.cc/150?img=5',
    testimonial: 'Dukungan prioritasnya benar-benar responsif. Setiap kali kami mengalami kendala, tim support selalu siap membantu dengan cepat. Sangat direkomendasikan!',
    rating: 5,
  },
  {
    name: 'Budi Santoso',
    role: 'Founder, Creative Workshop',
    avatar: 'https://i.pravatar.cc/150?img=3',
    testimonial: 'Fitur promosi event sangat efektif. Jumlah peserta kami meningkat 40% setelah menggunakan platform ini. Terima kasih!',
    rating: 4.5,
  },
];

const Testimonials: React.FC = () => {
  return (
    <Box sx={{ my: 8, py: 6, backgroundColor: 'grey.100', borderRadius: 3 }}>
      <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" sx={{ mb: 6 }}>
        Apa Kata Mereka Tentang Kami
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 4,
        }}
      >
        {testimonials.map((item, index) => (
          <Paper key={index} elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <FormatQuoteIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
            <Typography variant="body1" sx={{ fontStyle: 'italic', flexGrow: 1, mb: 2 }}>
              “{item.testimonial}”
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={item.avatar} alt={item.name} sx={{ width: 56, height: 56, mr: 2 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">{item.role}</Typography>
                <Rating value={item.rating} precision={0.5} readOnly />
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Testimonials;
