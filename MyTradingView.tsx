import React, { useState } from 'react';
import EditConfig from './EditConfig';

// 日付を数値に変換するヘルパー関数
const dateToNumber = (date: string) => new Date(date).getTime();

interface MyTradingViewProps {
  strike: number | '';
  startDate: string;
  endDate: string;
}
const createDateToXMap = (startDate: string, endDate: string, chartWidth: number, offsetX: number) => {
  const startX = dateToNumber(startDate);
  const endX = dateToNumber(endDate);
  const tickCount = Math.floor((endX - startX) / (1000 * 60 * 60 * 24)) + 1;
  const maxXTicks = 4;
  const interval = Math.max(Math.floor(tickCount / (maxXTicks - 1)), 1);

  const dateToXMap: Record<string, number> = {};
  const xToDateMap: Record<number, string> = {};

  for (let index = 0; index < maxXTicks; index++) {
    const dateIndex = index * interval;
    const date = new Date(startX + dateIndex * (1000 * 60 * 60 * 24));
    const xPos = ((dateIndex / (tickCount - 1)) * (chartWidth - offsetX - 40)) + offsetX;

    dateToXMap[date.toISOString().split('T')[0]] = xPos; // 日付をキーに X 座標を設定
    xToDateMap[xPos] = date.toISOString().split('T')[0]; // X 座標をキーに日付を設定
  }

  return { dateToXMap, xToDateMap };
};

