export interface EventCategory {
  id: string;
  name: string;
  description: string | null;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventCategoryPayload {
  name: string;
  description?: string | null;
  color: string;
}

export interface UpdateEventCategoryPayload {
  name: string;
  description?: string | null;
  color: string;
}
