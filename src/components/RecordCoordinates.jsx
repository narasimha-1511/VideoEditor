import React, { useState } from 'react';
import { saveAs } from 'file-saver';

const RecordCoordinates = ({ crop, playbackRate, volume, time }) => {
  const [recordedData, setRecordedData] = useState([]);

  const recordData = () => {
    setRecordedData([...recordedData, { time, coordinates: crop, volume, playbackRate }]);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(recordedData, null, 2)], { type: 'application/json' });
    saveAs(blob, 'recorded-data.json');
  };

  return (
    <div className="record-coordinates">
      <button onClick={recordData}>Record Data</button>
      <button onClick={downloadJson}>Download JSON</button>
    </div>
  );
};

export default RecordCoordinates;
