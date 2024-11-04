import React, { useState, useCallback } from 'react';
import MyTradingView from './MyTradingView';
import Dialog from './Dialog';

const App: React.FC = () => {
  const [showTradingView, setShowTradingView] = useState(false);
  const [dialogPosition, setDialogPosition] = useState<{ left: number, top: number } | null>(null);
  const [strike, setStrike] = useState<number | ''>(100); 
  const [startDate, setStartDate] = useState<string>('2024-11-01');
  const [endDate, setEndDate] = useState<string>('2024-11-04');

  const handleOpenTradingView = () => {
    if (strike !== '' && startDate && endDate) {
      setShowTradingView(true);
    } else {
      alert('Please enter strike, start date, and end date.');
    }
  };

  const handlePosition = useCallback((position: { left: number; top: number }) => {
    setDialogPosition(position);
  }, []); // 依存配列を空にすることで、関数の再生成を防ぐ

  return (
    <div>
      <div>
        <label>
          Strike:
          <input
            type="number"
            value={strike}
            onChange={(e) => setStrike(Number(e.target.value))}
          />
        </label>
      </div>
      <div>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleOpenTradingView}>Open Trading View</button>
      {showTradingView && (
        <Dialog
          onClose={() => setShowTradingView(false)}
          onPosition={handlePosition} // メモ化された関数を使用
        >
          <MyTradingView strike={strike} startDate={startDate} endDate={endDate} dialogPosition={dialogPosition} />
        </Dialog>
      )}
    </div>
  );
};

export default App;
