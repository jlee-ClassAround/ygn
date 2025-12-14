import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  value: string | null;
}

export function LockedInput({ label, value }: Props) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        disabled
        className="h-14 bg-foreground/10 text-foreground/50"
        defaultValue={value || ""}
      />
    </div>
  );
}
