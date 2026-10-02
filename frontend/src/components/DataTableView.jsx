import React from 'react';

export const DataTableView = ({ columns, rows }) => {
  if (!rows || rows.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        No rows returned by database query.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((val, cIdx) => (
                <td key={cIdx}>
                  {val === null || val === undefined ? (
                    <span style={{ color: '#64748b', italic: 'true' }}>null</span>
                  ) : (
                    String(val)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
