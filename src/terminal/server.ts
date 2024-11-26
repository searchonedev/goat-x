// WebSocket server for terminal communication
import { Server, Socket } from 'socket.io';
import http from 'http';
import express from 'express';

// Add type declaration at the top of the file
declare global {
    var executeCommand: (commandLine: string) => Promise<string | void>;
}

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
                        <title>Twitter Terminal</title>
                        <script src="/socket.io/socket.io.js"></script>
                        <style>
                            body { 
                                background: #000; 
                                color: #00ff00; 
                                font-family: monospace;
                                padding: 20px;
                                margin: 0;
                            }
                            #terminal {
                                white-space: pre-wrap;
                                margin-bottom: 20px;
                                height: calc(100vh - 100px);
                                overflow-y: auto;
                                padding: 10px;
                            }
                            .command-line {
                                display: flex;
                                align-items: center;
                                padding: 5px;
                            }
                            .prompt {
                                color: #00ff00;
                                margin-right: 10px;
                            }
                            #input-container {
                                position: fixed;
                                bottom: 0;
                                left: 0;
                                right: 0;
                                padding: 10px;
                                background: #000;
                                border-top: 1px solid #00ff00;
                            }
                            #input {
                                background: #000;
                                color: #00ff00;
                                border: 1px solid #00ff00;
                                padding: 8px;
                                width: calc(100% - 20px);
                                font-family: monospace;
                                font-size: 14px;
                            }
                            .error { color: #ff0000; }
                            .info { color: #00ff00; }
                            .reply { color: #ffffff; }
                            .command { color: #00ffff; }
                        </style>
                    </head>
                    <body>
                        <div id="terminal"></div>
                        <div id="input-container">
                            <input id="input" type="text" placeholder="Type 'help' for available commands..." autofocus>
                        </div>
                        <script>
                            const socket = io();
                            const terminal = document.getElementById('terminal');
                            const input = document.getElementById('input');
                            
                            const commandHistory = [];
                            let historyIndex = -1;

                            socket.on('log', (data) => {
                                const line = document.createElement('div');
                                line.className = data.type;
                                line.textContent = \`[\${data.timestamp}] \${data.message}\`;
                                terminal.appendChild(line);
                                terminal.scrollTop = terminal.scrollHeight;
                            });

                            input.addEventListener('keydown', (e) => {
                                if (e.key === 'Enter') {
                                    const command = input.value.trim();
                                    if (command) {
                                        commandHistory.push(command);
                                        historyIndex = commandHistory.length;
                                        socket.emit('command', command);
                                        input.value = '';
                                    }
                                } else if (e.key === 'ArrowUp') {
                                    e.preventDefault();
                                    if (historyIndex > 0) {
                                        historyIndex--;
                                        input.value = commandHistory[historyIndex];
                                    }
                                } else if (e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    if (historyIndex < commandHistory.length - 1) {
                                        historyIndex++;
                                        input.value = commandHistory[historyIndex];
                                    } else {
                                        historyIndex = commandHistory.length;
                                        input.value = '';
                                    }
                                }
                            });

                            // Auto-complete functionality
                            const commands = [
                                'login',
                                'send-tweet',
                                'get-tweets',
                                'get-replies',
                                'reply-to-tweet',
                                'get-mentions',
                                'send-quote-tweet',
                                'get-photos',
                                'like',
                                'retweet',
                                'follow',
                                'help',
                                'exit'
                            ];

                            input.addEventListener('keydown', (e) => {
                                if (e.key === 'Tab') {
                                    e.preventDefault();
                                    const currentInput = input.value.trim();
                                    const matches = commands.filter(cmd => 
                                        cmd.startsWith(currentInput)
                                    );
                                    if (matches.length === 1) {
                                        input.value = matches[0] + ' ';
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
                    // Check if executeCommand exists in global scope
                    if (typeof global.executeCommand !== 'function') {
                        throw new Error('Command executor not initialized');
                    }
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
