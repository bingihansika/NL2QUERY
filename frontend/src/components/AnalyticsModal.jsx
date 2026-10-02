import React, { useEffect, useState } from 'react';
import { X, Database, Columns, Table as TableIcon, AlertTriangle, TrendingUp, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAnalytics } from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const COLORS = ['#00f2fe', '#00c6ff', '#38bdf8', '#818cf8', '#a855f7', '#ec4899', '#10b981'];

export const AnalyticsModal = () => {
  const { isAnalyticsOpen, setIsAnalyticsOpen, activeDataset } = useApp();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAnalyticsOpen) {
      setLoading(true);
      getAnalytics(activeDataset?.dataset_id)
        .then(res => setMetrics(res))
        .catch(err => console.error("Analytics fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [isAnalyticsOpen, activeDataset]);

  if (!isAnalyticsOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setIsAnalyticsOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="modal-title">Data Analytics</div>
              <div className="modal-subtitle">Explore your dataset insights</div>
            </div>
          </div>
          <button className="btn-close" onClick={() => setIsAnalyticsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#00f2fe' }}>
            Loading analytics metrics...
          </div>
        ) : metrics ? (
          <>
            {/* Metric Summary Cards */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Total Rows</span>
                  <div className="metric-icon"><Database size={16} /></div>
                </div>
                <div className="metric-value">{metrics.total_rows}</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Columns</span>
                  <div className="metric-icon"><Columns size={16} /></div>
                </div>
                <div className="metric-value">{metrics.total_columns}</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Tables</span>
                  <div className="metric-icon"><TableIcon size={16} /></div>
                </div>
                <div className="metric-value">{metrics.total_tables}</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Null Values</span>
                  <div className="metric-icon" style={{ color: '#ef4444' }}><AlertTriangle size={16} /></div>
                </div>
                <div className="metric-value">{metrics.null_values_count}</div>
              </div>
            </div>

            {/* Charts Grid matching Screenshot 3 & 4 */}
            <div className="charts-grid">
              {/* Distribution Bar Chart */}
              <div className="chart-card">
                <div className="chart-card-title">
                  <BarChart2 size={16} color="#00f2fe" />
                  Distribution Overview
                </div>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart data={metrics.distribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#00f2fe' }} />
                      <Bar dataKey="value" fill="#00f2fe" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Proportion Donut Chart */}
              <div className="chart-card">
                <div className="chart-card-title">
                  <PieIcon size={16} color="#00f2fe" />
                  Proportion Breakdown
                </div>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={metrics.proportion}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        label={({ percentage }) => percentage}
                      >
                        {metrics.proportion.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#00f2fe' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trend Line Chart */}
              {metrics.trend.length > 0 && (
                <div className="chart-card chart-card-full">
                  <div className="chart-card-title">
                    <TrendingUp size={16} color="#00f2fe" />
                    Numerical Trend Analysis
                  </div>
                  <div style={{ width: '100%', height: 220 }}>
                    <ResponsiveContainer>
                      <LineChart data={metrics.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="category" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#00f2fe' }} />
                        <Line type="monotone" dataKey="value" stroke="#00f2fe" strokeWidth={3} dot={{ fill: '#00f2fe', r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            No dataset loaded yet for analytics.
          </div>
        )}
      </div>
    </div>
  );
};
