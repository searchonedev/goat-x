import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ActivityLog } from '../types/types';

const TerminalContainer = styled.div`
  background: #000000;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
  overflow-y: auto;
  grid-column: 1 / -1;
`;

const LogEntry = styled.div<{ status: string }>`
  /* Color coding based on status */
  color: ${({ status }) => {
    switch (status) {
      case 'error': return '#ff4444';
      case 'warning': return '#ffbb33';
      case 'success': return '#00C851';
      default: return '#ffffff';
    }
  }};
  margin: 4px 0;
  font-size: 14px;
`;

const LiveTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  return (
    <TerminalContainer ref={terminalRef}>
      {/* Sample log entries - will be replaced with real data */}
      <LogEntry status="success">Agent-1: Tweet successfully posted</LogEntry>
      <LogEntry status="warning">Agent-2: Rate limit at 80%</LogEntry>
      <LogEntry status="error">Agent-3: Failed to authenticate</LogEntry>
    </TerminalContainer>
  );
};

export default LiveTerminal; 