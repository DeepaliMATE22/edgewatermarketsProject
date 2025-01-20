import React, { useState, useEffect } from 'react';

const PriceView = () => {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'level2') {
        setPrices(prevPrices => ({ ...prevPrices, [data.product]: data }));
      }
    };
  }, []);

  return (
    <div>
      <h2>Price View</h2>
      {Object.keys(prices).map(product => (
        <div key={product}>
          <h3>{product}</h3>
          <pre>{JSON.stringify(prices[product], null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default PriceView;
