# 📡 Real-Time Location System (Estudo de Caso)

Este projeto é um sistema completo de **Rastreamento de Localização em Tempo Real**, desenvolvido para demonstrar arquiteturas modernas de comunicação via WebSocket, interfaces reativas e infraestrutura conteinerizada.

O sistema permite que múltiplos "Agentes" (dispositivos móveis) transmitam sua geolocalização ao vivo para um "Painel de Comando" centralizado.

---

## 🏗 Arquitetura & Tecnologias

O projeto é dividido em três microsserviços principais, todos orquestrados via **Docker Compose**:

### 1. 🧠 Backend (Hub)
- **Linguagem**: Go (Golang).
- **Responsabilidade**: Atua como um servidor WebSocket central.
- **Lógica**:
    - Gerencia conexões de **Provedores** (quem envia localização) e **Visualizadores** (quem vê o mapa).
    - **Broadcast Seletivo**: Recebe dados dos provedores e repassa instantaneamente para todos os visualizadores conectados.
    - **Gestão de Estado**: Mantém uma lista de "Últimas Localizações Conhecidas" em memória para que novos administradores recebam o estado atual do mundo assim que conectam.
    - **Detecção de Desconexão**: Monitora a queda de conexões websocket e avisa o Admin para remover o marcador do mapa imediatamente.

### 2. 🗺 Frontend Admin (Viewer)
- **Stack**: React + Vite + TailwindCSS + MapLibre/Mapbox.
### Design System ("Earth Tech")

O projeto utiliza uma paleta de cores personalizada para uma estética industrial/clean, batizada de "Earth Tech".

| Cor | Hex | Uso Sugerido |
|-----|-----|--------------|
| **Café** | `#5a372c` | Texto Principal, Sidebar Escura |
| **Oliva** | `#8b8b70` | Bordas, Textos Secundários |
| **Menta** | `#98c7b0` | Status Sucesso, Detalhes |
| **Creme** | `#f0f0d8` | Background Principal |
| **Ferrugem**| `#c94b0c` | Ações Primárias, Destaques, Alertas |

- **Funcionalidades**:
    - **Mapa Interativo**: Renderiza marcadores em tempo real.
    - **Smart Selection**: Ao clicar num card lateral, o mapa voa até o alvo. Ao clicar novamente, reseta a visão global.
    - **UI Industrial**: Sidebar redesenhada com input de busca moderno, cards de status "Signal Lost" dedicados e feedback visual de hover.

### 3. 📱 Frontend User (Provider)
- **Stack**: HTML5 + Vanilla JS + TailwindCSS (via CDN).
- **Design System**: "Earth Tech" (Tema Clean/Industrial).
- **Funcionalidades**:
    - Captura a geolocalização do dispositivo (GPS) via Geolocation API.
    - Permite definir um **Nome de Operador** e **ID do Dispositivo**.
    - Transmite latitude/longitude via WebSocket seguro (WSS) para o backend.
    - Interface otimizada para Mobile.

---

## ⚡️ Instalação e Execução

### Pré-requisitos
- Docker & Docker Compose instalados.

### Rodando Localmente (Desenvolvimento)
1. Clone o repositório.
2. Execute o comando de subida:
   ```bash
   docker-compose up -d --build
   ```
3. Acesse os serviços:
   - **Admin Dashboard**: [http://localhost:1890](http://localhost:1890)
   - **Provider (Simulador)**: [http://localhost:1880](http://localhost:1880)

### Rodando em Produção (Linux/Cloud)
Para produção, utilizamos **Nginx** como *Reverse Proxy* para gerenciar certificados SSL (HTTPS), que são **obrigatórios** para acesso ao GPS em dispositivos móveis reais.

1. Configure o arquivo `nginx_location.conf` (fornecido na raiz) no seu `/etc/nginx/sites-available/`.
2. Gere certificados com Certbot:
   ```bash
   sudo certbot --nginx
   ```
3. O sistema operará nos subdomínios:
   - `admin.seudominio.com` -> Porta 1890
   - `location.seudominio.com` -> Porta 1880
   - `api.seudominio.com` -> Porta 1800 (WSS)

---

## 📂 Estrutura do Projeto

```
/
├── backend/                # Servidor Go (WebSockets)
│   ├── main.go            # Entrada e roteamento
│   ├── hub.go             # Lógica de broadcast e gestão de salas
│   └── client.go          # Gerenciamento de conexão individual (Pump Read/Write)
│
├── frontend-admin/         # Dashboard React
│   ├── src/components/    # Componentes (Map.jsx)
│   └── src/App.jsx        # Lógica principal e Interface
│
├── frontend-user/          # App Mobile Web
│   └── index.html         # Single Page Application
│
├── docker-compose.yml     # Orquestração dos containers
├── nginx_location.conf    # Configuração de Proxy Reverso recomendada
└── README.md              # Documentação
```

## 🛠 Detalhes Técnicos Implementados

1.  **WebSocket Seguro (WSS)**: Configuração preparada para produção, permitindo conexões criptografadas essenciais para segurança e funcionamento do GPS.
2.  **In-Memory Persistence**: O Backend armazena a última posição de cada ID. Se você der F5 no Admin, os marcadores reaparecem instantaneamente (não começam vazios).
3.  **Clean Disconnect**: Se um celular perde conexão ou fecha a aba, o Backend detecta o fim do stream TCP e envia um evento `type: "disconnect"` para o Admin, que remove o ícone do mapa.
4.  **UI Architecture**: Implementação do Design System "Earth Tech" com componentes isolados (Cards), Z-Index estratificado para overlays de mapa e feedback visual de conectividade.

---

Este projeto serve como um **template robusto** para sistemas de logística, delivery, monitoramento de frotas ou jogos baseados em localização.
