import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex justify-start gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <div className="space-y-2 flex flex-col items-end">
          <Skeleton className="h-4 w-[220px]" />
          <Skeleton className="h-4 w-[180px]" />
        </div>
      </div>
    </div>
  );
}