const MyTradingView: React.FC<MyTradingViewProps> = ({ strike, startDate, endDate }) => {
  const chartWidth = 600; // チャートの幅
  const chartHeight = 400; // チャートの高さ
  const offsetX = 60; // 全体を右にシフトするオフセット

  const [lines, setLines] = useState<{ startX: number; startY: number; endX: number; endY: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [editConfigVisible, setEditConfigVisible] = useState(false);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [dialogPosition, setDialogPosition] = useState<{ left: number, top: number } | null>(null);
  const { dateToXMap, xToDateMap } = createDateToXMap(startDate, endDate, chartWidth, offsetX);
  const [barriers, setBarriers] = useState<{ startDate: string; endDate: string; barrier: number }[]>([]);


  const handleLineClick = (index: number, event: React.MouseEvent<SVGRectElement>) => {
    event.stopPropagation(); // 親のイベントを停止
    setSelectedLineIndex(index);
    setEditConfigVisible(true);
    
    // 線の終点の位置を使用してダイアログの位置を設定
    const line = lines[index];
    const dialogLeft = line.endX + offsetX; // offsetX を考慮して位置を調整
    const dialogTop = line.endY; // Y座標を直接使用
    
    setDialogPosition({ left: dialogLeft, top: dialogTop }); // ダイアログ位置を設定
  };

  const getLineInfo = (index: number) => {
    const line = lines[index];
    return {
      id: index,
      graphX: line.startX,
      graphY: line.startY,
      screenX: line.endX,
      screenY: line.endY,
    };
  };

  const handleEditConfigClose = () => {
    setEditConfigVisible(false);
    setSelectedLineIndex(null);
  };

  const handleLineEdit = (line: { startX: number; startY: number; endX: number; endY: number }) => {
    if (selectedLineIndex !== null) {
      const newLines = [...lines];
      newLines[selectedLineIndex] = line;
      setLines(newLines);
    }
  };

  if (strike === '') return null;

  const yMin = strike * 0.79;
  const yMax = strike * 1.25;

  const renderXTicks = () => {
    const startX = dateToNumber(startDate);
    const endX = dateToNumber(endDate);
    const tickCount = Math.floor((endX - startX) / (1000 * 60 * 60 * 24)) + 1;
    const maxXTicks = 4;
    const interval = Math.max(Math.floor(tickCount / (maxXTicks - 1)), 1);

    return Array.from({ length: maxXTicks }, (_, index) => {
      const dateIndex = index * interval;
      const date = new Date(startX + dateIndex * (1000 * 60 * 60 * 24));
      const xPos = ((dateIndex / (tickCount - 1)) * (chartWidth - offsetX - 40)) + offsetX;
      return (
        <g key={`x-${index}`}>
          <line x1={xPos} y1="80%" x2={xPos} y2="85%" stroke="black" strokeWidth="1" />
          <text x={xPos} y="90%" textAnchor="middle" fontSize="10">{date.toLocaleDateString()}</text>
        </g>
      );
    });
  };

  const renderYTicks = () => {
    const yTicks = [strike * 0.8, strike, strike * 1.2];
    return yTicks.map((value, index) => {
      const yPos = chartHeight * 0.8 - ((value - yMin) / (yMax - yMin)) * (chartHeight * 0.8);
      return (
        <g key={`y-${index}`}>
          <line x1={offsetX - 5} y1={yPos} x2={offsetX} y2={yPos} stroke="black" strokeWidth="1" />
          <text x={offsetX - 10} y={yPos + 3} textAnchor="end" fontSize="10">{value.toFixed(1)}</text>
        </g>
      );
    });
  };

  const getNearestXPosition = (x: number) => {
    const startX = dateToNumber(startDate);
    const endX = dateToNumber(endDate);
    const tickCount = Math.floor((endX - startX) / (1000 * 60 * 60 * 24)) + 1;
    const xPositions = Array.from({ length: tickCount }, (_, index) => {
      const date = new Date(startX + index * (1000 * 60 * 60 * 24));
      return ((index / (tickCount - 1)) * (chartWidth - offsetX - 40)) + offsetX;
    });

    return xPositions.reduce((prev, curr) => Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev);
  };

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const boundingRect = event.currentTarget.getBoundingClientRect();
    const startX = event.clientX - boundingRect.left;
    const startY = event.clientY - boundingRect.top;

    const nearestStartX = getNearestXPosition(startX);
    
    setCurrentLine({ startX: nearestStartX, startY, endX: nearestStartX, endY: startY });
    setIsDrawing(true);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!isDrawing || !currentLine) return;
    const boundingRect = event.currentTarget.getBoundingClientRect();
    const endX = event.clientX - boundingRect.left;
    const nearestX = getNearestXPosition(endX);
    setCurrentLine({ ...currentLine, endX: nearestX });
  };

  const handleMouseUp = () => {
    if (currentLine) {
      setLines((prevLines) => [...prevLines, currentLine]);
      setCurrentLine(null);
    }
    setIsDrawing(false);
  };

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', left: '0px', top: '0px', border: '1px solid red' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <line x1={offsetX} y1="80%" x2="100%" y2="80%" stroke="black" strokeWidth="1" />
        <line x1={offsetX} y1="0" x2={offsetX} y2="80%" stroke="black" strokeWidth="1" />
        {renderXTicks()}
        {renderYTicks()}
        {lines.map((line, index) => {
          const lineX1 = line.startX;
          const lineY1 = line.startY;
          const lineX2 = line.endX;
          const lineY2 = line.endY;
          const lineWidth = 25; // 線のクリック範囲の幅

          return (
            <g key={`line-${index}`}>
              {/* クリック判定用の広い矩形を追加 */}
              <rect
                x={Math.min(lineX1, lineX2) - lineWidth / 2}
                y={Math.min(lineY1, lineY2) - lineWidth / 2}
                width={Math.abs(lineX2 - lineX1) + lineWidth}
                height={Math.abs(lineY2 - lineY1) + lineWidth}
                fill="transparent"
                onClick={(event) => handleLineClick(index, event)} // イベントを渡す
              />
              <line x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2} stroke="blue" strokeWidth="2" />
            </g>
          );
        })}
        {isDrawing && currentLine && (
          <line
            x1={currentLine.startX}
            y1={currentLine.startY}
            x2={currentLine.endX}
            y2={currentLine.endY}
            stroke="red"
            strokeWidth="2"
          />
        )}
      </svg>
      {editConfigVisible && (
        <EditConfig
          lineInfo={getLineInfo(selectedLineIndex!)}
          onClose={handleEditConfigClose}
          onEdit={handleLineEdit}
          position={dialogPosition}
          startDate={startDate}
          endDate={endDate}
          dateToXMap={dateToXMap}
          xToDateMap={xToDateMap}
          chartHeight={chartHeight} // chartHeightを渡す
          strike={strike} // strikeを渡す
        />
      )}
    </div>
  );
};

export default MyTradingView;
