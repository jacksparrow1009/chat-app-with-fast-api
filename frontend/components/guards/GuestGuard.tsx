"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      router.replace("/");
    } else {
      setIsGuest(true);
    }
  }, [router]);

  if (isGuest === null) return null;

  return <>{children}</>;
}
