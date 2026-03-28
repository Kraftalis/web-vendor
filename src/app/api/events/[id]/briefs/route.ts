import { NextRequest } from "next/server";
import {
  successResponse,
  createdResponse,
  validationError,
  notFoundError,
  forbiddenError,
  internalError,
  requireBusinessProfile,
} from "@/lib/api";
import { auth } from "@/lib/auth";
import {
  findEventById,
  findBriefsByEventId,
  createBrief,
} from "@/repositories/event";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const createBriefSchema = z.object({
  title: z.string().min(1, "Title is required.").max(500),
  content: z.string().max(50000).optional().nullable(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
        size: z.number(),
      }),
    )
    .optional()
    .default([]),
});

/**
 * GET /api/events/[id]/briefs
 * List all briefs for an event.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  try {
    const { id } = await params;
    const event = await findEventById(id);

    if (!event) return notFoundError("Event not found.");
    if (event.businessProfileId !== businessProfileId) return forbiddenError();

    const briefs = await findBriefsByEventId(id);

    return successResponse(
      briefs.map((b) => ({
        id: b.id,
        eventId: b.eventId,
        title: b.title,
        content: b.content,
        attachments: b.attachments,
        authorType: b.authorType,
        authorName: b.authorName,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
    );
  } catch (err) {
    console.error("[API] GET /api/events/[id]/briefs error:", err);
    return internalError();
  }
}

/**
 * POST /api/events/[id]/briefs
 * Create a new brief for an event.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { businessProfileId, error } = await requireBusinessProfile();
  if (error) return error;

  // Get user name for author tracking
  const session = await auth();
  const authorName = session?.user?.name ?? null;

  try {
    const { id } = await params;
    const event = await findEventById(id);

    if (!event) return notFoundError("Event not found.");
    if (event.businessProfileId !== businessProfileId) return forbiddenError();

    const body = await request.json();
    const result = createBriefSchema.safeParse(body);
    if (!result.success) {
      return validationError(
        "Validation failed.",
        result.error.flatten().fieldErrors,
      );
    }

    const brief = await createBrief(id, {
      title: result.data.title,
      content: result.data.content ?? null,
      attachments: result.data.attachments,
      authorType: "VENDOR",
      authorName: authorName,
    });

    return createdResponse({
      id: brief.id,
      eventId: brief.eventId,
      title: brief.title,
      content: brief.content,
      attachments: brief.attachments,
      authorType: brief.authorType,
      authorName: brief.authorName,
      createdAt: brief.createdAt.toISOString(),
      updatedAt: brief.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error("[API] POST /api/events/[id]/briefs error:", err);
    return internalError();
  }
}
