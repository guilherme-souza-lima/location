package main

import (
	"encoding/json"
	"log"
)

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client

	// Last known location for each provider (keyed by provider ID)
	lastLocations map[string][]byte
}

func newHub() *Hub {
	return &Hub{
		broadcast:     make(chan []byte),
		register:      make(chan *Client),
		unregister:    make(chan *Client),
		clients:       make(map[*Client]bool),
		lastLocations: make(map[string][]byte),
	}
}

// Minimal struct to extract ID from message
type MessageID struct {
	ID string `json:"id"`
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			// If it's a viewer, send them all the last known locations
			if client.role == "viewer" {
				for _, msg := range h.lastLocations {
					client.send <- msg
				}
			}

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			// Store the message if it has an ID
			var msgID MessageID
			if err := json.Unmarshal(message, &msgID); err == nil && msgID.ID != "" {
				h.lastLocations[msgID.ID] = message
			}

			log.Printf("Broadcasting message: %s", message)
			for client := range h.clients {
				if client.role == "viewer" {
					select {
					case client.send <- message:
						// log.Printf("Sent to viewer: %s", client.conn.RemoteAddr())
					default:
						close(client.send)
						delete(h.clients, client)
					}
				}
			}
		}
	}
}
