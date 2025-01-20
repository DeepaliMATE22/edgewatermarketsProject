import React, { useState } from 'react';

const SubscribeUnsubscribe = () => {
  const [subscribedProducts, setSubscribedProducts] = useState([]);
  const ws = new WebSocket('ws://localhost:3001'); // Connect to WebSocket server

  const handleSubscribe = (product) => {
    ws.send(JSON.stringify({ type: 'subscribe', product }));
    setSubscribedProducts([...subscribedProducts, product]);
  };

  const handleUnsubscribe = (product) => {
    ws.send(JSON.stringify({ type: 'unsubscribe', product }));
    setSubscribedProducts(subscribedProducts.filter(p => p !== product));
  };

  return (
    <div>
      <h2>Subscribe/Unsubscribe</h2>
      <div>
        {['BTC-USD', 'ETH-USD', 'XRP-USD', 'LTC-USD'].map(product => (
          <div key={product}>
            <span>{product}</span>
            <button onClick={() => handleSubscribe(product)}>Subscribe</button>
            <button onClick={() => handleUnsubscribe(product)}>Unsubscribe</button>
            {subscribedProducts.includes(product) && <span> (Subscribed)</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscribeUnsubscribe;
