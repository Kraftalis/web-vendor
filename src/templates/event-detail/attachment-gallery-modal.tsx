"use client";

import { useMemo } from "react";
import {
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { IconDocument, IconImage, IconPaperclip } from "@/components/icons";
import type { BriefAttachment } from "@/services/event/briefs";

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface AttachmentGalleryModalProps {
  attachments: BriefAttachment[] | null;
  onClose: () => void;
  onViewAttachment: (att: { url: string; name: string; type: string }) => void;
}

export const AttachmentGalleryModal = ({
  attachments,
  onClose,
  onViewAttachment,
}: AttachmentGalleryModalProps) => {
  const images = useMemo(
    () => (attachments ?? []).filter((a) => a.type.startsWith("image/")),
    [attachments],
  );
  const files = useMemo(
    () => (attachments ?? []).filter((a) => !a.type.startsWith("image/")),
    [attachments],
  );

  const defaultTab = images.length > 0 ? "images" : "files";

  return (
    <Modal isOpen={!!attachments} onOpenChange={(open) => !open && onClose()}>
      <ModalBackdrop isDismissable />
      <ModalContainer size="2xl">
        <ModalDialog>
          <ModalHeader>Lihat Lampiran</ModalHeader>
          <ModalBody>
            <Tabs defaultTab={defaultTab}>
              <TabList className="mb-4">
                <Tab id="images" icon={<IconImage size={14} />}>
                  Gambar ({images.length})
                </Tab>
                <Tab id="files" icon={<IconPaperclip size={14} />}>
                  File ({files.length})
                </Tab>
              </TabList>

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
                          <p className="truncate text-[10px] text-white">
                            {att.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </TabPanel>

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
          </ModalBody>
        </ModalDialog>
      </ModalContainer>
    </Modal>
  );
};
