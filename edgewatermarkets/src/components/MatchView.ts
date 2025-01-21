import React, { useState, useEffect } from 'react';

interface Match {
  timestamp: string;
  product: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
}

const MatchView: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'matches') {
        setMatches((prevMatches) => [...prevMatches, data]);
      }
    };
  }, []);

  return (
    <div>
      <h2>Match View</h2>
      <ul>
        {matches.map((match, index) => (
          <li key={index} style={{ color: match.side === 'buy' ? 'green' : 'red' }}>
            {match.timestamp} | {match.product} | {match.size} | {match.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MatchView;
