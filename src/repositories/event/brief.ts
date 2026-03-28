import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// ─── Types ──────────────────────────────────────────────────

export interface BriefAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface CreateBriefInput {
  title: string;
  content?: string | null;
  attachments?: BriefAttachment[];
  authorType: "VENDOR" | "CLIENT";
  authorName?: string | null;
}

export interface UpdateBriefInput {
  title?: string;
  content?: string | null;
  attachments?: BriefAttachment[];
}

// ─── Queries ────────────────────────────────────────────────

export async function findBriefsByEventId(eventId: string) {
  return prisma.eventBrief.findMany({
    where: { eventId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findBriefById(id: string) {
  return prisma.eventBrief.findUnique({ where: { id } });
}

// ─── Mutations ──────────────────────────────────────────────

export async function createBrief(eventId: string, data: CreateBriefInput) {
  return prisma.eventBrief.create({
    data: {
      eventId,
      title: data.title,
      content: data.content ?? null,
      attachments: (data.attachments ?? []) as unknown as Prisma.InputJsonValue,
      authorType: data.authorType,
      authorName: data.authorName ?? null,
    },
  });
}

export async function updateBrief(id: string, data: UpdateBriefInput) {
  return prisma.eventBrief.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.attachments !== undefined && {
        attachments: data.attachments as unknown as Prisma.InputJsonValue,
      }),
    },
  });
}

export async function deleteBrief(id: string) {
  return prisma.eventBrief.delete({ where: { id } });
}
