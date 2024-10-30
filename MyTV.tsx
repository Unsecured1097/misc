import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import dayjs from "dayjs";

const data = [
  { date: '2024-10-01', price: 10 },
  { date: '2024-10-02', price: 15 },
  { date: '2024-10-03', price: 8 },
  { date: '2024-10-04', price: 12 },
  { date: '2024-10-05', price: 9 },
  { date: '2024-10-06', price: 9 },
  { date: '2024-10-10', price: 9 },
];

const MyTradingView = () => {
  const [lines, setLines] = useState([]);
  const [dragStart, setDragStart] = useState(null);
  const [editingLineIndex, setEditingLineIndex] = useState(null);
  const [editValues, setEditValues] = useState({ yValue: '', xStart: '', xEnd: '' });
  const chartRef = useRef(null);
  const minDrawDistance = 30;

  const handleMouseDown = (e) => {
    if (chartRef.current && e) {
      const { left } = chartRef.current.getBoundingClientRect();
      const clickX = e.clientX - left;
      setDragStart(clickX);
    }
  };

  const handleMouseUp = (e) => {
    if (chartRef.current && dragStart !== null) {
      const { left, top, height } = chartRef.current.getBoundingClientRect();
      const clickX = e.clientX - left;

      if (Math.abs(clickX - dragStart) >= minDrawDistance) {
        const xStartIndex = Math.floor(dragStart / (600 / (data.length - 1)));
        const xEndIndex = Math.floor(clickX / (600 / (data.length - 1)));

        const yMin = Math.min(...data.map(d => d.price)) - 1;
        const yMax = Math.max(...data.map(d => d.price)) + 1;
        const clickY = e.clientY - top;
        const yValue = yMax - ((clickY / height) * (yMax - yMin));

        setLines([...lines, { yValue: Math.min(Math.max(yValue, yMin), yMax), xStart: xStartIndex, xEnd: xEndIndex }]);
      }
      setDragStart(null);
    }
  };

  const handleLineClick = (index) => {
    setEditingLineIndex(index);
    setEditValues({
      yValue: lines[index].yValue.toFixed(2),
      xStart: lines[index].xStart,
      xEnd: lines[index].xEnd,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues({ ...editValues, [name]: value });
  };

  const handleEditConfirm = () => {
    const updatedLines = lines.map((line, index) =>
      index === editingLineIndex
        ? {
            ...line,
            yValue: Math.min(Math.max(parseFloat(editValues.yValue), Math.min(...data.map(d => d.price))), Math.max(...data.map(d => d.price))),
            xStart: parseInt(editValues.xStart),
            xEnd: parseInt(editValues.xEnd),
          }
        : line
    );
    setLines(updatedLines);
    setEditingLineIndex(null);
  };

  const handleEditCancel = () => {
    setEditingLineIndex(null);
  };

  const handleDeleteLine = () => {
    if (editingLineIndex !== null) {
      const updatedLines = lines.filter((_, index) => index !== editingLineIndex);
      setLines(updatedLines);
      setEditingLineIndex(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete') {
        handleDeleteLine();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingLineIndex, lines]);

  const getXPosition = (index) => {
    return (index * (600 / (data.length - 1))) + (600 / (data.length - 1)) / 2;
  };

  return (
    <div
      ref={chartRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{ position: 'relative', width: '600px', height: '400px' }}
    >
      <LineChart width={1200} height={400} data={data}>
        <XAxis dataKey="date" tickFormatter={(value) => dayjs(value).format("YYYY-MM-DD")} />
        <YAxis domain={[Math.min(...data.map(d => d.price)) - 1, Math.max(...data.map(d => d.price)) + 1]} />
        <Tooltip />
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="price" stroke="#8884d8" />

        {lines.map((line, index) => {
          const yMin = Math.min(...data.map(d => d.price)) - 1;
          const yMax = Math.max(...data.map(d => d.price)) + 1;
          const yPosition = ((yMax - line.yValue) / (yMax - yMin)) * 400;

          return (
            <g key={index} onClick={(e) => { e.stopPropagation(); handleLineClick(index); }}>
              <line
                x1={getXPosition(line.xStart)}
                x2={getXPosition(line.xEnd)}
                y1={yPosition}
                y2={yPosition}
                stroke={editingLineIndex === index ? "blue" : "red"}
                strokeDasharray="3 3"
                strokeWidth="2"
              />
              <text
                x={getXPosition(line.xEnd)}
                y={yPosition - 5}
                fill={editingLineIndex === index ? "blue" : "red"}
                textAnchor="end"
              >
                Y={line.yValue.toFixed(2)}
              </text>
            </g>
          );
        })}
      </LineChart>

      {editingLineIndex !== null && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '620px',
            padding: '10px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            width: '200px',
          }}
        >
          <h4>Edit Line</h4>
          <label>
            Y Value:
            <input
              type="number"
              name="yValue"
              value={editValues.yValue}
              onChange={handleInputChange}
            />
          </label>
          <br />
          <label>
            X Start (Date):
            <select
              name="xStart"
              value={editValues.xStart}
              onChange={handleInputChange}
            >
              {data.map((d, index) => (
                <option key={index} value={index}>
                  {d.date}
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>
            X End (Date):
            <select
              name="xEnd"
              value={editValues.xEnd}
              onChange={handleInputChange}
            >
              {data.map((d, index) => (
                <option key={index} value={index}>
                  {d.date}
                </option>
              ))}
            </select>
          </label>
          <br />
          <button onClick={handleEditConfirm}>Confirm</button>
          <button onClick={handleEditCancel} style={{ marginLeft: '5px' }}>Cancel</button>
          <button onClick={handleDeleteLine} style={{ marginLeft: '5px' }}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default MyTradingView;
