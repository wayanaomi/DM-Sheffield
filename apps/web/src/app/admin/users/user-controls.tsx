"use client";

import { useTransition } from "react";
import { ROLE_LABELS, UserRole } from "@/lib/enums";
import { changeUserRole, toggleUserStatus } from "./actions";

export function RoleSelect({ userId, role }: { userId: string; role: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      defaultValue={role}
      disabled={pending}
      onChange={(e) => startTransition(() => changeUserRole(userId, e.target.value))}
      className="rounded-md border border-border px-2 py-1 text-xs"
    >
      {UserRole.options.map((r) => (
        <option key={r} value={r}>
          {ROLE_LABELS[r]}
        </option>
      ))}
    </select>
  );
}

export function StatusToggle({ userId, status }: { userId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const next = status === "disabled" ? "active" : "disabled";
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleUserStatus(userId, next))}
      className="text-xs font-medium text-blue hover:underline disabled:opacity-50"
    >
      {status === "disabled" ? "Re-enable" : "Disable"}
    </button>
  );
}
