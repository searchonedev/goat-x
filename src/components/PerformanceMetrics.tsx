// Performance metrics display component
import React from 'react';
import styled from 'styled-components';
import { PerformanceMetric } from '../types/types';

const MetricsPanel = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const MetricCard = styled.div`
  background: #333333;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #00C851;
`;

const PerformanceMetrics: React.FC = () => {
  return (
    <MetricsPanel>
      <MetricCard>
        <h3>Response Time</h3>
        <MetricValue>25ms</MetricValue>
      </MetricCard>
      <MetricCard>
        <h3>Tweets/Hour</h3>
        <MetricValue>1,234</MetricValue>
      </MetricCard>
      <MetricCard>
        <h3>Uptime</h3>
        <MetricValue>99.9%</MetricValue>
      </MetricCard>
      <MetricCard>
        <h3>Active Users</h3>
        <MetricValue>42</MetricValue>
      </MetricCard>
    </MetricsPanel>
  );
};

export default PerformanceMetrics; 