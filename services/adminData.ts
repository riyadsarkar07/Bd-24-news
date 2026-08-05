export type AdminCategoryRow = {
  id: string;
  slug: string;
  nameBn: string;
  name: string;
  color: string;
  articles: number;
  status: "active" | "inactive";
  menu: boolean;
  featured: boolean;
};

export type AdminTagRow = {
  id: string;
  name: string;
  slug: string;
  articles: number;
  views: number;
  trending: boolean;
};

export type AdminAuthorRow = {
  id: string;
  nameBn: string;
  name: string;
  role: string;
  avatar: string;
  followers: number;
  articlesCount: number;
  verified: boolean;
  active: boolean;
};

export type AdminMediaRow = {
  id: string;
  name: string;
  src: string;
  type: "image" | "video";
  size: string;
  uploadedAt: string;
  usedIn: string;
};

export type AdminAdRow = {
  id: string;
  name: string;
  position: string;
  size: string;
  type: "banner" | "sidebar" | "inline" | "native";
  impressions: number;
  clicks: number;
  ctr: number;
  status: "active" | "inactive";
};

export type AdminCommentRow = {
  id: string;
  article: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
  likes: number;
  status: "published" | "pending" | "spam";
};

export type AdminSubscriberRow = {
  id: string;
  email: string;
  name: string;
  subscribedAt: string;
  status: "active" | "inactive";
  source: string;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "Admin" | "Editor" | "Journalist" | "Subscriber";
  status: "active" | "banned" | "pending";
  joinedAt: string;
  lastActive: string;
  posts: number;
};

export type AdminRoleRow = {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: string[];
  system: boolean;
};

export type AdminNewsletterRow = {
  id: string;
  subjectBn: string;
  subjectEn: string;
  sentAt: string;
  opens: number;
  clicks: number;
  recipients: number;
  status: "sent" | "scheduled" | "draft";
};

