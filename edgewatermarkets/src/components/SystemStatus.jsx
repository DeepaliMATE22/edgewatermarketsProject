import React, { useState, useEffect } from 'react';

const SystemStatus = () => {
  const [status, setStatus] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'status') {
        setStatus(data.channels);
      }
    };
  }, []);

  return (
    <div>
      <h2>System Status</h2>
      <ul>
        {status.map((channel, index) => (
          <li key={index}>{channel.name} | {channel.product_ids.join(', ')}</li>
        ))}
      </ul>
    </div>
  );
};

export default SystemStatus;
