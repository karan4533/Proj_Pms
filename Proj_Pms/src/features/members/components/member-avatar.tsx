import { cn } from "@/lib/utils";
import { memo, useMemo } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MemberAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const MemberAvatar = memo(({
  name,
  className,
  fallbackClassName,
}: MemberAvatarProps) => {
  const initial = useMemo(() => name.charAt(0).toUpperCase(), [name]);
  
  return (
    <Avatar
      className={cn(
        "size-5 transition border border-neutral-300 rounded-full",
        className
      )}
    >
      <AvatarFallback
        className={cn(
          "bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center",
          fallbackClassName
        )}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
});
MemberAvatar.displayName = "MemberAvatar";
