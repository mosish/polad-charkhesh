export interface WebsiteStatistics {
  startedAt: string;
  timezone: 'Asia/Tehran';
  retentionDays: number;
  today: number;
  yesterday: number;
  last7Days: number;
  last30Days: number;
  daily: { day: string; views: number }[];
  domains: { domain: string; views: number }[];
  topPages: { path: string; views: number }[];
}

export interface ServerMetrics {
  application: 'online';
  database: 'connected';
  applicationUptimeSeconds: number;
  serverUptimeSeconds: number;
  cpuPercent: number | null;
  cpuCores: number;
  memory: { totalBytes: number; availableBytes: number; processBytes: number };
  disk: { totalBytes: number; availableBytes: number } | null;
}

export interface DashboardSnapshot {
  sampledAt: string;
  website: WebsiteStatistics;
  server: ServerMetrics;
}
