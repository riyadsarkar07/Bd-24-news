import type { PrayerTime, WeatherForecast } from "@/types";

export const weatherData: WeatherForecast[] = [
  { city: "Dhaka", cityBn: "ঢাকা", temp: 31, feelsLike: 37, condition: "Partly Cloudy", conditionBn: "আংশিক মেঘলা", humidity: 72, wind: 12, high: 33, low: 26, icon: "partly-cloudy" },
  { city: "Chattogram", cityBn: "চট্টগ্রাম", temp: 30, feelsLike: 36, condition: "Thunderstorm", conditionBn: "বজ্রসহ বৃষ্টি", humidity: 81, wind: 18, high: 32, low: 27, icon: "thunderstorm" },
  { city: "Rajshahi", cityBn: "রাজশাহী", temp: 33, feelsLike: 38, condition: "Sunny", conditionBn: "রোদেলা", humidity: 58, wind: 9, high: 35, low: 25, icon: "sunny" },
  { city: "Khulna", cityBn: "খুলনা", temp: 32, feelsLike: 38, condition: "Partly Cloudy", conditionBn: "আংশিক মেঘলা", humidity: 68, wind: 11, high: 34, low: 26, icon: "partly-cloudy" },
  { city: "Sylhet", cityBn: "সিলেট", temp: 29, feelsLike: 35, condition: "Rainy", conditionBn: "বৃষ্টি", humidity: 85, wind: 10, high: 31, low: 25, icon: "rainy" },
];

export const prayerTimes: PrayerTime[] = [
  { name: "Fajr", nameBn: "ফজর", time: "4:42 AM", next: true },
  { name: "Dhuhr", nameBn: "যোহর", time: "12:12 PM" },
  { name: "Asr", nameBn: "আসর", time: "3:45 PM" },
  { name: "Maghrib", nameBn: "মাগরিব", time: "6:26 PM" },
  { name: "Isha", nameBn: "ইশা", time: "7:48 PM" },
  { name: "Sunrise", nameBn: "সূর্যোদয়", time: "5:42 AM" },
];

export const breakingNewsItems = [
  "মেট্রোরেলের নতুন রুট উদ্বোধন আজ, আগারগাঁও থেকে মতিঝিল পর্যন্ত পরীক্ষামূলক চালু",
  "বাংলাদেশ ব্যাংকের নতুন গভর্নর হিসেবে দায়িত্ব নিলেন ড. এহসানুল কবির",
  "বিশ্বকাপ বাছাইয়ে টাইগারদের আজ মুখোমুখি আফগানিস্তান",
  "ঢাকায় বায়ুদূষণ: আজও দূষিত বাতাসে শীর্ষে বাংলাদেশের রাজধানী",
  "সোনার দামে আবারও নতুন রেকর্ড, ভরিতে ১ লাখ ২৭ হাজার টাকা",
  "ইসরায়েল-হামাস যুদ্ধবিরতি চুক্তি কার্যকর, গাজায় প্রথম ত্রাণ কনভয়",
];

export const citiesForSearch = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];
