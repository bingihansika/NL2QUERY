import React, { useState } from 'react';
import { Table, BarChart2, FileText, Download, Check, Edit2, RotateCw, Copy } from 'lucide-react';
import { DataTableView } from './DataTableView';
import { ChartView } from './ChartView';
import { SummaryCard } from './SummaryCard';

export const QueryResultCard = ({ resultData }) => {
  const [activeTab, setActiveTab] = useState('table');
  const [copied, setCopied] = useState(false);

  const {
    query,
    query_type,
    columns = [],
    rows = [],
    total_records = 0,
    visualization,
    summary,
    error
  } = resultData;

  const handleCopyQuery = () => {
    if (!query) return;
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!columns.length || !rows.length) return;
    const csvRows = [
      columns.join(','),
      ...rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="query-response-card">
      {/* Top Natural Language AI Summary Banner matching screenshot 2 & 3 */}
      {summary && !error && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#f8fafc',
          fontSize: '0.92rem',
          lineHeight: '1.6'
        }}>
          {summary}
        </div>
      )}

      {/* Generated Query Code Block */}
      <div>
        <div className="code-block-header">
          <div className="code-title">GENERATED {query_type || 'QUERY'}</div>
          <div className="code-actions">
            <button className="code-pill" onClick={handleCopyQuery}>
              {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button className="code-pill">
              <Edit2 size={12} /> Edit
            </button>
            <button className="code-pill executed">
              <Check size={12} /> Executed
            </button>
            <button className="code-pill">
              <RotateCw size={12} /> Regenerate
            </button>
          </div>
        </div>

        <div className="code-container">
          {query || "-- No query generated"}
        </div>
      </div>

      {error ? (
        <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem' }}>
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <>
          {/* Query Results Box matching Screenshot 1 */}
          <div style={{
            background: '#0a0e17',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {/* Output Tabs Bar matching Screenshot 1 */}
            <div className="result-tabs-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Query Results</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{total_records} rows returned</div>
                </div>
              </div>

              <div className="result-tabs">
                <button
                  className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
                  onClick={() => setActiveTab('table')}
                >
                  <Table size={14} /> Table
                </button>

                <button
                  className={`tab-btn ${activeTab === 'chart' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chart')}
                >
                  <BarChart2 size={14} /> Chart
                </button>

                <button
                  className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('summary')}
                >
                  <FileText size={14} /> Summary
                </button>

                <button className="btn-export" onClick={handleExportCSV}>
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            {/* Active Tab View */}
            <div>
              {activeTab === 'table' && <DataTableView columns={columns} rows={rows} />}
              {activeTab === 'chart' && (
                <ChartView visualization={visualization} columns={columns} rows={rows} />
              )}
              {activeTab === 'summary' && <SummaryCard summary={summary} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
