"use client";

import { useFormStatus } from "react-dom";
import { primaryButton } from "@/components/styles";

export default function SubmitButton({
  children,
  pendingLabel = "Memproses…",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={primaryButton}>
      {pending ? pendingLabel : children}
    </button>
  );
}
