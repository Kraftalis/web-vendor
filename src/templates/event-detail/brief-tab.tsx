"use client";

import { useState } from "react";
import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import { Card, CardBody, Button } from "@/components/ui";
import { IconDocument } from "@/components/icons";
import { useConfirmDelete } from "@/hooks/use-confirm-delete";
import { useEventBriefs, useCreateBrief, useDeleteBrief } from "@/hooks/event";
import type { BriefAttachment } from "@/services/event/briefs";
import { BriefComposer } from "./brief-composer";
import { BriefCard } from "./brief-card";
import { AttachmentGalleryModal } from "./attachment-gallery-modal";

interface BriefTabProps {
  eventId: string;
  formatDate: (dateStr: string) => string;
}

export const BriefTab = ({ eventId, formatDate }: BriefTabProps) => {
  const { data: briefs = [], isLoading } = useEventBriefs(eventId);
  const createBrief = useCreateBrief(eventId);
  const deleteBriefMut = useDeleteBrief(eventId);

  const [showComposer, setShowComposer] = useState(false);
  const [attachmentModal, setAttachmentModal] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const [galleryAttachments, setGalleryAttachments] = useState<
    BriefAttachment[] | null
  >(null);

  const { pendingId, handleDelete } = useConfirmDelete((briefId) => {
    deleteBriefMut.mutate(briefId);
  });

  const handlePost = async (data: {
    title: string;
    content: string;
    files: File[];
  }) => {
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
      { title: data.title, content: data.content || null, attachments },
      { onSuccess: () => setShowComposer(false) },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowComposer(!showComposer)}>
          Tambah Brief
        </Button>
      </div>

      {showComposer && (
        <BriefComposer
          isPosting={createBrief.isPending}
          onPost={handlePost}
          onCancel={() => setShowComposer(false)}
        />
      )}

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
              <p className="text-sm font-medium text-gray-500">Tidak ada brief</p>
              <p className="mt-1 text-xs text-gray-400">
                Mulai tambahkan brief untuk acara ini
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
              formatDate={formatDate}
              onDelete={() => handleDelete(brief.id)}
              isDeletePending={pendingId === brief.id}
              onViewAttachment={(att) => setAttachmentModal(att)}
              onShowAllAttachments={(atts) => setGalleryAttachments(atts)}
            />
          ))}
        </div>
      )}

      {/* Single attachment preview */}
      <Modal isOpen={!!attachmentModal} onOpenChange={(open) => { if (!open) setAttachmentModal(null); }}>
        <ModalBackdrop isDismissable />
        <ModalContainer size="lg">
          <ModalDialog>
            <ModalHeader>{attachmentModal?.name ?? "Lihat Lampiran"}</ModalHeader>
            <ModalBody>
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
            </ModalBody>
          </ModalDialog>
        </ModalContainer>
      </Modal>

      <AttachmentGalleryModal
        attachments={galleryAttachments}
        onClose={() => setGalleryAttachments(null)}
        onViewAttachment={(att) => {
          setGalleryAttachments(null);
          setAttachmentModal(att);
        }}
      />
    </div>
  );
};
