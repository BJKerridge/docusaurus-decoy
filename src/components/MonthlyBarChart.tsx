import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'July 2023', value: 689000000 },
  { month: 'August 2023', value: 8881900000 },
  { month: 'September 2023', value: 0 },
  { month: 'October 2023', value: 2236500000 },
  { month: 'November 2023', value: 3006900000 },
  { month: 'December 2023', value: 0 },
  { month: 'January 2024', value: 3334800000 },
  { month: 'February 2024', value: 863800000 },
  { month: 'March 2024', value: 682300000 },
  { month: 'April 2024', value: 4930300000 },
  { month: 'May 2024', value: 3265800000 },
  { month: 'June 2024', value: 513200000 },
  { month: 'July 2024', value: 1610700000 },
  { month: 'August 2024', value: 3184700000 },
  { month: 'September 2024', value: 0 },
  { month: 'October 2024', value: 1328500000 },
  { month: 'November 2024', value: 3051600000 },
  { month: 'December 2024', value: 2861200000 },
  { month: 'January 2025', value: 2514700000 },
  { month: 'February 2025', value: 4999400000 },
  { month: 'March 2025', value: 2487400000 },
  { month: 'April 2025', value: 4578500000 },
  { month: 'May 2025', value: 4919800000 },
  { month: 'June 2025', value: 2926800000 },
  { month: 'July 2025', value: 6207300000 },
  { month: 'August 2025', value: 5542300000 },
  { month: 'September 2025', value: 3969700000 },
  { month: 'October 2025', value: 5427600000 },
  { month: 'November 2025', value: 1755500000 },
  { month: 'December 2025', value: 3747700000 },
  { month: 'January 2026', value: 2150300000 },
  { month: 'February 2026', value: 3150300000 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const formatted = payload[0].value.toLocaleString();
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: '10px',
        border: '1px solid #444',
        borderRadius: '6px',
      }}>
        {label}<br />
        {`${formatted} ISK`}
      </div>
    );
  }
  return null;
};

export default function MonthlyBarChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `${(value / 1_000_000_000).toFixed(1)}B`} />
        <Tooltip content={<CustomTooltip active={undefined} payload={undefined} label={undefined} />} />
        <Bar dataKey="value" fill="#25c2a0" />
      </BarChart>
    </ResponsiveContainer>
  );
}
