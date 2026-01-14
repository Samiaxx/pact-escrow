import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStyles = (s: string) => {
    switch (s.toUpperCase()) {
      case 'CREATED': return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case 'ACCEPTED': return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case 'FUNDED': return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case 'PAID': return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case 'COMPLETED': return "bg-green-500/10 text-green-400 border-green-500/20";
      case 'REFUNDED': return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-bold border tracking-wider",
      getStyles(status)
    )}>
      {status.toUpperCase()}
    </span>
  );
}
