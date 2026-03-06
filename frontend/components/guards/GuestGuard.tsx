"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

const emptySubscribe = () => () => {};

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isGuest = useSyncExternalStore(
    emptySubscribe,
    () => !localStorage.getItem("access_token"),
    () => true,
  );

  useEffect(() => {
    if (!isGuest) {
      router.replace("/");
    }
  }, [isGuest, router]);

  if (!isGuest) return null;

  return <>{children}</>;
}
