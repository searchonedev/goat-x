// Define core types for the application
interface Agent {
  id: string;
  name: string;
  personality: string;
  status: 'active' | 'idle' | 'error';
  twitterHandle: string;
  lastActive: Date;
}

interface ActivityLog {
  id: string;
  timestamp: Date;
  agentId: string;
  action: string;
  details: string;
  status: 'success' | 'error' | 'warning';
}

interface PerformanceMetric {
  responseTime: number;
  tweetsPerHour: number;
  activeUsers: number;
  uptime: number;
  testCoverage: number;
}

export type { Agent, ActivityLog, PerformanceMetric }; 