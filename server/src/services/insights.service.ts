import { Types } from "mongoose";
import { NoteModel } from "../models/note.model";

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

export async function getInsights(userId: string) {
  const userObjectId = new Types.ObjectId(userId);
  const baseFilter = { userId: userObjectId };
  const { start, days } = getWeeklyActivityWindow();
  const activityByDate = new Map(days.map((day) => [day.date, day]));

  const [totalNotes, archivedNotes, recentlyEditedNotes, mostUsedTags, aiUsage, weeklyNotes] =
    await Promise.all([
      NoteModel.countDocuments(baseFilter),
      NoteModel.countDocuments({ ...baseFilter, archived: true }),
      NoteModel.find(baseFilter)
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("title category tags updatedAt archived")
        .lean()
        .exec(),
      NoteModel.aggregate<TagCount>([
        { $match: baseFilter },
        { $unwind: "$tags" },
        {
          $group: {
            _id: "$tags",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            tag: "$_id",
            count: 1
          }
        }
      ]),
      NoteModel.aggregate<{ total: number }>([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            total: { $sum: "$aiUsageCount" }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1
          }
        }
      ]),
      NoteModel.find({
        ...baseFilter,
        $or: [{ createdAt: { $gte: start } }, { updatedAt: { $gte: start } }]
      })
        .select("createdAt updatedAt")
        .lean()
        .exec()
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
    recentlyEditedNotes: recentlyEditedNotes.map((note) => ({
      id: String(note._id),
      title: note.title,
      category: note.category,
      tags: note.tags,
      archived: note.archived,
      updatedAt: note.updatedAt
    })),
    mostUsedTags,
    aiUsageCount: aiUsage[0]?.total ?? 0,
    weeklyActivitySummary: days
  };
}
