import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: 'Bisakah saya membatalkan langganan kapan saja?',
    answer: 'Tentu saja. Anda dapat membatalkan langganan Anda kapan pun melalui halaman profil Anda. Setelah dibatalkan, Anda masih dapat menggunakan fitur premium hingga akhir siklus penagihan Anda saat ini.',
  },
  {
    question: 'Metode pembayaran apa saja yang diterima?',
    answer: 'Kami menerima berbagai metode pembayaran, termasuk kartu kredit (Visa, MasterCard), transfer bank, dan dompet digital (GoPay, OVO, Dana).',
  },
  {
    question: 'Apakah ada uji coba gratis untuk paket Event Organizer?',
    answer: 'Saat ini kami tidak menawarkan uji coba gratis, tetapi kami memiliki garansi uang kembali 30 hari. Jika Anda tidak puas dengan layanan kami, kami akan mengembalikan dana Anda sepenuhnya.',
  },
  {
    question: 'Apa yang terjadi jika saya menurunkan versi paket saya?',
    answer: 'Jika Anda menurunkan versi paket Anda, Anda akan kehilangan akses ke fitur-fitur premium dari paket sebelumnya di akhir siklus penagihan saat ini. Anda tidak akan dikenakan biaya lagi untuk paket yang lebih tinggi.',
  },
  {
    question: 'Siapa yang bisa saya hubungi jika ada pertanyaan lebih lanjut?',
    answer: 'Tim dukungan kami selalu siap membantu! Anda dapat menghubungi kami melalui halaman kontak, atau jika Anda adalah pelanggan Enterprise, Anda dapat langsung menghubungi manajer akun khusus Anda.',
  },
];

const FAQ: React.FC = () => {
  return (
    <Box sx={{ my: 8 }}>
      <Typography variant="h4" component="h2" fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>
        Pertanyaan yang Sering Diajukan
      </Typography>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {faqs.map((faq, index) => (
          <Accordion key={index} elevation={0} sx={{ border: '1px solid rgba(0, 0, 0, 0.12)', '&:before': { display: 'none' }, mb: 1, borderRadius: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="medium">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default FAQ;
