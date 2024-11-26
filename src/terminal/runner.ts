import { TerminalServer } from './server';
import { executeCommand } from '../../command';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set up global executeCommand
declare global {
    var executeCommand: (commandLine: string) => Promise<string | void>;
}
globalThis.executeCommand = executeCommand;

async function startTerminal() {
    // Initialize terminal server on port 3000
    const terminal = new TerminalServer(3000);
    
    // Log startup
    terminal.log('info', '🚀 Starting Twitter AI Terminal...');

    return terminal;
}

// Start the terminal
startTerminal().catch(error => {
    console.error('Failed to start terminal:', error);
    process.exit(1);
}); 