export const adminData = {
  categories: (): AdminCategoryRow[] => [
    { id: "c1", slug: "bangladesh", nameBn: "বাংলাদেশ", name: "Bangladesh", color: "#E50914", articles: 412, status: "active", menu: true, featured: true },
    { id: "c2", slug: "international", nameBn: "আন্তর্জাতিক", name: "International", color: "#2563EB", articles: 356, status: "active", menu: true, featured: true },
    { id: "c3", slug: "politics", nameBn: "রাজনীতি", name: "Politics", color: "#7C3AED", articles: 289, status: "active", menu: true, featured: false },
    { id: "c4", slug: "economy", nameBn: "অর্থনীতি", name: "Economy", color: "#059669", articles: 231, status: "active", menu: true, featured: false },
    { id: "c5", slug: "sports", nameBn: "খেলাধুলা", name: "Sports", color: "#22C55E", articles: 198, status: "active", menu: true, featured: true },
    { id: "c6", slug: "entertainment", nameBn: "বিনোদন", name: "Entertainment", color: "#F59E0B", articles: 174, status: "active", menu: true, featured: false },
    { id: "c7", slug: "technology", nameBn: "প্রযুক্তি", name: "Technology", color: "#0891B2", articles: 162, status: "active", menu: true, featured: false },
    { id: "c8", slug: "health", nameBn: "স্বাস্থ্য", name: "Health", color: "#EF4444", articles: 98, status: "inactive", menu: false, featured: false },
  ],
  tags: (): AdminTagRow[] => [
    { id: "t1", name: "ঢাকা", slug: "dhaka", articles: 84, views: 124000, trending: true },
    { id: "t2", name: "ক্রিকেট", slug: "cricket", articles: 67, views: 98200, trending: true },
    { id: "t3", name: "আর্টিফিসিয়াল ইন্টেলিজেন্স", slug: "artificial-intelligence", articles: 45, views: 78100, trending: true },
    { id: "t4", name: "চট্টগ্রাম", slug: "chattogram", articles: 39, views: 45200, trending: false },
    { id: "t5", name: "শেয়ারবাজার", slug: "stock-market", articles: 33, views: 38900, trending: false },
    { id: "t6", name: "ফুটবল", slug: "football", articles: 28, views: 35100, trending: false },
    { id: "t7", name: "বৃষ্টি", slug: "rain", articles: 22, views: 21400, trending: false },
    { id: "t8", name: "রেমিট্যান্স", slug: "remittance", articles: 18, views: 18900, trending: false },
  ],
  authors: (): AdminAuthorRow[] => [
    { id: "a1", nameBn: "সালমান রহমান", name: "Salman Rahman", role: "Senior Editor", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face", followers: 12400, articlesCount: 320, verified: true, active: true },
    { id: "a2", nameBn: "নুসরাত জাহান", name: "Nusrat Jahan", role: "Journalist", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face", followers: 8900, articlesCount: 245, verified: true, active: true },
    { id: "a3", nameBn: "তানভীর আহমেদ", name: "Tanvir Ahmed", role: "Sports Writer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face", followers: 6700, articlesCount: 189, verified: false, active: true },
    { id: "a4", nameBn: "ফারহানা ইসলাম", name: "Farhana Islam", role: "Tech Correspondent", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face", followers: 5400, articlesCount: 142, verified: false, active: true },
    { id: "a5", nameBn: "রাফি হাসান", name: "Rafi Hasan", role: "Photojournalist", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face", followers: 3100, articlesCount: 97, verified: false, active: false },
  ],
  media: (): AdminMediaRow[] => [
    { id: "m1", name: "dhaaka-skyline.jpg", src: "https://images.unsplash.com/photo-1550070886-8e77ad10e47a", type: "image", size: "1.2 MB", uploadedAt: "2026-08-02", usedIn: "Bangladesh" },
    { id: "m2", name: "cricket-match.jpg", src: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e", type: "image", size: "890 KB", uploadedAt: "2026-08-01", usedIn: "Sports" },
    { id: "m3", name: "tech-summit.mp4", src: "", type: "video", size: "24 MB", uploadedAt: "2026-07-30", usedIn: "Videos" },
    { id: "m4", name: "capital-market.jpg", src: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f", type: "image", size: "1.1 MB", uploadedAt: "2026-07-29", usedIn: "Economy" },
    { id: "m5", name: "national-parliament.jpg", src: "https://images.unsplash.com/photo-1541872703-74c5e44368f9", type: "image", size: "1.6 MB", uploadedAt: "2026-07-28", usedIn: "Politics" },
  ],
  ads: (): AdminAdRow[] => [
    { id: "ad1", name: "Header Leaderboard", position: "Header", size: "728×90", type: "banner", impressions: 482000, clicks: 4310, ctr: 0.89, status: "active" },
    { id: "ad2", name: "Sidebar Skyscraper", position: "Sidebar", size: "300×600", type: "sidebar", impressions: 356000, clicks: 2100, ctr: 0.59, status: "active" },
    { id: "ad3", name: "In-Article Banner", position: "Article body", size: "468×60", type: "inline", impressions: 291000, clicks: 1740, ctr: 0.6, status: "active" },
    { id: "ad4", name: "Native Card", position: "Home", size: "360×200", type: "native", impressions: 215000, clicks: 1980, ctr: 0.92, status: "inactive" },
    { id: "ad5", name: "Mobile Interstitial", position: "Mobile", size: "Fullscreen", type: "banner", impressions: 168000, clicks: 640, ctr: 0.38, status: "active" },
  ],
  comments: (): AdminCommentRow[] => [
    { id: "cm1", article: "ঢাকার বাতাসের মান আরও খারাপ", author: "Rafiq Islam", avatar: "https://i.pravatar.cc/40?u=1", content: "এটা খুবই গুরুত্বপূর্ণ বিষয়। কর্তৃপক্ষের দ্রুত পদক্ষেপ নেওয়া উচিত।", createdAt: "2026-08-05 09:12", likes: 24, status: "published" },
    { id: "cm2", article: "বাংলাদেশ ৩ উইকেটে জয় পেয়েছে", author: "Karim Uddin", avatar: "https://i.pravatar.cc/40?u=2", content: "অসাধারণ পারফরম্যান্স! মুশফিক সেরা ছিল।", createdAt: "2026-08-05 08:47", likes: 41, status: "published" },
    { id: "cm3", article: "আইনশৃঙ্খলা বাহিনীর নতুন নির্দেশনা", author: "Anonymous", avatar: "https://i.pravatar.cc/40?u=3", content: "স্প্যাম কমেন্ট — বাজি কিনুন!!", createdAt: "2026-08-04 22:10", likes: 0, status: "spam" },
    { id: "cm4", article: "সোনার দামে নতুন রেকর্ড", author: "Shahin Alam", avatar: "https://i.pravatar.cc/40?u=4", content: "আমার মতে মূল্য আরও বাড়বে।", createdAt: "2026-08-04 18:33", likes: 12, status: "pending" },
    { id: "cm5", article: "শিক্ষা খাতে বাজেট বাড়ানো হয়েছে", author: "Mitu Rahman", avatar: "https://i.pravatar.cc/40?u=5", content: "শিক্ষকদের বেতন বাড়ানোর দাবি যৌক্তিক।", createdAt: "2026-08-04 15:05", likes: 33, status: "published" },
  ],
  subscribers: (): AdminSubscriberRow[] => [
    { id: "s1", email: "rahman@example.com", name: "Salman Rahman", subscribedAt: "2026-07-01", status: "active", source: "Footer form" },
    { id: "s2", email: "nusrat@example.com", name: "Nusrat Jahan", subscribedAt: "2026-07-05", status: "active", source: "Article popup" },
    { id: "s3", email: "tanvir@example.com", name: "Tanvir Ahmed", subscribedAt: "2026-07-12", status: "active", source: "Footer form" },
    { id: "s4", email: "farhana@example.com", name: "Farhana Islam", subscribedAt: "2026-06-20", status: "inactive", source: "Campaign" },
    { id: "s5", email: "rafi@example.com", name: "Rafi Hasan", subscribedAt: "2026-07-18", status: "active", source: "Homepage" },
  ],
  users: (): AdminUserRow[] => [
    { id: "u1", name: "Admin BD24", email: "admin@bd24news.com", avatar: "https://i.pravatar.cc/40?u=admin", role: "Admin", status: "active", joinedAt: "2025-01-15", lastActive: "2026-08-05", posts: 12 },
    { id: "u2", name: "Salman Rahman", email: "salman@bd24news.com", avatar: "https://i.pravatar.cc/40?u=salman", role: "Editor", status: "active", joinedAt: "2025-02-01", lastActive: "2026-08-05", posts: 320 },
    { id: "u3", name: "Nusrat Jahan", email: "nusrat@bd24news.com", avatar: "https://i.pravatar.cc/40?u=nusrat", role: "Journalist", status: "active", joinedAt: "2025-03-10", lastActive: "2026-08-04", posts: 245 },
    { id: "u4", name: "Tanvir Ahmed", email: "tanvir@bd24news.com", avatar: "https://i.pravatar.cc/40?u=tanvir", role: "Journalist", status: "active", joinedAt: "2025-04-22", lastActive: "2026-08-03", posts: 189 },
    { id: "u5", name: "Fahim Rahman", email: "fahim@gmail.com", avatar: "https://i.pravatar.cc/40?u=fahim", role: "Subscriber", status: "pending", joinedAt: "2026-08-01", lastActive: "2026-08-02", posts: 0 },
    { id: "u6", name: "Zarif Hossain", email: "zarif@gmail.com", avatar: "https://i.pravatar.cc/40?u=zarif", role: "Subscriber", status: "banned", joinedAt: "2026-05-11", lastActive: "2026-06-20", posts: 1 },
  ],
  roles: (): AdminRoleRow[] => [
    { id: "r1", name: "Administrator", description: "Full access to everything", users: 3, permissions: ["*"], system: true },
    { id: "r2", name: "Editor", description: "Manage content, approve comments", users: 8, permissions: ["news:write", "news:publish", "comments:moderate", "media:manage"], system: true },
    { id: "r3", name: "Journalist", description: "Write and submit articles", users: 21, permissions: ["news:write", "media:upload"], system: true },
    { id: "r4", name: "Subscriber", description: "Read articles and comment", users: 18590, permissions: ["read", "comment"], system: true },
  ],
  newsletters: (): AdminNewsletterRow[] => [
    { id: "n1", subjectBn: "দৈনিক ডাইজেস্ট: আজকের শীর্ষ ১০ খবর", subjectEn: "Daily Digest: Top 10 stories", sentAt: "2026-08-05 08:00", opens: 12400, clicks: 3890, recipients: 18590, status: "sent" },
    { id: "n2", subjectBn: "সাপ্তাহিক প্রযুক্তি সংবাদ", subjectEn: "Weekly Tech Roundup", sentAt: "2026-08-02 10:00", opens: 9800, clicks: 2410, recipients: 18590, status: "sent" },
    { id: "n3", subjectBn: "ব্রেকিং: দেশজুড়ে ভারী বৃষ্টিপাত", subjectEn: "Breaking: Heavy rain nationwide", sentAt: "2026-08-06 07:00", opens: 0, clicks: 0, recipients: 18590, status: "scheduled" },
  ],
};
