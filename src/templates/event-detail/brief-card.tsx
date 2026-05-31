"use client";

import { Card, CardHeader, CardBody, Button } from "@/components/ui";
import { IconDocument, IconTrash } from "@/components/icons";
import {
  RichTextContent,
} from "@/components/ui/rich-text-editor";
import type { BriefItem, BriefAttachment } from "@/services/event/briefs";

const MAX_VISIBLE_ATTACHMENTS = 6;

interface BriefCardProps {
  brief: BriefItem;
  formatDate: (dateStr: string) => string;
  onDelete: () => void;
  isDeletePending: boolean;
  onViewAttachment: (att: { url: string; name: string; type: string }) => void;
  onShowAllAttachments: (atts: BriefAttachment[]) => void;
}

export const BriefCard = ({
  brief,
  formatDate,
  onDelete,
  isDeletePending,
  onViewAttachment,
  onShowAllAttachments,
}: BriefCardProps) => {
  const attachments = (brief.attachments ?? []) as BriefAttachment[];
  const visible = attachments.slice(0, MAX_VISIBLE_ATTACHMENTS);
  const overflowCount = attachments.length - MAX_VISIBLE_ATTACHMENTS;

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{brief.title}</h3>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
            <span>{formatDate(brief.createdAt)}</span>
            {brief.authorName && (
              <>
                <span>·</span>
                <span>oleh {brief.authorName}</span>
              </>
            )}
            <span
              className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${
                brief.authorType === "VENDOR"
                  ? "bg-purple-50 text-purple-600"
                  : "bg-sky-50 text-sky-600"
              }`}
            >
              {brief.authorType === "VENDOR" ? "Vendor" : "Client"}
            </span>
          </div>
        </div>
        <button
          onClick={onDelete}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            isDeletePending
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "text-gray-400 hover:bg-red-50 hover:text-red-500"
          }`}
          title="Hapus"
        >
          {isDeletePending ? "Yakin?" : <IconTrash size={14} />}
        </button>
      </CardHeader>
      <CardBody className="space-y-3">
        {brief.content && <RichTextContent html={brief.content} />}

        {attachments.length > 0 && (
          <div className="flex items-center gap-2 overflow-hidden">
            {visible.map((att, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onViewAttachment(att)}
                className="group relative shrink-0 overflow-hidden rounded-lg border border-gray-200 transition-colors hover:border-blue-300"
              >
                {att.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.url}
                    alt={att.name}
                    className="h-16 w-16 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 flex-col items-center justify-center bg-gray-50">
                    <IconDocument size={20} className="text-gray-400" />
                    <span className="mt-0.5 max-w-14 truncate px-1 text-[9px] text-gray-500">
                      {att.name.split(".").pop()?.toUpperCase()}
                    </span>
                  </div>
                )}
              </button>
            ))}
            {overflowCount > 0 && (
              <button
                type="button"
                onClick={() => onShowAllAttachments(attachments)}
                className="flex h-16 shrink-0 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                +{overflowCount} Lainnya
              </button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};
