"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import UserAvatar from "@/components/user-avatar";
import {
  IconUser,
  IconSettings,
  IconLogout,
  IconChevronDown,
} from "@/components/icons";
import { handleSignOut } from "@/components/topbar/actions";
import { useDictionary } from "@/i18n";

/**
 * ProfileDropdown — user avatar with dropdown menu.
 * Includes links to My Profile, Settings, and Sign Out.
 */

interface ProfileDropdownProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { dict } = useDictionary();

  const close = useCallback(() => setOpen(false), []);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, close]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-50"
        aria-label={dict.profileDropdown.userMenu}
        aria-expanded={open}
      >
        <UserAvatar src={user.image} name={user.name} size={34} />
        <div className="hidden flex-col items-start lg:flex">
          <span className="text-sm font-medium leading-tight text-gray-900">
            {user.name || dict.profileDropdown.user}
          </span>
          <span className="text-[11px] leading-tight text-gray-400">
            {user.email}
          </span>
        </div>
        <IconChevronDown
          size={14}
          className={`hidden text-gray-400 transition-transform lg:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
          {/* User Info Header */}
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <UserAvatar src={user.image} name={user.name} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user.name || dict.profileDropdown.user}
                </p>
                <p className="truncate text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5">
            <Link
              href="/vendor/profile"
              onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <IconUser size={16} className="text-gray-400" />
              {dict.profileDropdown.myProfile}
            </Link>
            <Link
              href="/vendor/settings"
              onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <IconSettings size={16} className="text-gray-400" />
              {dict.profileDropdown.settings}
            </Link>
          </div>

          {/* Divider + Sign Out */}
          <div className="border-t border-gray-200 p-1.5">
            <form action={handleSignOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <IconLogout size={16} className="text-red-400" />
                {dict.profileDropdown.signOut}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
