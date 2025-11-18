import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download as DownloadIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';

interface DashboardChartsProps {
  eventsPerMonth: Array<{ month: string; count: number }>;
  participantsPerMonth: Array<{ month: string; count: number }>;
  topEvents: Array<{ name: string; participants: number }>;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({
  eventsPerMonth,
  participantsPerMonth,
  topEvents,
}) => {
  
  // Export to Excel
  const exportToExcel = (data: any[], filename: string, sheetName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  // Export to CSV
  const exportToCSV = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Row 1: Events and Participants Charts */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          {/* Events Per Month Chart */}
          <Box sx={{ flex: 1 }}>
            <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Jumlah Kegiatan Per Bulan
                </Typography>
                <Box>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportToExcel(eventsPerMonth, 'Kegiatan_Per_Bulan', 'Events')}
                    sx={{ mr: 1 }}
                  >
                    XLS
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportToCSV(eventsPerMonth, 'Kegiatan_Per_Bulan')}
                  >
                    CSV
                  </Button>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#667eea" name="Jumlah Kegiatan" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          </Box>

          {/* Participants Per Month Chart */}
          <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Jumlah Peserta Per Bulan
                </Typography>
                <Box>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportToExcel(participantsPerMonth, 'Peserta_Per_Bulan', 'Participants')}
                    sx={{ mr: 1 }}
                  >
                    XLS
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportToCSV(participantsPerMonth, 'Peserta_Per_Bulan')}
                  >
                    CSV
                  </Button>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={participantsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#4caf50" name="Jumlah Peserta" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          </Box>
        </Box>

        {/* Top 10 Events Chart */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  10 Kegiatan dengan Peserta Terbanyak
                </Typography>
                <Box>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportToExcel(topEvents, 'Top_10_Kegiatan', 'Top Events')}
                    sx={{ mr: 1 }}
                  >
                    XLS
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => exportToCSV(topEvents, 'Top_10_Kegiatan')}
                  >
                    CSV
                  </Button>
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topEvents} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="participants" fill="#f59e0b" name="Jumlah Peserta" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardCharts;
