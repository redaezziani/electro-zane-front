"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { Button, Group, Input, NumberField } from "react-aria-components";
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
  const fractionDigits =
    step > 0 && step < 1 ? Math.round(-Math.log10(step)) : 0;

  return (
    <NumberField
      value={value !== undefined && !isNaN(value) ? value : undefined}
      defaultValue={defaultValue}
      onChange={onChange}
      onBlur={onBlur}
      minValue={min}
      maxValue={max}
      step={step}
      isDisabled={disabled}
      name={name}
      formatOptions={{
        useGrouping: false,
        minimumFractionDigits: 0,
        maximumFractionDigits: Math.max(fractionDigits, 20),
      }}
    >
      <Group
        style={style}
        className={cn(
          "relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-input text-sm shadow-xs outline-none transition-[color,box-shadow] data-focus-within:border-ring data-disabled:opacity-50 data-focus-within:ring-[3px] data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40",
          className,
        )}
      >
        <Button
          className="-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-md border border-input bg-background text-muted-foreground/80 text-sm transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          slot="decrement"
        >
          <MinusIcon aria-hidden="true" size={16} />
        </Button>
        <Input
          id={id}
          placeholder={placeholder}
          className="w-full grow bg-background px-3 py-2 text-center text-foreground tabular-nums outline-none"
        />
        <Button
          className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-md border border-input bg-background text-muted-foreground/80 text-sm transition-[color,box-shadow] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          slot="increment"
        >
          <PlusIcon aria-hidden="true" size={16} />
        </Button>
      </Group>
    </NumberField>
  );
}
