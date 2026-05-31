import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  desc: string;
}

export const EmptyState = ({ icon, title, desc }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
      {icon}
    </div>
    <p className="text-sm font-bold text-gray-900">{title}</p>
    <p className="mt-1 max-w-45 text-xs font-medium text-gray-400 leading-relaxed">
      {desc}
    </p>
  </div>
);
