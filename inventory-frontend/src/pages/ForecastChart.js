import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ForecastChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
        <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
            <p className="text-muted">No trend data available.</p>
        </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 350 }}>
      <h5 className="text-center mb-3">Sales History vs. AI Prediction</h5>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }} 
            // Optional: Format date to be shorter (e.g., "12-07")
            tickFormatter={(str) => {
                const d = new Date(str);
                return `${d.getMonth()+1}/${d.getDate()}`;
            }}
          />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend verticalAlign="top" height={36}/>
          
          {/* 1. Historical Data Line (Blue, Solid) */}
          <Line 
            connectNulls // This allows the line to look continuous if there are gaps
            type="monotone" 
            dataKey="Sales" 
            stroke="#0d6efd" 
            strokeWidth={3}
            dot={{ r: 4 }}
            name="Past Sales" 
          />

          {/* 2. Forecast Data Line (Red, Dashed) */}
          <Line 
            connectNulls 
            type="monotone" 
            dataKey="Forecast" 
            stroke="#dc3545" 
            strokeWidth={3}
            strokeDasharray="5 5" // Makes it dashed
            dot={{ r: 4, strokeWidth: 2 }}
            name="AI Prediction (Next 7 Days)" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;