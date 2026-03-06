"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isGuest] = useState(
    () =>
      typeof window !== "undefined" && !localStorage.getItem("access_token"),
  );

  useEffect(() => {
    if (!isGuest) {
      router.replace("/");
    }
  }, [isGuest, router]);

  if (!isGuest) return null;

  return <>{children}</>;
}
