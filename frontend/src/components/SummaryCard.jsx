import React from 'react';
import { Sparkles } from 'lucide-react';

export const SummaryCard = ({ summary }) => {
  if (!summary) return null;

  // Simple Markdown parser for bullet points & bold formatting matching Image 4
  const renderFormattedSummary = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <br key={idx} />;

      const isBullet = trimmed.startsWith('*') || trimmed.startsWith('-');
      if (isBullet) {
        trimmed = trimmed.replace(/^[\*\-]\s*/, '');
      }

      // Convert **bold** tags to <strong>
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const parsedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: '#00f2fe' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginLeft: line.startsWith('  ') ? '24px' : '8px', margin: '4px 0' }}>
            <span style={{ color: '#00f2fe', fontWeight: 'bold' }}>•</span>
            <span style={{ color: '#f8fafc', fontSize: '0.92rem', lineHeight: '1.5' }}>{parsedLine}</span>
          </div>
        );
      }

      return (
        <div key={idx} style={{ color: '#f8fafc', fontSize: '0.94rem', lineHeight: '1.6', marginBottom: '8px' }}>
          {parsedLine}
        </div>
      );
    });
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(0, 242, 254, 0.25)',
      borderRadius: '14px',
      padding: '20px 24px',
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #00f2fe, #0072ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        flexShrink: 0
      }}>
        <Sparkles size={20} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
          Natural Language Summary
        </div>
        <div>{renderFormattedSummary(summary)}</div>
      </div>
    </div>
  );
};
