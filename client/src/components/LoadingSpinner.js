import React from 'react';

export default function LoadingSpinner({ size = 'medium' }) {
  const spinnerSize = size === 'large' ? '60px' : size === 'small' ? '20px' : '40px';

  return (
    <div
      style={{
        width: spinnerSize,
        height: spinnerSize,
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #8a5a44',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: 'auto'
      }}
    />
  );
}
