"use client";
import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/App";
import type { Item } from "@/types";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
import { Flame, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ClockProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  ratio: number;
}

const SClock: React.FC<ClockProps> = ({ items, setItems, ratio }) => {
  const [streakCount, setStreakCount] = useState(0);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState("");
//   const [userTimeZone, setUserTimeZone] = useState("UTC");

  useEffect(() => {
    const msUntilMidnight = updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    const midnightTimeout = setTimeout(() => {
      checkStreak();
      const dailyRefresh = setInterval(checkStreak, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyRefresh);
    }, msUntilMidnight);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(midnightTimeout);
    };
  }, [items]);

  const updateCountdown = () => {
    const now = new Date();
    // const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // setUserTimeZone(userTimezone);

    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const diffMs = midnight.getTime() - now.getTime();
    const diffHrs = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

    setTimeUntilMidnight(`${diffHrs}h ${diffMins}m ${diffSecs}s`);

    return diffMs;
  };

  const checkStreak = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const allCompleted = (items.every((item) => item.done)) && (items.length > 0);

    try {
      if (allCompleted) {
        const { error } = await supabase.from("user_streaks").upsert({
          user_id: user.id,
          current_streak: streakCount + 1,
          last_update: new Date().toISOString(),
        });

        if (!error) setStreakCount((prev) => prev + 1);
      } else {
        const { error } = await supabase.from("user_streaks").upsert({
          user_id: user.id,
          current_streak: 0,
          last_update: new Date().toISOString(),
        });

        if (!error) setStreakCount(0);
      }

      await resetAllItems(user.id);
    } catch (error) {
      console.error("streak update error:", error);
    }
  };

  const resetAllItems = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("test")
        .update({ done: false })
        .eq("user_id", userId);

      if (!error) {
        const { data } = await supabase
          .from("test")
          .select()
          .eq("user_id", userId);
        setItems(data || []);
      }
    } catch (error) {
      console.error("Reset items error:", error);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-indigo-400" />
            <span className="font-medium">streak:</span>
            <Badge variant="secondary" className="text-base px-2">
              {streakCount} days
            </Badge>
          </div>
          <Progress
            value={ratio}
            className="w-[60%] h-2 bg-blue-200 dark:bg-indigo-500"
             
          />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">new day:</span>
            <span className="font-mono text-sm">{timeUntilMidnight}</span>
          </div>
        </div>
        {/* <Separator className="my-2" /> */}
        {/* <div className="text-xs text-muted-foreground">
          timezone: {userTimeZone}
        </div> */}
      </CardContent>
    </Card>
  );
};

export default SClock;
