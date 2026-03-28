"use client";

import { type ReactNode } from "react";

/**
 * Card — container component with consistent styling.
 * Supports header with title, optional action, and body content.
 */

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className = "",
}: CardHeaderProps) {
  if (children) {
    return (
      <div
        className={`flex items-center justify-between border-b border-gray-200 px-5 py-4 ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between border-b border-gray-200 px-5 py-4 ${className}`}
    >
      <div>
        {title && (
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        )}
        {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`border-t border-gray-200 px-5 py-3 ${className}`}>
      {children}
    </div>
  );
}

export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps };
