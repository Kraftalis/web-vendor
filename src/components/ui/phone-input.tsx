"use client";

import { forwardRef } from "react";
import Input, { type InputProps } from "./input";

/**
 * PhoneInput - A specialized input for Indonesian phone numbers.
 * It automatically prefixes "62" and handles the "08" replacement.
 */

interface PhoneInputProps extends Omit<InputProps, "onChange"> {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, hint, className, onChange, ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        label={label}
        error={error}
        hint={hint || "Contoh: 081234567890"}
        className={className}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          let val = e.target.value.replace(/[^0-9]/g, "");
          if (val.startsWith("0")) {
            val = "62" + val.substring(1);
          } else if (val.startsWith("8")) {
            val = "62" + val;
          }

          if (onChange) {
            // We create a shallow copy of the event object and override the value
            // This is a common pattern for "controlled input" behavior in a wrapper
            const newEvent = {
              ...e,
              target: {
                ...e.target,
                name: props.name || "",
                value: val,
              },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(newEvent);
          }
        }}
      />
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
