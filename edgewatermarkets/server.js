const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Set up WebSocket server
const wss = new WebSocket.Server({ noServer: true });

let users = {}; // Store user subscriptions

// Function to handle WebSocket connection and user subscriptions
wss.on('connection', ws => {
  // Unique client ID
  const clientId = Date.now().toString();
  users[clientId] = { ws, subscribedProducts: [] };

  // Listen for incoming messages from the client
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (msg.type === "subscribe") {
      subscribeToProduct(msg.product, ws);
    } else if (msg.type === "unsubscribe") {
      unsubscribeFromProduct(msg.product, ws);
    }
  });

  // Function to send data to subscribed users
  const sendToClient = (message, ws) => {
    ws.send(JSON.stringify(message));
  };

  // Subscribing a user to a product on Coinbase Pro WebSocket
  function subscribeToProduct(product, ws) {
    if (!users[clientId].subscribedProducts.includes(product)) {
      users[clientId].subscribedProducts.push(product);
      // Send WebSocket subscribe message to Coinbase Pro
      sendCoinbaseProMessage({ type: 'subscribe', channels: [{ name: 'level2', product_ids: [product] }, { name: 'matches', product_ids: [product] }] });
    }
  }

  // Unsubscribing a user from a product
  function unsubscribeFromProduct(product, ws) {
    const index = users[clientId].subscribedProducts.indexOf(product);
    if (index !== -1) {
      users[clientId].subscribedProducts.splice(index, 1);
      // Send WebSocket unsubscribe message to Coinbase Pro
      sendCoinbaseProMessage({ type: 'unsubscribe', channels: [{ name: 'level2', product_ids: [product] }, { name: 'matches', product_ids: [product] }] });
    }
  }

  // Send data to Coinbase Pro WebSocket
  function sendCoinbaseProMessage(msg) {
    coinbaseProSocket.send(JSON.stringify(msg));
  }

  // Broadcast product updates to users
  function broadcastToUsers(message) {
    Object.keys(users).forEach(clientId => {
      users[clientId].ws.send(JSON.stringify(message));
    });
  }

  // Connect to Coinbase Pro WebSocket API
  const coinbaseProSocket = new WebSocket("wss://ws-feed.pro.coinbase.com");

  coinbaseProSocket.on('open', () => {
    console.log("Connected to Coinbase Pro WebSocket API.");
  });

  coinbaseProSocket.on('message', (data) => {
    // Broadcast price updates and match data to subscribed users
    broadcastToUsers(JSON.parse(data));
  });

  coinbaseProSocket.on('error', (err) => {
    console.log("Error: ", err);
  });

  coinbaseProSocket.on('close', () => {
    console.log("Disconnected from Coinbase Pro WebSocket API.");
  });

  ws.on('close', () => {
    // Cleanup
    delete users[clientId];
  });
});

// Set up Express to serve the app
app.use(express.static('client/build'));

// Catch all route for client-side routing
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/client/build/index.html');
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
