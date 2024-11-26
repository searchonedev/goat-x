// WebSocket server for terminal communication
import { Server, Socket } from 'socket.io';
import http from 'http';
import express from 'express';

export class TerminalServer {
    private io: Server;
    private server: http.Server;
    private app: express.Application;

    constructor(port: number) {
        // Create Express app
        this.app = express();
        
        // Create HTTP server with Express
        this.server = http.createServer(this.app);
        
        // Initialize Socket.IO
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        // Serve the terminal interface
        this.app.get('/', (req, res) => {
            res.send(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Terminal</title>
                        <script src="/socket.io/socket.io.js"></script>
                        <style>
                            body { 
                                background: #000; 
                                color: #00ff00; 
                                font-family: monospace;
                                padding: 20px;
                            }
                            #terminal {
                                white-space: pre-wrap;
                                margin-bottom: 20px;
                                height: calc(100vh - 100px);
                                overflow-y: auto;
                            }
                            #input {
                                background: #000;
                                color: #00ff00;
                                border: 1px solid #00ff00;
                                padding: 5px;
                                width: 100%;
                                font-family: monospace;
                            }
                        </style>
                    </head>
                    <body>
                        <div id="terminal"></div>
                        <input id="input" type="text" placeholder="Type 'help' for available commands..." autofocus>
                        <script>
                            const socket = io();
                            const terminal = document.getElementById('terminal');
                            const input = document.getElementById('input');
                            
                            socket.on('log', (data) => {
                                const line = document.createElement('div');
                                line.textContent = \`[\${data.timestamp}] [\${data.type}] \${data.message}\`;
                                terminal.appendChild(line);
                                terminal.scrollTop = terminal.scrollHeight;
                            });

                            input.addEventListener('keypress', (e) => {
                                if (e.key === 'Enter') {
                                    const command = input.value.trim();
                                    if (command) {
                                        socket.emit('command', command);
                                        input.value = '';
                                    }
                                }
                            });
                        </script>
                    </body>
                </html>
            `);
        });

        // Start server with error handling
        this.server.listen(port, () => {
            console.log(`Terminal server running at http://localhost:${port}`);
        }).on('error', (err) => {
            console.error('Failed to start server:', err);
        });

        // Socket connection handling
        this.io.on('connection', (socket: Socket) => {
            console.log('Client connected');
            this.log('info', 'Terminal client connected');
            this.log('info', 'Type "help" for available commands');
            
            // Handle incoming commands
            socket.on('command', async (command: string) => {
                try {
                    this.log('info', `$ ${command}`);
                    const result = await global.executeCommand(command);
                    if (typeof result === 'string') {
                        this.log('reply', result);
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        this.log('error', error.message);
                    } else {
                        this.log('error', 'An unknown error occurred');
                    }
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    log(type: 'info' | 'reply' | 'error', message: string) {
        const logData = {
            type,
            message,
            timestamp: new Date().toISOString()
        };
        this.io.emit('log', logData);
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    close() {
        this.io.close();
        this.server.close();
    }
}
