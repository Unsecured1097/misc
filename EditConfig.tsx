import React, { useState, useEffect } from 'react';

interface EditConfigProps {
  dateToXMap: Record<string, number>; // 日付から X 座標へのマッピング
  xToDateMap: Record<number, string>; // X 座標から日付へのマッピング
  lineInfo: {
    id: number;
    graphX: number;
    graphY: number;
    screenX: number;
    screenY: number;
  } | null;
  onClose: () => void;
  onEdit: (line: { startX: number; startY: number; endX: number; endY: number }) => void;
  position: { left: number; top: number } | null;
  startDate: string; // 新しいプロパティを追加
  endDate: string; // 新しいプロパティを追加
  chartHeight: number; // 新しいプロパティを追加
  strike: number; // Strike値を受け取る
}

const EditConfig: React.FC<EditConfigProps> = ({
  lineInfo,
  onClose,
  onEdit,
  position,
  startDate,
  endDate,
  dateToXMap,
  xToDateMap,
  chartHeight,
  strike,
}) => {
  const [startX, setStartX] = useState<string>('');
  const [endX, setEndX] = useState<string>('');
  const [barrier, setBarrier] = useState<string>(''); // Barrierの状態をbarrierに変更

  const getDateFromX = (x: number) => xToDateMap[x] || '';
  const getXFromDate = (date: string) => dateToXMap[date] || 0;

  // yPosからBarrierを計算する関数
  const calculateBarrierFromYPos = (yPos: number) => {
    const yMin = strike * 0.79;
    const yMax = strike * 1.25;
    return yMax - ((yMax - yMin) / (chartHeight * 0.8)) * yPos;
  };

  useEffect(() => {
    if (lineInfo) {
      // lineInfoが存在する場合に値を設定
      setStartX(getDateFromX(lineInfo.graphX)); // X 座標から日付形式に変換
      setEndX(getDateFromX(lineInfo.screenX)); // X 座標から日付形式に変換
      setBarrier(calculateBarrierFromYPos(lineInfo.graphY).toString()); // Barrierを計算して設定
    } else {
      // 初期値を設定（lineInfoがない場合）
      setStartX(startDate);
      setEndX(endDate);
      setBarrier(''); // 初期値として空の文字列を設定
    }
  }, [lineInfo, startDate, endDate, strike, chartHeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startX && endX && barrier) {
      // 日付を数値に変換するヘルパー関数
      const startXNum = getXFromDate(startX);
      const endXNum = getXFromDate(endX);
      const barrierNum = Number(barrier);

      // Y座標を計算
      const yMin = strike * 0.79;
      const yMax = strike * 1.25;
      const yPos = chartHeight * 0.8 - ((barrierNum - yMin) / (yMax - yMin)) * (chartHeight * 0.8);

      onEdit({
        startX: startXNum,
        startY: yPos, // BarrierをY座標に変換
        endX: endXNum,
        endY: yPos, // BarrierをY座標に変換
      });
      onClose();
    }
  };

  return (
    <div style={{ position: 'absolute', ...position, border: '1px solid black', backgroundColor: 'white', padding: '10px' }}>
      <h3>Edit Line</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Start Date:</label>
          <input type="date" value={startX} onChange={(e) => setStartX(e.target.value)} />
        </div>
        <div>
          <label>End Date:</label>
          <input type="date" value={endX} onChange={(e) => setEndX(e.target.value)} />
        </div>
        <div>
          <label>Barrier:</label>
          <input type="text" value={barrier} onChange={(e) => setBarrier(e.target.value)} /> {/* Barrierを入力させる */}
        </div>
        <button type="submit">Save</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default EditConfig;
