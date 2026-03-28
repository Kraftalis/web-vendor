"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Modal,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from "@/components/ui";
import {
  IconDocument,
  IconUpload,
  IconImage,
  IconPaperclip,
  IconTrash,
} from "@/components/icons";
import { RichTextEditor, RichTextContent } from "@/components/ui/rich-text-editor";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import {
  useEventBriefs,
  useCreateBrief,
  useDeleteBrief,
} from "@/hooks/event";
import type { BriefItem, BriefAttachment } from "@/services/event/briefs";

// ─── Brief Tab ──────────────────────────────────────────────

interface BriefTabProps {
  eventId: string;
  labels: {
    noBriefs: string;
    noBriefsDesc: string;
    addBrief: string;
    briefTitle: string;
    briefTitlePlaceholder: string;
    briefPlaceholder: string;
    briefAttachFile: string;
    briefSubmit: string;
    briefPosting: string;
    briefDeleteConfirm: string;
    briefDelete: string;
    briefBy: string;
    briefViewAttachment: string;
    briefMore: string;
    briefImages: string;
    briefFiles: string;
  };
  formatDate: (dateStr: string) => string;
}

export function BriefTab({ eventId, labels, formatDate }: BriefTabProps) {
  const { data: briefs = [], isLoading } = useEventBriefs(eventId);
  const createBrief = useCreateBrief(eventId);
  const deleteBriefMut = useDeleteBrief(eventId);

  const [showComposer, setShowComposer] = useState(false);

  // Single-attachment preview (click on a thumbnail)
  const [attachmentModal, setAttachmentModal] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);

  // "More" gallery modal — shows all attachments for a brief
  const [galleryAttachments, setGalleryAttachments] = useState<
    BriefAttachment[] | null
  >(null);

  // Delete confirmation via useConfirmDelete (click → red "Confirm?" → click again)
  const { pendingId, handleDelete } = useConfirmDelete((briefId) => {
    deleteBriefMut.mutate(briefId);
  });

  async function handlePost(data: {
    title: string;
    content: string;
    files: File[];
  }) {
    const attachments: BriefAttachment[] = [];

    for (const file of data.files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "briefs");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
        if (result.data?.publicUrl) {
          attachments.push({
            name: result.data.fileName ?? file.name,
            url: result.data.publicUrl,
            type: file.type,
            size: file.size,
          });
        }
      } catch (err) {
        console.error("File upload failed:", err);
      }
    }

    createBrief.mutate(
      {
        title: data.title,
        content: data.content || null,
        attachments,
      },
      {
        onSuccess: () => setShowComposer(false),
      },
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Brief button */}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowComposer(!showComposer)}>
          {labels.addBrief}
        </Button>
      </div>

      {/* Composer */}
      {showComposer && (
        <BriefComposer
          labels={labels}
          isPosting={createBrief.isPending}
          onPost={handlePost}
          onCancel={() => setShowComposer(false)}
        />
      )}

      {/* Brief list */}
      {isLoading ? (
        <Card>
          <CardBody>
            <div className="py-8 text-center text-sm text-gray-400">Loading...</div>
          </CardBody>
        </Card>
      ) : briefs.length === 0 && !showComposer ? (
        <Card>
          <CardBody>
            <div className="py-12 text-center">
              <IconDocument size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">
                {labels.noBriefs}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {labels.noBriefsDesc}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {briefs.map((brief) => (
            <BriefCard
              key={brief.id}
              brief={brief}
              labels={labels}
              formatDate={formatDate}
              onDelete={() => handleDelete(brief.id)}
              isDeletePending={pendingId === brief.id}
              onViewAttachment={(att) => setAttachmentModal(att)}
              onShowAllAttachments={(atts) => setGalleryAttachments(atts)}
            />
          ))}
        </div>
      )}

      {/* Single attachment preview modal */}
      <Modal
        open={!!attachmentModal}
        onClose={() => setAttachmentModal(null)}
        title={attachmentModal?.name ?? labels.briefViewAttachment}
        className="max-w-2xl"
      >
        {attachmentModal && (
          <div className="flex flex-col items-center gap-4">
            {attachmentModal.type.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={attachmentModal.url}
                alt={attachmentModal.name}
                className="max-h-[60vh] w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-8">
                <IconDocument size={48} className="text-gray-300" />
                <p className="text-sm text-gray-600">{attachmentModal.name}</p>
              </div>
            )}
            <a
              href={attachmentModal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Open in new tab ↗
            </a>
          </div>
        )}
      </Modal>

      {/* Gallery "More" modal — Images & Files tabs */}
      <AttachmentGalleryModal
        attachments={galleryAttachments}
        onClose={() => setGalleryAttachments(null)}
        onViewAttachment={(att) => {
          setGalleryAttachments(null);
          setAttachmentModal(att);
        }}
        labels={labels}
      />
    </div>
  );
}

