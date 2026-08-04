import type { FieldValues } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

export interface Option {
  label: string;
  value: string;
}

export function TextField<T extends FieldValues>({
  placeholder,
  type = "text",
  ...props
}: BaseFieldProps<T> & { placeholder?: string | undefined; type?: string | undefined }) {
  return (
    <FieldWrapper {...props}>
      {(field) => (
        <Input
          {...(field as object)}
          type={type}
          placeholder={placeholder}
          value={(field.value as string) ?? ""}
        />
      )}
    </FieldWrapper>
  );
}

export function TextareaField<T extends FieldValues>({
  placeholder,
  rows = 4,
  ...props
}: BaseFieldProps<T> & { placeholder?: string | undefined; rows?: number | undefined }) {
  return (
    <FieldWrapper {...props}>
      {(field) => (
        <Textarea
          {...(field as object)}
          rows={rows}
          placeholder={placeholder}
          value={(field.value as string) ?? ""}
        />
      )}
    </FieldWrapper>
  );
}

export function SelectField<T extends FieldValues>({
  options,
  placeholder = "Selecione",
  ...props
}: BaseFieldProps<T> & { options: Option[]; placeholder?: string | undefined }) {
  return (
    <FieldWrapper {...props}>
      {(field) => (
        <Select value={(field.value as string) ?? ""} onValueChange={field.onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldWrapper>
  );
}

export function CheckboxField<T extends FieldValues>(props: BaseFieldProps<T>) {
  return (
    <FieldWrapper {...props}>
      {(field) => (
        <Checkbox checked={Boolean(field.value)} onCheckedChange={field.onChange} />
      )}
    </FieldWrapper>
  );
}

export function SwitchField<T extends FieldValues>(props: BaseFieldProps<T>) {
  return (
    <FieldWrapper {...props}>
      {(field) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />}
    </FieldWrapper>
  );
}

export function RadioField<T extends FieldValues>({
  options,
  ...props
}: BaseFieldProps<T> & { options: Option[] }) {
  return (
    <FieldWrapper {...props}>
      {(field) => (
        <RadioGroup
          value={(field.value as string) ?? ""}
          onValueChange={field.onChange}
          className="gap-3"
        >
          {options.map((option) => (
            <label key={option.value} className="text-small flex items-center gap-3">
              <RadioGroupItem value={option.value} />
              {option.label}
            </label>
          ))}
        </RadioGroup>
      )}
    </FieldWrapper>
  );
}
