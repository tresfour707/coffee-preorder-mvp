"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type StaffSignOutButtonProps = {
  className?: string;
};

export function StaffSignOutButton({ className }: StaffSignOutButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    setIsSubmitting(true);

    try {
      await fetch("/api/staff/sign-out", {
        method: "POST",
      });
    } finally {
      router.push("/staff-access");
      router.refresh();
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      className={className}
    >
      {isSubmitting ? "Закрываем…" : "Выйти из staff-режима"}
    </button>
  );
}
