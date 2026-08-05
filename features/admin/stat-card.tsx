"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AdminStat } from "@/services/adminService";

const labels: Record<string, string> = {
  views: "Total Views",
  visitors: "Unique Visitors",
  articles: "Published Articles",
  subscribers: "Subscribers",
};

export function StatCard({ stat, index }: { stat: AdminStat; index: number }) {
  const up = stat.delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {labels[stat.key] ?? stat.key}
          </p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="text-2xl font-black tabular-nums">
              {stat.value.toLocaleString()}
            </p>
            <span
              className={cn(
                "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold",
                up ? "bg-success/15 text-success" : "bg-danger/15 text-danger",
              )}
            >
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(stat.delta)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
