package main

import (
	"encoding/json"
	"fmt"
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
			log.Printf("Client registered. Role: %s. Total clients: %d", client.role, len(h.clients))

			// If it's a viewer, send them all the last known locations
			if client.role == "viewer" {
				log.Printf("New viewer connected. Sending %d stored locations.", len(h.lastLocations))
				for _, msg := range h.lastLocations {
					client.send <- msg
				}
			}

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("Client unregistered. Role: %s", client.role)

				// Handle Provider Disconnect
				if client.role == "provider" && client.id != "" {
					delete(h.lastLocations, client.id)
					disconnectMsg := []byte(fmt.Sprintf(`{"type":"disconnect","id":"%s"}`, client.id))
					log.Printf("Provider disconnected: %s. Broadcasting removal.", client.id)

					// Broadcast disconnect to all viewers
					for viewer := range h.clients {
						if viewer.role == "viewer" {
							select {
							case viewer.send <- disconnectMsg:
							default:
								close(viewer.send)
								delete(h.clients, viewer)
							}
						}
					}
				}
			}
		case message := <-h.broadcast:
			// Store the message if it has an ID
			var msgID MessageID
			if err := json.Unmarshal(message, &msgID); err == nil && msgID.ID != "" {
				h.lastLocations[msgID.ID] = message
				// log.Printf("Stored location for %s. Cache size: %d", msgID.ID, len(h.lastLocations))
			} else {
				log.Printf("Example error decoding: %v", err)
			}

			// log.Printf("Broadcasting message: %s", message)
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
