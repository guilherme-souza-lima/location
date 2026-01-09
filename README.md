# Real-Time Location System

A real-time location tracking system comprising a Go backend, a React Admin Dashboard, and a simple HTML/JS User Provider.

## Architecture

- **Backend**: Go (Golang) WebSocket server.
- **Frontend Admin**: React + Vite + TailwindCSS + MapLibre.
- **Frontend User**: Vanilla HTML/JS.

## Deployment

The project is fully containerized using Docker Compose.

### Ports

| Service | Port | Description |
|---------|------|-------------|
| **Admin Dashboard** | `1890` | The main map interface for admins. |
| **Location Provider** | `1880` | The user interface to send location data. |
| **API / Backend** | `1800` | The WebSocket server. |

### How to Run

1.  **Prerequisites**: Ensure Docker and Docker Compose are installed.
2.  **Start Services**:
    Run the following command in the project root:

    ```bash
    docker-compose up -d --build
    ```

    *The `--build` flag ensures that the containers are built with the latest code changes.*

3.  **Access Applications**:
    -   **Admin**: [http://localhost:1890](http://localhost:1890)
    -   **User**: [http://localhost:1880](http://localhost:1880)

## Development

To run locally without Docker (dev mode):

1.  **Backend**: `cd backend && go run .` (Default: 8080)
2.  **Admin**: `cd frontend-admin && npm run dev` (Default: 5173)
3.  **User**: Serve `frontend-user` directory (e.g., `python3 -m http.server 8000`)

*Note: You will need to revert port changes in `docker-compose.yml` and frontend code if you switch back to default dev ports.*
