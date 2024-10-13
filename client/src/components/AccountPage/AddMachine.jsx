import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import {API_BASE_URL} from './../../config';
function AddMachine({ onSubmit }) {
  const [machineData, setMachineData] = useState({ name: '', modelNo: '', partNo: '', quantity: '' });

  const handleInputChange = (e) => {
    setMachineData({
      ...machineData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    onSubmit(machineData);
    setMachineData({ name: '', modelNo: '', partNo: '', quantity: '' });
  };

  return (
    <Box sx={{ marginBottom: 2 }}>
      <TextField
        label="Machine Name"
        name="name"
        value={machineData.name}
        onChange={handleInputChange}
        fullWidth
        sx={{ marginBottom: 1 }}
      />
      <TextField
        label="Model"
        name="modelNo"
        type="string"
        value={machineData.modelNo}
        onChange={handleInputChange}
        fullWidth
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Part"
        name="partNo"
        type="string"
        value={machineData.partNo}
        onChange={handleInputChange}
        fullWidth
        sx={{ marginBottom: 2 }}
      />
      <Button variant="contained" color="success" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
}

export default AddMachine;
