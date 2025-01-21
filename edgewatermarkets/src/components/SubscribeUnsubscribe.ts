import React, { useState } from 'react';

interface Props {
  ws: WebSocket;
}

const SubscribeUnsubscribe: React.FC<Props> = ({ ws }) => {
  const [subscribedProducts, setSubscribedProducts] = useState<string[]>([]);

  const handleSubscribe = (product: string) => {
    ws.send(JSON.stringify({ type: 'subscribe', product }));
    setSubscribedProducts((prev) => [...prev, product]);
  };

  const handleUnsubscribe = (product: string) => {
    ws.send(JSON.stringify({ type: 'unsubscribe', product }));
    setSubscribedProducts((prev) => prev.filter((p) => p !== product));
  };

  return (
    <div>
      <h2>Subscribe / Unsubscribe</h2>
      {['BTC-USD', 'ETH-USD', 'XRP-USD', 'LTC-USD'].map((product) => (
        <div key={product}>
          <span>{product}</span>
          <button onClick={() => handleSubscribe(product)}>Subscribe</button>
          <button onClick={() => handleUnsubscribe(product)}>Unsubscribe</button>
          {subscribedProducts.includes(product) && <span> (Subscribed)</span>}
        </div>
      ))}
    </div>
  );
};

export default SubscribeUnsubscribe;
