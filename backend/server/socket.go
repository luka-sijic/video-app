package server

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WebSocketServer struct {
	clients   map[*websocket.Conn]bool
	broadcast chan []byte
}

func NewWebSocketServer() *WebSocketServer {
	return &WebSocketServer{
		clients:   make(map[*websocket.Conn]bool),
		broadcast: make(chan []byte),
	}
}

func (ws *WebSocketServer) handleConnections(c echo.Context) error {
	// Upgrade initial GET request to a WebSocket connection
	wsConn, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Printf("Error upgrading connection: %v", err)
		return err
	}
	defer wsConn.Close()

	// Register new client
	ws.clients[wsConn] = true

	for {
		// Read a new message from the WebSocket
		_, message, err := wsConn.ReadMessage()
		if err != nil {
			log.Printf("Error reading message: %v", err)
			delete(ws.clients, wsConn)
			break
		}

		// Broadcast the message to all clients
		ws.broadcast <- message
	}

	return nil
}

func (ws *WebSocketServer) handleBroadcasts() {
	for {
		// Wait for a message to be broadcasted
		message := <-ws.broadcast

		// Send the message to all connected clients
		for client := range ws.clients {
			err := client.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				log.Printf("Error sending message: %v", err)
				client.Close()
				delete(ws.clients, client)
			}
		}
	}
}