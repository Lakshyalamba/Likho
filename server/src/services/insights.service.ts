import { prisma } from "../config/prisma";

interface TagCount {
  tag: string;
  count: number;
}

interface ActivityDay {
  date: string;
  created: number;
  updated: number;
  total: number;
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getWeeklyActivityWindow() {
  const today = startOfDay(new Date());
  const start = new Date(today);
  start.setDate(today.getDate() - 6);

  const days: ActivityDay[] = Array.from({ length: 7 }, (_value, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      date: toDateKey(date),
      created: 0,
      updated: 0,
      total: 0
    };
  });

  return {
    start,
    days
  };
}

function getMostUsedTags(notes: { tags: string[] }[]) {
  const tagCounts = new Map<string, number>();

  for (const note of notes) {
    for (const tag of note.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(tagCounts.entries())
    .map<TagCount>(([tag, count]) => ({ tag, count }))
    .sort((first, second) => second.count - first.count || first.tag.localeCompare(second.tag))
    .slice(0, 10);
}

export async function getInsights(userId: string) {
  const { start, days } = getWeeklyActivityWindow();
  const activityByDate = new Map(days.map((day) => [day.date, day]));

  const [
    totalNotes,
    archivedNotes,
    recentlyEditedNotes,
    tagNotes,
    aiUsage,
    weeklyNotes
  ] = await Promise.all([
    prisma.note.count({
      where: {
        userId
      }
    }),
    prisma.note.count({
      where: {
        userId,
        archived: true
      }
    }),
    prisma.note.findMany({
      where: {
        userId
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        tags: true,
        updatedAt: true,
        archived: true
      }
    }),
    prisma.note.findMany({
      where: {
        userId
      },
      select: {
        tags: true
      }
    }),
    prisma.note.aggregate({
      where: {
        userId
      },
      _sum: {
        aiUsageCount: true
      }
    }),
    prisma.note.findMany({
      where: {
        userId,
        OR: [
          {
            createdAt: {
              gte: start
            }
          },
          {
            updatedAt: {
              gte: start
            }
          }
        ]
      },
      select: {
        createdAt: true,
        updatedAt: true
      }
    })
  ]);

  for (const note of weeklyNotes) {
    const createdKey = toDateKey(note.createdAt);
    const updatedKey = toDateKey(note.updatedAt);
    const createdDay = activityByDate.get(createdKey);
    const updatedDay = activityByDate.get(updatedKey);

    if (createdDay) {
      createdDay.created += 1;
      createdDay.total += 1;
    }

    if (updatedDay) {
      updatedDay.updated += 1;
      updatedDay.total += 1;
    }
  }

  return {
    totalNotes,
    archivedNotes,
    recentlyEditedNotes,
    mostUsedTags: getMostUsedTags(tagNotes),
    aiUsageCount: aiUsage._sum.aiUsageCount ?? 0,
    weeklyActivitySummary: days
  };
}
