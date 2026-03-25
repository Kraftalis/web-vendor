"use client";

import { Button, Input, Textarea, Modal } from "@/components/ui";
import type { EventCategory } from "@/services/event-category/types";

interface Props {
  open: boolean;
  editing: EventCategory | null;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  isSaving: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dict: Record<string, any>;
}

export default function EventCategoryModal({
  open,
  editing,
  onClose,
  onSave,
  isSaving,
  dict,
}: Props) {
  const s = dict.settings;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? s.editEventCategory : s.addEventCategory}
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="event-cat-form"
            disabled={isSaving}
          >
            {dict.common.save}
          </Button>
        </>
      }
    >
      <form id="event-cat-form" action={onSave} className="space-y-4">
        <Input
          name="name"
          label={s.eventCategoryName}
          placeholder={s.eventCategoryNamePlaceholder}
          defaultValue={editing?.name ?? ""}
          required
        />
        <Textarea
          name="description"
          label={s.eventCategoryDescription}
          placeholder={s.eventCategoryDescPlaceholder}
          defaultValue={editing?.description ?? ""}
          rows={3}
        />
      </form>
    </Modal>
  );
}
