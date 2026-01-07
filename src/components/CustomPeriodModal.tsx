import React from 'react';

interface CustomPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
}

export const CustomPeriodModal: React.FC<CustomPeriodModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  if (!isOpen) {
    return null;
  }

  const handleApply = () => {
    // Dummy dates for now
    onApply('2024-01-01', '2024-01-31');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '500px',
        }}
      >
        <h2>Custom Period</h2>
        <p>This is a placeholder for the custom period modal.</p>
        <div style={{ marginTop: '20px' }}>
          {/* Add date inputs or a calendar here later */}
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose}>Close</button>
          <button onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
};