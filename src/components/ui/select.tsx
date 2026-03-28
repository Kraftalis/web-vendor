"use client";

import {
  type InputHTMLAttributes,
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

/* ─── Types ────────────────────────────────────────────────── */

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "multiple"
> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  /** Current value (single mode) */
  value?: string;
  /** Current values (multi mode) */
  values?: string[];
  /** Controlled single-select change — mimics native <select> onChange */
  onChange?: (e: { target: { value: string; name: string } }) => void;
  /** Controlled multi-select change */
  onChangeMulti?: (values: string[]) => void;
  /** Enable multi-select mode */
  multiple?: boolean;
  /** Enable autocomplete / search filtering */
  searchable?: boolean;
  /** className forwarded to the outer wrapper (not the trigger) */
  className?: string;
  /** defaultValue for uncontrolled usage (form submission) */
  defaultValue?: string;
}

/* ─── Component ────────────────────────────────────────────── */

const Select = forwardRef<HTMLInputElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder = "Select…",
      value,
      values,
      onChange,
      onChangeMulti,
      multiple = false,
      searchable = false,
      className = "",
      id,
      name,
      defaultValue,
      disabled,
      ...rest
    },
    ref,
  ) => {
    /* state */
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [style, setStyle] = useState<React.CSSProperties>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // For uncontrolled single-select with defaultValue
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");

    const currentValue = value ?? internalValue;
    const currentMulti = values ?? [];

    const handleClose = useCallback(() => {
      setOpen(false);
      setSearch("");
    }, []);

    /* close on outside click */
    useEffect(() => {
      function handleClick(e: MouseEvent) {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          handleClose();
        }
      }
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [handleClose]);

    /* close on scroll */
    useEffect(() => {
      if (!open) return;
      window.addEventListener("scroll", handleClose, true);
      return () => window.removeEventListener("scroll", handleClose, true);
    }, [open, handleClose]);

    /* calculate position */
    const calculatePosition = useCallback(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setStyle({
          position: "fixed",
          top: rect.bottom + 4, // 4px gap
          left: rect.left,
          width: rect.width,
        });
      }
    }, []);

    const handleTriggerClick = () => {
      if (disabled) return;
      const isOpen = !open;
      setOpen(isOpen);
      if (isOpen) {
        calculatePosition();
      }
    };

    /* focus search when opened */
    useEffect(() => {
      if (open && searchable && searchRef.current) {
        searchRef.current.focus();
      }
    }, [open, searchable]);

    /* keyboard navigation */
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          handleClose();
        }
      },
      [handleClose],
    );

    /* filtered options */
    const filtered = search
      ? options.filter((o) =>
          o.label.toLowerCase().includes(search.toLowerCase()),
        )
      : options;

    /* selection handlers */
    function selectSingle(val: string) {
      setInternalValue(val);
      onChange?.({ target: { value: val, name: name ?? "" } });
      setOpen(false);
      setSearch("");
    }

    function toggleMulti(val: string) {
      const next = currentMulti.includes(val)
        ? currentMulti.filter((v) => v !== val)
        : [...currentMulti, val];
      onChangeMulti?.(next);
    }

    /* display label */
    function getDisplayLabel(): string {
      if (multiple) {
        if (currentMulti.length === 0) return placeholder;
        if (currentMulti.length === 1) {
          return (
            options.find((o) => o.value === currentMulti[0])?.label ??
            currentMulti[0]
          );
        }
        return `${currentMulti.length} selected`;
      }
      if (!currentValue) return placeholder;
      return (
        options.find((o) => o.value === currentValue)?.label ?? currentValue
      );
    }

    const displayLabel = getDisplayLabel();
    const isPlaceholder = multiple ? currentMulti.length === 0 : !currentValue;

    const widthAuto = className.includes("w-auto");

    return (
      <div
        ref={containerRef}
        className={`relative ${widthAuto ? "" : "w-full"} ${className}`}
        onKeyDown={handleKeyDown}
      >
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}

        {/* Hidden input for form submission */}
        <input
          ref={ref}
          type="hidden"
          name={name}
          value={multiple ? currentMulti.join(",") : currentValue}
          {...rest}
        />

        {/* Trigger button */}
        <button
          ref={triggerRef}
          type="button"
          id={id}
          disabled={disabled}
          onClick={handleTriggerClick}
          className={`flex items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${
            widthAuto ? "w-auto" : "w-full"
          } ${
            error
              ? "border-red-500 focus:border-red-500"
              : open
                ? "border-blue-600 ring-2 ring-blue-600/20"
                : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        >
          <span
            className={`truncate ${isPlaceholder ? "text-gray-400" : "text-gray-900"}`}
          >
            {displayLabel}
          </span>
          {/* Chevron */}
          <svg
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            style={style}
            className="z-50 mt-1 min-w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {/* Search box */}
            {searchable && (
              <div className="border-b border-gray-100 p-2">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:bg-white"
                />
              </div>
            )}

            {/* Options list */}
            <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-400">No results</li>
              )}
              {filtered.map((option) => {
                const isSelected = multiple
                  ? currentMulti.includes(option.value)
                  : currentValue === option.value;

                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() =>
                      multiple
                        ? toggleMulti(option.value)
                        : selectSingle(option.value)
                    }
                    className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {/* Multi checkbox */}
                    {multiple && (
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        )}
                      </span>
                    )}

                    {/* Label */}
                    <span className="truncate">{option.label}</span>

                    {/* Single check */}
                    {!multiple && isSelected && (
                      <svg
                        className="ml-auto h-4 w-4 shrink-0 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Multi-select footer */}
            {multiple && currentMulti.length > 0 && (
              <div className="border-t border-gray-100 px-3 py-2">
                <button
                  type="button"
                  onClick={() => onChangeMulti?.([])}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
export type { SelectProps, SelectOption };
