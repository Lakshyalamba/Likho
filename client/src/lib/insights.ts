import { apiRequest } from "@/lib/api";

export interface RecentlyEditedNote {
  id: string;
  title: string;
  category: string;
  tags: string[];
  archived: boolean;
  updatedAt: string;
}

export interface TagInsight {
  tag: string;
  count: number;
}

export interface WeeklyActivityDay {
  date: string;
  created: number;
  updated: number;
  total: number;
}

export interface ProductivityInsights {
  totalNotes: number;
  archivedNotes: number;
  recentlyEditedNotes: RecentlyEditedNote[];
  mostUsedTags: TagInsight[];
  aiUsageCount: number;
  weeklyActivitySummary: WeeklyActivityDay[];
}

export async function getProductivityInsights(token: string) {
  return apiRequest<ProductivityInsights>("/insights", {
    token
  });
}
