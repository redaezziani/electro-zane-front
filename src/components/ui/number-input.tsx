"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

interface NumberInputProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  style?: CSSProperties;
}

export function NumberInput({
  value,
  defaultValue,
  onChange,
  onBlur,
  min,
  max,
  step = 1,
  disabled,
  id,
  name,
  className,
  placeholder,
  style,
}: NumberInputProps) {
  const isControlled = value !== undefined && onChange !== undefined;
  const currentValue = isControlled ? value! : (defaultValue ?? 0);

  const decrement = () => {
    if (disabled) return;
    const next = currentValue - step;
    const clamped = min !== undefined ? Math.max(min, next) : next;
    onChange?.(clamped);
  };

  const increment = () => {
    if (disabled) return;
    const next = currentValue + step;
    const clamped = max !== undefined ? Math.min(max, next) : next;
    onChange?.(clamped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(e.target.value);
    if (!isNaN(parsed)) {
      let clamped = parsed;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      onChange?.(clamped);
    }
  };

  const atMin = min !== undefined && currentValue <= min;
  const atMax = max !== undefined && currentValue >= max;

  return (
    <div
      style={style}
      className={cn(
        "relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-input text-sm shadow-xs",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || atMin}
        className="-ms-px flex aspect-square h-full items-center justify-center rounded-s-md border border-input bg-background text-muted-foreground/80 text-sm hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MinusIcon aria-hidden="true" size={16} />
      </button>
      <input
        id={id}
        name={name}
        type="number"
        value={currentValue}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="w-full grow bg-background px-3 py-2 text-center text-foreground tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={increment}
        disabled={disabled || atMax}
        className="-me-px flex aspect-square h-full items-center justify-center rounded-e-md border border-input bg-background text-muted-foreground/80 text-sm hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <PlusIcon aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
