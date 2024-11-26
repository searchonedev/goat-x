// Agent management interface component
import React from 'react';
import styled from 'styled-components';
import { Agent } from '../types/types';

const AgentPanel = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 1rem;
`;

const AgentCard = styled.div<{ status: string }>`
  background: #333333;
  border-radius: 6px;
  padding: 1rem;
  margin: 0.5rem 0;
  border-left: 4px solid ${({ status }) => {
    switch (status) {
      case 'active': return '#00C851';
      case 'idle': return '#ffbb33';
      case 'error': return '#ff4444';
      default: return '#ffffff';
    }
  }};
`;

const AgentManager: React.FC = () => {
  return (
    <AgentPanel>
      <h2>AI Agents</h2>
      {/* Sample agent cards - will be replaced with real data */}
      <AgentCard status="active">
        <h3>Agent-1</h3>
        <p>@twitter_handle</p>
        <p>Status: Active</p>
      </AgentCard>
    </AgentPanel>
  );
};

export default AgentManager; 