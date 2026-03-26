export interface EventCategory {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventCategoryPayload {
  name: string;
  description?: string | null;
}

export interface UpdateEventCategoryPayload {
  name: string;
  description?: string | null;
}
