import React, { useEffect, useRef } from 'react';

interface DialogProps {
  children: React.ReactNode;
  onClose: () => void;
  onPosition: (position: { left: number; top: number }) => void;
}

const Dialog: React.FC<DialogProps> = ({ children, onClose, onPosition }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dialogRef.current) {
      const dialogPosition = dialogRef.current.getBoundingClientRect();
      onPosition({ left: dialogPosition.left, top: dialogPosition.top });
    }
  }, [onPosition]); // onPositionの変更があった場合にのみ実行

  return (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        ref={dialogRef}
        style={{
          position: 'relative',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '650px',
          height: '450px',
        }}
      >
        {children}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Dialog;
