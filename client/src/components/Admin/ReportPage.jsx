import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import {API_BASE_URL} from './../../config';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
  CategoryScale,
} from 'chart.js';
import Footer from '../Footer';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, Filler, BarElement, CategoryScale);

const ReportPage = () => {
  const [quotationData, setQuotationData] = useState([]);
  const [dailyData, setDailyData] = useState({ labels: [], amounts: [], completedAmounts: [] });
  const [engineerData, setEngineerData] = useState({ labels: [], amounts: [], completedAmounts: [] });
  const [timeRange, setTimeRange] = useState(7);
  const [engineerTimeRange, setEngineerTimeRange] = useState(7);
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [engineers, setEngineers] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const token = localStorage.getItem("token");

  const handleToggleSidebar = () => {
    setDrawerOpen((prev) => !prev);
  };

  const fetchEngineers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/engineers/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch engineers");
      }

      const data = await response.json();
      setEngineers(data);
      if (data.length > 0) {
        setSelectedEngineer(data[0]._id);
        fetchEngineerQuotations(data[0]._id, engineerTimeRange);
      }
    } catch (error) {
      console.error("Error fetching engineers:", error);
    }
  };

  const fetchQuotations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quotations");
      }

      const data = await response.json();
      setQuotationData(data);
      processDailyData(data, timeRange);
    } catch (error) {
      console.error("Error fetching quotations:", error);
    }
  };

  const fetchEngineerQuotations = async (engineerId, range) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quotations/engineer/${engineerId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
         
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch engineer quotations");
      }

      const data = await response.json();
      processEngineerData(data, range);
    } catch (error) {
      console.error("Error fetching engineer quotations:", error);
    }
  };

  const processDailyData = (quotations, range) => {
    const amounts = {};
    const completedAmounts = {};
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - range);

    for (let i = 0; i <= range; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      amounts[date.toDateString()] = 0;
      completedAmounts[date.toDateString()] = 0;
    }

    quotations.forEach(quotation => {
      const createdOn = new Date(quotation.generatedOn);
      if (createdOn >= startDate && createdOn <= today) {
        amounts[createdOn.toDateString()] += quotation.quotationAmount || 0;

        if (quotation.status === true && quotation.statusChangedOn) {
          const statusChangedOn = new Date(quotation.statusChangedOn);
          if (statusChangedOn >= startDate && statusChangedOn <= today) {
            completedAmounts[statusChangedOn.toDateString()] += quotation.quotationAmount || 0;
          }
        }
      }
    });

    const labels = [];
    const dataAmounts = [];
    const dataCompletedAmounts = [];

    for (let i = 0; i <= range; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      labels.push(date.toDateString());
      dataAmounts.push(amounts[date.toDateString()]);
      dataCompletedAmounts.push(completedAmounts[date.toDateString()]);
    }

    setDailyData({
      labels,
      amounts: dataAmounts,
      completedAmounts: dataCompletedAmounts,
    });
  };

  const processEngineerData = (quotations, range) => {
    const amounts = {};
    const completedAmounts = {};
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - range);

    for (let i = 0; i <= range; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      amounts[date.toDateString()] = 0;
      completedAmounts[date.toDateString()] = 0;
    }

    quotations.forEach(quotation => {
      const createdOn = new Date(quotation.generatedOn);
      if (createdOn >= startDate && createdOn <= today) {
        amounts[createdOn.toDateString()] += quotation.quotationAmount || 0;

        if (quotation.status === true && quotation.statusChangedOn) {
          const statusChangedOn = new Date(quotation.statusChangedOn);
          if (statusChangedOn >= startDate && statusChangedOn <= today) {
            completedAmounts[statusChangedOn.toDateString()] += quotation.quotationAmount || 0;
          }
        }
      }
    });

    const labels = [];
    const dataAmounts = [];
    const dataCompletedAmounts = [];

    for (let i = 0; i <= range; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      labels.push(date.toDateString());
      dataAmounts.push(amounts[date.toDateString()]);
      dataCompletedAmounts.push(completedAmounts[date.toDateString()]);
    }

    setEngineerData({
      labels,
      amounts: dataAmounts,
      completedAmounts: dataCompletedAmounts,
    });
  };

  const handleEngineerChange = (event) => {
    const engineerId = event.target.value;
    setSelectedEngineer(engineerId);
    fetchEngineerQuotations(engineerId, engineerTimeRange); // Fetch with current time range
  };

  const handleTimeRangeChange = (event) => {
    const newTimeRange = event.target.value;
    setTimeRange(newTimeRange);
    processDailyData(quotationData, newTimeRange); // Update with new time range
  };

  const handleEngineerTimeRangeChange = (event) => {
    const newTimeRange = event.target.value;
    setEngineerTimeRange(newTimeRange);
    if (selectedEngineer) {
      fetchEngineerQuotations(selectedEngineer, newTimeRange); // Pass the new time range
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchEngineers();
  }, [token]);

  const chartData = {
    labels: dailyData.labels,
    datasets: [
      {
        label: 'Total Quotation Amount',
        data: dailyData.amounts,
        fill: true,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: '#4caf50',
        borderWidth: 2,
      },
      {
        label: 'Completed Quotation Amount',
        data: dailyData.completedAmounts,
        fill: true,
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: '#2196F3',
        borderWidth: 2,
      },
    ],
  };

  const engineerChartData = {
    labels: engineerData.labels,
    datasets: [
      {
        label: 'Total Quotation Amount for Selected Engineer',
        data: engineerData.amounts,
        fill: true,
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        borderColor: '#f44336',
        borderWidth: 2,
      },
      {
        label: 'Completed Quotation Amount for Selected Engineer',
        data: engineerData.completedAmounts,
        fill: true,
        backgroundColor: 'rgba(63, 81, 181, 0.2)',
        borderColor: '#3f51b5',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar onMenuClick={handleToggleSidebar} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar open={drawerOpen} onClose={handleToggleSidebar} />
        <Container sx={{ flex: 1, padding: 2 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Paper sx={{ padding: 3, mt: 9 }}>
                <Typography variant="h6">Quotation Amounts by Day</Typography>
                <FormControl variant="outlined" sx={{ mb: 2, minWidth: 120 }}>
                  <InputLabel id="time-range-label">Time Range</InputLabel>
                  <Select
                    labelId="time-range-label"
                    value={timeRange}
                    onChange={handleTimeRangeChange}
                    label="Time Range"
                  >
                    <MenuItem value={7}>Last 7 Days</MenuItem>
                    <MenuItem value={15}>Last 15 Days</MenuItem>
                    <MenuItem value={30}>Last 30 Days</MenuItem>
                    <MenuItem value={60}>Last 60 Days</MenuItem>
                    <MenuItem value={90}>Last 90 Days</MenuItem>
                    <MenuItem value={365}>Last Year</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ height: 300 }}>
                  <Line data={chartData} options={options} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ padding: 3, mt: 2 }}>
                <Typography variant="h6">Select Engineer</Typography>
                <FormControl variant="outlined" sx={{ mb: 2, minWidth: 120 }}>
                  <InputLabel id="engineer-select-label">Engineer</InputLabel>
                  <Select
                    labelId="engineer-select-label"
                    value={selectedEngineer}
                    onChange={handleEngineerChange}
                    label="Engineer"
                  >
                    {engineers.map((engineer) => (
                      <MenuItem key={engineer._id} value={engineer._id}>
                        {engineer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="outlined" sx={{ mb: 2, minWidth: 120 }}>
                  <InputLabel id="engineer-time-range-label">Time Range</InputLabel>
                  <Select
                    labelId="engineer-time-range-label"
                    value={engineerTimeRange}
                    onChange={handleEngineerTimeRangeChange}
                    label="Time Range"
                  >
                    <MenuItem value={7}>Last 7 Days</MenuItem>
                    <MenuItem value={15}>Last 15 Days</MenuItem>
                    <MenuItem value={30}>Last 30 Days</MenuItem>
                    <MenuItem value={60}>Last 60 Days</MenuItem>
                    <MenuItem value={90}>Last 90 Days</MenuItem>
                    <MenuItem value={365}>Last Year</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ height: 300 }}>
                  <Line data={engineerChartData} options={options} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default ReportPage;
