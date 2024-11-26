import React from 'react';
import LiveTerminal from './LiveTerminal';
import AgentManager from './AgentManager';
import PerformanceMetrics from './PerformanceMetrics';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: auto 1fr;
  gap: 1rem;
  padding: 1rem;
  height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
`;

const Dashboard: React.FC = () => {
  return (
    <DashboardContainer>
      <AgentManager />
      <PerformanceMetrics />
      <LiveTerminal />
    </DashboardContainer>
  );
};

export default Dashboard; 