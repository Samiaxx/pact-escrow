import { ScrollArea } from "@/components/ui/scroll-area";
import { TransactionLog } from "@/hooks/use-kadena";
import { Terminal, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsoleLogProps {
  logs: TransactionLog[];
}

export function ConsoleLog({ logs }: ConsoleLogProps) {
  return (
    <div className="glass-card flex flex-col h-[300px] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 bg-black/20">
        <Terminal className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">System Logs</h3>
      </div>
      <ScrollArea className="flex-1 p-4 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
            <Terminal className="w-8 h-8 opacity-20" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="mt-0.5 shrink-0">
                  {log.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {log.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                  {log.status === 'pending' && <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />}
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  <p className={cn(
                    "break-all",
                    log.status === 'success' && "text-green-400",
                    log.status === 'error' && "text-red-400",
                    log.status === 'pending' && "text-yellow-400"
                  )}>
                    {log.message}
                  </p>
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    {log.reqKey && (
                      <a 
                        href={`https://explorer.chainweb.com/mainnet/tx/${log.reqKey}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="hover:text-primary underline decoration-dotted"
                      >
                        {log.reqKey.substring(0, 12)}...
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
