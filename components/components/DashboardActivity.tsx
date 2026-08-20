"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Activity = {
  id: string;
  title: string;
  description: string;
  created_at: string;
};

export default function DashboardActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    const { data, error } = await supabase
      .from("Activities")
      .select("id,title,description,created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error(error);
      return;
    }

    setActivities(data || []);
  }

  return (
    <div className="bg-[#10231e] rounded-xl p-6 mb-8">
      <h2 className="text-2xl font-bold text-green-400 mb-6">
        Recent Activity
      </h2>

      {activities.length === 0 ? (
        <div className="text-gray-400">
          No activity yet.
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="border-b border-gray-800 pb-4"
            >
              <div className="font-semibold">
                {activity.title}
              </div>

              <div className="text-gray-400 text-sm">
                {activity.description}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {new Date(activity.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}