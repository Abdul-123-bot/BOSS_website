import React, { useEffect, useState } from 'react';
import { AgChartsReact } from 'ag-charts-react';

const Analysis = () => {
  const [prod, setProd] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5005/analysis");
      const data = await response.json();
      setProd(data);
      console.warn(data)
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const chartOptions = {
    data: prod,
    series: [{ type: 'bar', xKey: 'name', yKey: 'value' }],
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <AgChartsReact options={chartOptions} />
    </div>
  );
};

export default Analysis;
