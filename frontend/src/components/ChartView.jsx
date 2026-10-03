import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const COLORS = ['#00f2fe', '#00c6ff', '#38bdf8', '#818cf8', '#a855f7', '#ec4899', '#f43f5e', '#10b981'];

export const ChartView = ({ visualization, columns = [], rows = [] }) => {
  const [chartType, setChartType] = useState(visualization?.type || 'bar');
  const [xAxisKey, setXAxisKey] = useState('');
  const [yAxisKey, setYAxisKey] = useState('');

  // Find columns that contain numeric data in rows
  const numericColumns = columns.filter((col, idx) => {
    return rows.some(r => {
      const val = r[idx];
      if (typeof val === 'number') return true;
      if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) return true;
      return false;
    });
  });

  const textColumns = columns.filter(col => !numericColumns.includes(col));

  useEffect(() => {
    if (columns.length > 0) {
      // Pick best numeric column for Y-Axis
      let defaultY = visualization?.y_axis;
      if (!defaultY || !numericColumns.includes(defaultY)) {
        const metricCol = numericColumns.find(c => {
          const l = c.toLowerCase();
          return l.includes('cgpa') || l.includes('salary') || l.includes('count') || l.includes('max') || l.includes('avg') || l.includes('package') || l.includes('total') || l.includes('amount') || l.includes('price');
        });
        defaultY = metricCol || numericColumns[0] || columns[0];
      }

      // Pick best label/category column for X-Axis
      let defaultX = visualization?.x_axis;
      if (!defaultX || defaultX === defaultY) {
        const catCol = textColumns.find(c => c !== defaultY) || columns.find(c => c !== defaultY);
        defaultX = catCol || columns[0];
      }

      setXAxisKey(defaultX);
      setYAxisKey(defaultY);
    }

    if (visualization?.type) {
      setChartType(visualization.type);
    }
  }, [visualization, columns, rows]);

  if (!rows || rows.length === 0 || !columns || columns.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        No chart data available for empty results.
      </div>
    );
  }

  // Format raw rows into object array for Recharts with numeric parsing
  const chartData = rows.map((row) => {
    const obj = {};
    columns.forEach((col, idx) => {
      let val = row[idx];
      if (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '') {
        val = Number(val);
      }
      obj[col] = val;
    });
    return obj;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
      {/* Chart Control Toolbar matching Image 3 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        background: '#0d131f',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid #1e293b'
      }}>
        {/* Chart Type Selector Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#111827', padding: '4px', borderRadius: '8px' }}>
          <button
            style={{
              background: chartType === 'bar' ? '#1e293b' : 'transparent',
              color: chartType === 'bar' ? '#00f2fe' : '#94a3b8',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setChartType('bar')}
          >
            <BarChart2 size={14} /> Bar
          </button>

          <button
            style={{
              background: chartType === 'line' ? '#1e293b' : 'transparent',
              color: chartType === 'line' ? '#00f2fe' : '#94a3b8',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setChartType('line')}
          >
            <TrendingUp size={14} /> Line
          </button>

          <button
            style={{
              background: chartType === 'pie' ? '#1e293b' : 'transparent',
              color: chartType === 'pie' ? '#00f2fe' : '#94a3b8',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setChartType('pie')}
          >
            <PieIcon size={14} /> Pie
          </button>
        </div>

        {/* X-AXIS Dropdown Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>X-AXIS</span>
          <select
            style={{
              background: '#111827',
              color: '#00f2fe',
              border: '1px solid #1e293b',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer'
            }}
            value={xAxisKey}
            onChange={(e) => setXAxisKey(e.target.value)}
          >
            {columns.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Y-AXIS Dropdown Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Y-AXIS</span>
          <select
            style={{
              background: '#111827',
              color: '#00f2fe',
              border: '1px solid #1e293b',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer'
            }}
            value={yAxisKey}
            onChange={(e) => setYAxisKey(e.target.value)}
          >
            {columns.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Canvas Area matching Image 3 */}
      <div style={{ width: '100%', height: 320, background: '#070b12', borderRadius: '12px', padding: '16px', border: '1px solid #1a2333' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey={xAxisKey} stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#00f2fe', borderRadius: '10px' }}
                itemStyle={{ color: '#00f2fe' }}
              />
              <Line
                type="monotone"
                dataKey={yAxisKey}
                stroke="#00f2fe"
                strokeWidth={3}
                dot={{ fill: '#00f2fe', r: 5 }}
              />
            </LineChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                dataKey={yAxisKey}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#00f2fe', borderRadius: '10px' }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
            </PieChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey={xAxisKey} stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#00f2fe', borderRadius: '10px' }}
                itemStyle={{ color: '#00f2fe' }}
              />
              <Bar dataKey={yAxisKey} fill="#00f2fe" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
