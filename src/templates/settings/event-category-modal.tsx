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
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="color"
            type="color"
            label={dict.settings.eventCategoryColor ?? "Category Color"}
            defaultValue={editing?.color ?? "#3B82F6"}
            className="h-10 p-1"
          />
          <Input
            name="colorHex"
            label="Hex Code"
            placeholder="#000000"
            defaultValue={editing?.color ?? "#3B82F6"}
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            onChange={(e) => {
              const colorInput = document.getElementsByName(
                "color",
              )[0] as HTMLInputElement;
              if (
                colorInput &&
                /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(e.target.value)
              ) {
                colorInput.value = e.target.value;
              }
            }}
          />
        </div>
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
