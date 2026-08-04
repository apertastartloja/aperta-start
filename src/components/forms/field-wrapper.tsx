import type { ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string | undefined;
  description?: string | undefined;
  className?: string | undefined;
}

interface FieldWrapperProps<T extends FieldValues> extends BaseFieldProps<T> {
  children: (field: {
    value: unknown;
    onChange: (...event: unknown[]) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<never>;
  }) => ReactNode;
}

/** Wrapper único de campo: label + controle + descrição + erro. */
export function FieldWrapper<T extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  children,
}: FieldWrapperProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label ? <FormLabel className="text-small font-semibold">{label}</FormLabel> : null}
          <FormControl>{children(field as never)}</FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
