"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
} from "@/components/ui";
import {
  IconUpload,
  IconImage,
  IconPaperclip,
} from "@/components/icons";
import {
  RichTextEditor,
} from "@/components/ui/rich-text-editor";

interface BriefComposerProps {
  isPosting: boolean;
  onPost: (data: { title: string; content: string; files: File[] }) => void;
  onCancel: () => void;
}

export const BriefComposer = ({
  isPosting,
  onPost,
  onCancel,
}: BriefComposerProps) => {
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
        <h2 className="text-base font-semibold text-gray-900">Tambah Brief</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Judul Brief"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan judul brief..."
            required
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Konten Brief
            </label>
            <RichTextEditor
              content={content}
              placeholder="Tuliskan brief di sini..."
              onChange={(html) => setContent(html)}
            />
          </div>

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

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700">
              <IconUpload size={14} />
              Lampirkan File
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
                {isPosting ? "Mengirim..." : "Kirim Brief"}
              </Button>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};
