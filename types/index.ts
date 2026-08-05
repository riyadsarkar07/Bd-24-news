export type CategorySlug =
  | "latest"
  | "bangladesh"
  | "international"
  | "politics"
  | "economy"
  | "sports"
  | "entertainment"
  | "technology"
  | "education"
  | "health"
  | "lifestyle"
  | "opinion"
  | "crime"
  | "religion"
  | "travel"
  | "jobs";

export interface Category {
  slug: CategorySlug | string;
  name: string;
  nameBn: string;
  description: string;
  color: string;
  icon: string;
  featured?: boolean;
}

export interface Author {
  slug: string;
  name: string;
  nameBn: string;
  role: string;
  email: string;
  bio: string;
  avatar: string;
  cover: string;
  followers: number;
  articlesCount: number;
  verified: boolean;
  social: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
    instagram?: string;
  };
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  excerpt: string;
  body: string;
  category: string;
  categoryColor: string;
  tags: string[];
  author: string;
  authorNameBn?: string;
  authorSlug?: string;
  authorAvatar: string;
  authorRole: string;
  coverImage: string;
  images: string[];
  publishedAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  commentsCount: number;
  readingMinutes: number;
  featured: boolean;
  breaking: boolean;
  trending: boolean;
  editorPick: boolean;
  isVideo?: boolean;
  isGallery?: boolean;
  videoUrl?: string | null;
  location?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
}

export interface SearchResult {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  image: string;
  slug: string;
  publishedAt: string;
}

export interface MarketQuote {
  symbol: string;
  name: string;
  nameBn: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface WeatherForecast {
  city: string;
  cityBn: string;
  temp: number;
  feelsLike: number;
  condition: string;
  conditionBn: string;
  humidity: number;
  wind: number;
  high: number;
  low: number;
  icon: string;
}

export interface PrayerTime {
  name: string;
  nameBn: string;
  time: string;
  next?: boolean;
}

export interface AdSlot {
  id: string;
  name: string;
  size: string;
  type: "banner" | "sidebar" | "inline" | "native";
  image: string;
  url: string;
}

export interface NavItem {
  label: string;
  labelBn: string;
  href: string;
  children?: { label: string; labelBn: string; href: string }[];
}

export interface DashboardStat {
  label: string;
  labelBn: string;
  value: number;
  delta: number;
  icon: string;
  color: string;
}
