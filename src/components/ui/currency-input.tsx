"use client";

import { forwardRef } from "react";
import { NumericFormat, type NumericFormatProps } from "react-number-format";
import Input, { type InputProps } from "./input";

/**
 * CurrencyInput - A specialized input for monetary values.
 * It uses react-number-format for masking and formatting.
 */

interface CurrencyInputProps
  extends
    Omit<NumericFormatProps, "customInput" | "error" | "label" | "hint">,
    Pick<InputProps, "label" | "error" | "hint" | "className"> {
  currencyPrefix?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    { label, error, hint, className, currencyPrefix = "Rp ", ...props },
    ref,
  ) => {
    return (
      <NumericFormat
        {...props}
        getInputRef={ref}
        customInput={Input}
        label={label}
        error={error}
        hint={hint}
        className={className}
        thousandSeparator="."
        decimalSeparator=","
        prefix={currencyPrefix}
        allowNegative={false}
      />
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";

export default CurrencyInput;
