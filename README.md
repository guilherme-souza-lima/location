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

## HTTPS & Production Setup

**Important**: The Browser Geolocation API requires `HTTPS` to work on devices other than `localhost`.

To deploy this in production with HTTPS:

1.  **Nginx Proxy Pass**: Configure Nginx on your host machine to forward traffic to the exposed Docker ports.
    
    Example Nginx Config Block:
    ```nginx
    server {
        server_name map.yourdomain.com;
        location / {
            proxy_pass http://localhost:1890;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
    
    server {
        server_name track.yourdomain.com;
        location / {
            proxy_pass http://localhost:1880;
        }
    }

    server {
        server_name api.yourdomain.com;
        location / {
            proxy_pass http://localhost:1800;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
    ```

2.  **Certbot**: Run `certbot` to generate SSL certificates for your Nginx setup.
    ```bash
    sudo certbot --nginx
    ```

## Development

To run locally without Docker (dev mode):

1.  **Backend**: `cd backend && go run .` (Default: 8080)
2.  **Admin**: `cd frontend-admin && npm run dev` (Default: 5173)
3.  **User**: Serve `frontend-user` directory (e.g., `python3 -m http.server 8000`)

