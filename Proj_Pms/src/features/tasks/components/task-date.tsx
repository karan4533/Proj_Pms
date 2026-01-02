import { useMemo } from "react";
import { differenceInDays, format } from "date-fns";

import { cn } from "@/lib/utils";

interface TaskDateProps {
  value: string;
  className?: string;
}

export const TaskDate = ({ value, className }: TaskDateProps) => {
  const { formattedDate, textColor } = useMemo(() => {
    // Handle empty or invalid dates
    if (!value || value.trim() === '') {
      return {
        formattedDate: "No date",
        textColor: "text-muted-foreground"
      };
    }

    const endDate = new Date(value);
    
    // Check if the date is valid
    if (isNaN(endDate.getTime())) {
      return {
        formattedDate: "Invalid date",
        textColor: "text-muted-foreground"
      };
    }
    
    const today = new Date();
    const diffInDays = differenceInDays(endDate, today);

    let color = "text-muted-foreground";

    if (diffInDays <= 3) {
      color = "text-red-500";
    } else if (diffInDays <= 7) {
      color = "text-orange-500";
    } else if (diffInDays <= 14) {
      color = "text-yellow-500";
    }

    return {
      formattedDate: format(endDate, "PPP"),
      textColor: color
    };
  }, [value]);

  return (
    <div className={textColor}>
      <span className={cn("truncate", className)}>{formattedDate}</span>
    </div>
  );
};
