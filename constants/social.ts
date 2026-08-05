export const socialLinks = [
  { id: "facebook", label: "Facebook", href: "https://facebook.com", icon: "facebook", color: "#1877F2" },
  { id: "youtube", label: "YouTube", href: "https://youtube.com", icon: "youtube", color: "#FF0000" },
  { id: "instagram", label: "Instagram", href: "https://instagram.com", icon: "instagram", color: "#E4405F" },
  { id: "tiktok", label: "TikTok", href: "https://tiktok.com", icon: "tiktok", color: "#000000" },
  { id: "twitter", label: "Twitter / X", href: "https://twitter.com", icon: "twitter", color: "#1DA1F2" },
  { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin", color: "#0A66C2" },
  { id: "telegram", label: "Telegram", href: "https://telegram.org", icon: "send", color: "#26A5E4" },
  { id: "whatsapp", label: "WhatsApp", href: "https://whatsapp.com", icon: "message-circle", color: "#25D366" },
] as const;

export const stockMarket = [
  { symbol: "DSEX", name: "DSEX Index", nameBn: "ডিএসই সূচক", price: 6248.54, change: 42.31, changePercent: 0.68 },
  { symbol: "DS30", name: "DS30 Index", nameBn: "ডিএস থার্টি", price: 2143.77, change: 18.02, changePercent: 0.85 },
  { symbol: "CSE", name: "CSE Index", nameBn: "সিএসই সূচক", price: 15522.1, change: -38.45, changePercent: -0.25 },
] as const;

export const goldPrices = [
  { name: "Gold (1 Bhori)", nameBn: "সোনা (১ ভরি)", price: 127450, change: 1150, changePercent: 0.91 },
  { name: "Gold (1 Gram)", nameBn: "সোনা (১ গ্রাম)", price: 10896, change: 98, changePercent: 0.91 },
  { name: "Silver (1 Bhori)", nameBn: "রূপা (১ ভরি)", price: 2148, change: -12, changePercent: -0.56 },
] as const;

export const currencyRates = [
  { code: "USD", name: "US Dollar", nameBn: "মার্কিন ডলার", price: 118.2, change: -0.15, changePercent: -0.13 },
  { code: "EUR", name: "Euro", nameBn: "ইউরো", price: 129.1, change: 0.32, changePercent: 0.25 },
  { code: "GBP", name: "British Pound", nameBn: "পাউন্ড স্টার্লিং", price: 150.4, change: 0.21, changePercent: 0.14 },
  { code: "AED", name: "UAE Dirham", nameBn: "আমিরাতি দিরহাম", price: 32.2, change: -0.04, changePercent: -0.12 },
  { code: "SAR", name: "Saudi Riyal", nameBn: "সৌদি রিয়াল", price: 31.5, change: -0.03, changePercent: -0.1 },
  { code: "INR", name: "Indian Rupee", nameBn: "ভারতীয় রুপি", price: 1.42, change: 0.0, changePercent: 0.0 },
  { code: "MYR", name: "Malaysian Ringgit", nameBn: "মালয়েশিয়ান রিঙ্গিত", price: 26.4, change: 0.05, changePercent: 0.19 },
  { code: "JPY", name: "Japanese Yen", nameBn: "জাপানি ইয়েন", price: 0.78, change: 0.0, changePercent: 0.0 },
] as const;

export const cryptoPrices = [
  { symbol: "BTC", name: "Bitcoin", nameBn: "বিটকয়েন", price: 64820.5, change: 1240.15, changePercent: 1.95 },
  { symbol: "ETH", name: "Ethereum", nameBn: "ইথেরিয়াম", price: 3482.1, change: 58.9, changePercent: 1.72 },
  { symbol: "BNB", name: "BNB", nameBn: "বিএনবি", price: 588.32, change: 4.12, changePercent: 0.71 },
  { symbol: "SOL", name: "Solana", nameBn: "সোলানা", price: 158.4, change: 3.27, changePercent: 2.11 },
  { symbol: "XRP", name: "XRP", nameBn: "রিপল", price: 0.52, change: -0.004, changePercent: -0.76 },
] as const;
