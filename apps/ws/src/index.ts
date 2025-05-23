import { WebSocketServer, WebSocket } from "ws";

const PORT = 8081;

const wss = new WebSocketServer({
  port: PORT,
});

wss.on("connection", (ws: WebSocket) => {
  console.log("New WebSocket connection established");

  ws.on("message", (message: Buffer) => {
    let messageToSend: string;

    try {
      messageToSend = message.toString("utf8");
      console.log("Received text message:", messageToSend);
    } catch (error) {
      messageToSend = "Binary message received";
      console.log("Received binary message of length:", message.length);
    }

    ws.send(messageToSend);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
