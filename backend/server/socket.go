package server

import (
    "github.com/labstack/echo/v4"
    "github.com/gorilla/websocket"
    "sync"
)

type Comment struct {
    ID       int    `json:"id"`
    Content  string `json:"content"`
    Username string `json:"username"`
    VideoID  string `json:"video_id"`
}

var (
    upgrader      = websocket.Upgrader{}
    commentMutex  = &sync.Mutex{}
    commentClients = make(map[*websocket.Conn]bool)
    comments      []Comment
)

func handleWebSocket(c echo.Context) error {
    ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
    if err != nil {
        c.Logger().Error("WebSocket upgrade failed:", err)
        return err
    }
    defer ws.Close()

    c.Logger().Info("WebSocket connection established")

    for {
        _, msg, err := ws.ReadMessage()
        if err != nil {
            c.Logger().Error("WebSocket read error:", err)
            break
        }
        c.Logger().Info("Message received:", string(msg))

        // Echo back the message (for testing purposes)
        err = ws.WriteMessage(websocket.TextMessage, msg)
        if err != nil {
            c.Logger().Error("WebSocket write error:", err)
            break
        }
    }
    return nil
}