// ─── Brief Composer ─────────────────────────────────────────

function BriefComposer({
  labels,
  isPosting,
  onPost,
  onCancel,
}: {
  labels: BriefTabProps["labels"];
  isPosting: boolean;
  onPost: (data: { title: string; content: string; files: File[] }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onPost({ title, content, files });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-gray-900">
          {labels.addBrief}
        </h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <Input
            label={labels.briefTitle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={labels.briefTitlePlaceholder}
            required
          />

          {/* Rich text content */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {labels.briefPlaceholder}
            </label>
            <RichTextEditor
              content={content}
              placeholder={labels.briefPlaceholder}
              onChange={(html) => setContent(html)}
            />
          </div>

          {/* Attached files preview */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 rounded-md bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600"
                >
                  {file.type.startsWith("image/") ? (
                    <IconImage size={12} />
                  ) : (
                    <IconPaperclip size={12} />
                  )}
                  <span className="max-w-30 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="ml-0.5 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700">
              <IconUpload size={14} />
              {labels.briefAttachFile}
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isPosting}>
                {isPosting ? labels.briefPosting : labels.briefSubmit}
              </Button>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

// ─── Brief Card ─────────────────────────────────────────────

const MAX_VISIBLE_ATTACHMENTS = 6;

function BriefCard({
  brief,
  labels,
  formatDate,
  onDelete,
  isDeletePending,
  onViewAttachment,
  onShowAllAttachments,
}: {
  brief: BriefItem;
  labels: BriefTabProps["labels"];
  formatDate: (dateStr: string) => string;
  onDelete: () => void;
  isDeletePending: boolean;
  onViewAttachment: (att: { url: string; name: string; type: string }) => void;
  onShowAllAttachments: (atts: BriefAttachment[]) => void;
}) {
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
                <span>
                  {labels.briefBy} {brief.authorName}
                </span>
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
        {/* Delete button: first click → red "Confirm?", second click → delete */}
        <button
          onClick={onDelete}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            isDeletePending
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "text-gray-400 hover:bg-red-50 hover:text-red-500"
          }`}
          title={labels.briefDelete}
        >
          {isDeletePending ? (
            labels.briefDeleteConfirm
          ) : (
            <IconTrash size={14} />
          )}
        </button>
      </CardHeader>
      <CardBody className="space-y-3">
        {/* Content (rich text) */}
        {brief.content && <RichTextContent html={brief.content} />}

        {/* Attachment thumbnails (max 6, horizontal) */}
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
            {/* "More" pill */}
            {overflowCount > 0 && (
              <button
                type="button"
                onClick={() => onShowAllAttachments(attachments)}
                className="flex h-16 shrink-0 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                +{overflowCount} {labels.briefMore}
              </button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// ─── Attachment Gallery Modal (Images / Files tabs) ─────────

function AttachmentGalleryModal({
  attachments,
  onClose,
  onViewAttachment,
  labels,
}: {
  attachments: BriefAttachment[] | null;
  onClose: () => void;
  onViewAttachment: (att: { url: string; name: string; type: string }) => void;
  labels: BriefTabProps["labels"];
}) {
  const images = useMemo(
    () => (attachments ?? []).filter((a) => a.type.startsWith("image/")),
    [attachments],
  );
  const files = useMemo(
    () => (attachments ?? []).filter((a) => !a.type.startsWith("image/")),
    [attachments],
  );

  // Determine default tab
  const defaultTab = images.length > 0 ? "images" : "files";

  return (
    <Modal
      open={!!attachments}
      onClose={onClose}
      title={labels.briefViewAttachment}
      className="max-w-2xl"
    >
      <Tabs defaultTab={defaultTab}>
        <TabList className="mb-4">
          <Tab id="images" icon={<IconImage size={14} />}>
            {labels.briefImages} ({images.length})
          </Tab>
          <Tab id="files" icon={<IconPaperclip size={14} />}>
            {labels.briefFiles} ({files.length})
          </Tab>
        </TabList>

        {/* Images — gallery grid */}
        <TabPanel id="images">
          {images.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">—</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {images.map((att, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onViewAttachment(att)}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 transition-colors hover:border-blue-300"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.url}
                    alt={att.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/50 to-transparent px-2 pb-1.5 pt-4">
                    <p className="truncate text-[10px] text-white">{att.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabPanel>

        {/* Files — list view */}
        <TabPanel id="files">
          {files.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">—</p>
          ) : (
            <div className="space-y-1">
              {files.map((att, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onViewAttachment(att)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <IconDocument size={18} className="text-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {att.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {att.name.split(".").pop()?.toUpperCase()}
                      {att.size ? ` · ${formatFileSize(att.size)}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-blue-600">
                    Open ↗
                  </span>
                </button>
              ))}
            </div>
          )}
        </TabPanel>
      </Tabs>
    </Modal>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
