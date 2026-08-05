import type { Metadata } from "next";
import { WeatherPage } from "@/features/weather/weather-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Weather — আবহাওয়া",
  description: `বাংলাদেশের আবহাওয়ার পূর্বাভাস। ${siteConfig.name}।`,
  alternates: { canonical: `${siteConfig.url}/weather` },
};

export default function WeatherRoute() {
  return <WeatherPage />;
}
