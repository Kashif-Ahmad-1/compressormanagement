import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MachineDropdown = ({  onMachineSelect }) => {
  const [machineNames, setMachineNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const invoiceNumber = 'INVC-2000'
  useEffect(() => {
    const fetchMachineNames = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/appointments/invoice/${invoiceNumber}`);
        const machines = response.data;

        // Extract unique machine names
        const uniqueMachineNames = [...new Set(machines.map(machine => machine.machineName))];
        setMachineNames(uniqueMachineNames);
      } catch (err) {
        setError(err.response ? err.response.data.message : 'Error fetching machine names');
      } finally {
        setLoading(false);
      }
    };

    if (invoiceNumber) {
      fetchMachineNames();
    }
  }, [invoiceNumber]);

  if (loading) return <p>Loading machines...</p>;
  if (error) return <p>{error}</p>;

  return (
    <select onChange={(e) => onMachineSelect(e.target.value)}>
      <option value="">Select a machine</option>
      {machineNames.map((machineName, index) => (
        <option key={index} value={machineName}>
          {machineName}
        </option>
      ))}
    </select>
  );
};

export default MachineDropdown;
