import express, { Request, Response } from "express";
import WebSocket from "ws";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// WebSocket server to handle user connections
const wss = new WebSocket.Server({ noServer: true });

// Store user subscriptions
let users: { [key: string]: { ws: WebSocket; subscribedProducts: string[] } } = {};

// Subscribe/unsubscribe handlers
function subscribeToProduct(product: string, ws: WebSocket, clientId: string) {
  if (!users[clientId].subscribedProducts.includes(product)) {
    users[clientId].subscribedProducts.push(product);
    sendCoinbaseProMessage({ type: 'subscribe', channels: [{ name: 'level2', product_ids: [product] }, { name: 'matches', product_ids: [product] }] });
  }
}

function unsubscribeFromProduct(product: string, ws: WebSocket, clientId: string) {
  const index = users[clientId].subscribedProducts.indexOf(product);
  if (index !== -1) {
    users[clientId].subscribedProducts.splice(index, 1);
    sendCoinbaseProMessage({ type: 'unsubscribe', channels: [{ name: 'level2', product_ids: [product] }, { name: 'matches', product_ids: [product] }] });
  }
}

// Send message to Coinbase Pro WebSocket
function sendCoinbaseProMessage(msg: { type: string; channels: Array<{ name: string; product_ids: string[] }> }) {
  if (coinbaseProSocket && coinbaseProSocket.readyState === WebSocket.OPEN) {
    coinbaseProSocket.send(JSON.stringify(msg));
  }
}

// WebSocket connection handler
wss.on("connection", (ws) => {
  const clientId = Date.now().toString(); // Unique client ID
  users[clientId] = { ws, subscribedProducts: [] };

  // Handle incoming messages from clients
  ws.on("message", (message: string) => {
    const msg = JSON.parse(message);
    if (msg.type === "subscribe") {
      subscribeToProduct(msg.product, ws, clientId);
    } else if (msg.type === "unsubscribe") {
      unsubscribeFromProduct(msg.product, ws, clientId);
    }
  });

  // Broadcast updates to the client
  const sendToClient = (message: any) => {
    ws.send(JSON.stringify(message));
  };

  // Handle disconnect
  ws.on("close", () => {
    delete users[clientId];
  });
});

// Create WebSocket connection to Coinbase Pro API
const coinbaseProSocket = new WebSocket("wss://ws-feed.pro.coinbase.com");

coinbaseProSocket.on("open", () => {
  console.log("Connected to Coinbase Pro WebSocket API.");
});

coinbaseProSocket.on("message", (data: string) => {
  // Broadcast the message from Coinbase Pro to all subscribed clients
  const parsedData = JSON.parse(data);
  Object.values(users).forEach(({ ws }) => {
    ws.send(data);
  });
});

coinbaseProSocket.on("close", () => {
  console.log("Disconnected from Coinbase Pro WebSocket API.");
});

// Setup the Express server and WebSocket handling
app.use(express.static("client/build"));

app.get("*", (req: Request, res: Response) => {
  res.sendFile(__dirname + "/client/build/index.html");
});

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Upgrade HTTP connection to WebSocket connection
server.on("upgrade", (request: Request, socket: any, head: any) => {
  wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
    wss.emit("connection", ws, request);
  });
});
