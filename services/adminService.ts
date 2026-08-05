export type AdminStat = {
  key: string;
  value: number;
  delta: number;
};

export type ChartPoint = {
  label: string;
  views: number;
  articles: number;
};

const MOCK_STATS: AdminStat[] = [
  { key: "views", value: 2841936, delta: 12.4 },
  { key: "visitors", value: 412560, delta: 8.1 },
  { key: "articles", value: 2480, delta: 4.2 },
  { key: "subscribers", value: 18590, delta: -1.8 },
];

const MOCK_CHART: ChartPoint[] = [
  { label: "Mon", views: 68210, articles: 62 },
  { label: "Tue", views: 74930, articles: 71 },
  { label: "Wed", views: 61480, articles: 58 },
  { label: "Thu", views: 82450, articles: 79 },
  { label: "Fri", views: 93880, articles: 84 },
  { label: "Sat", views: 101420, articles: 92 },
  { label: "Sun", views: 88660, articles: 77 },
];

export const adminService = {
  async getStats(): Promise<AdminStat[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_STATS), 200));
  },
  async getChart(): Promise<ChartPoint[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_CHART), 250));
  },
};
