import React, { useState, useEffect } from 'react';

interface Price {
  product: string;
  bids: any[];
  asks: any[];
}

const PriceView: React.FC = () => {
  const [prices, setPrices] = useState<Price[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'level2') {
        setPrices((prevPrices) => {
          const updatedPrices = [...prevPrices];
          const index = updatedPrices.findIndex((p) => p.product === data.product);
          if (index === -1) {
            updatedPrices.push(data);
          } else {
            updatedPrices[index] = data;
          }
          return updatedPrices;
        });
      }
    };
  }, []);

  return (
    <div>
      <h2>Price View</h2>
      {prices.map((price) => (
        <div key={price.product}>
          <h3>{price.product}</h3>
          <pre>{JSON.stringify(price, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default PriceView;
