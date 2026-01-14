import { useState } from "react";
import { useKadena, EscrowState, NETWORK_ID, CHAIN_ID } from "@/hooks/use-kadena";
import { ConsoleLog } from "@/components/ConsoleLog";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShieldCheck, 
  Wallet, 
  ArrowRightLeft, 
  Search, 
  RefreshCw,
  Coins,
  CheckCircle,
  Undo2,
  Lock,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { 
    account, 
    logs, 
    isProcessing,
    connectWallet, 
    createOffer, 
    acceptOffer, 
    deposit, 
    markPaid, 
    release, 
    refund, 
    fetchEscrow,
    addLog
  } = useKadena();

  // Create Form State
  const [newOfferId, setNewOfferId] = useState("");
  const [newAmount, setNewAmount] = useState("1.0");
  const [newArbiter, setNewArbiter] = useState("");

  // Manage Form State
  const [searchId, setSearchId] = useState("");
  const [escrowState, setEscrowState] = useState<EscrowState | null>(null);
  const [isLoadingEscrow, setIsLoadingEscrow] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferId || !newAmount || !newArbiter) return;
    await createOffer(newOfferId, parseFloat(newAmount), newArbiter);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchId) return;
    
    setIsLoadingEscrow(true);
    const data = await fetchEscrow(searchId);
    if (data) {
      setEscrowState(data);
      addLog(`Fetched escrow: ${searchId}`, "success");
    } else {
      setEscrowState(null);
      addLog(`Escrow ${searchId} not found or error`, "error");
    }
    setIsLoadingEscrow(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background">
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">KadenaEscrow</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end text-xs text-muted-foreground mr-2">
               <span className="flex items-center gap-1">Network: <span className="text-foreground font-medium">{NETWORK_ID}</span></span>
               <span className="flex items-center gap-1">Chain: <span className="text-primary font-medium">{CHAIN_ID}</span></span>
             </div>
             {account ? (
               <div className="flex items-center gap-2 bg-secondary/50 border border-white/10 rounded-full px-4 py-1.5">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                 <span className="font-mono text-xs text-foreground/90">
                   {account.substring(0, 6)}...{account.substring(account.length - 4)}
                 </span>
               </div>
             ) : (
               <Button 
                 onClick={connectWallet}
                 className="btn-primary flex items-center gap-2"
               >
                 <Wallet className="w-4 h-4" />
                 Connect Wallet
               </Button>
             )}
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 pb-2">
            Trustless P2P Escrow
          </h1>
          <p className="text-lg text-muted-foreground">
            Securely exchange KDA without an intermediary. 
            Smart contract enforced custody on the Kadena blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN - ACTIONS */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Create Offer Card */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                   <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Create Offer</h2>
                  <p className="text-sm text-muted-foreground">Start a new escrow transaction (Wallet A)</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="offerId">Offer ID (Unique String)</Label>
                    <Input 
                      id="offerId" 
                      placeholder="e.g. trade-123" 
                      className="input-field font-mono"
                      value={newOfferId}
                      onChange={(e) => setNewOfferId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (KDA)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      step="0.1" 
                      placeholder="1.0" 
                      className="input-field font-mono"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arbiter">Arbiter Address (k:account)</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="arbiter" 
                      placeholder="k:..." 
                      className="input-field font-mono text-xs"
                      value={newArbiter}
                      onChange={(e) => setNewArbiter(e.target.value)}
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => account && setNewArbiter(account)}
                      className="shrink-0"
                      title="Use my address (for testing)"
                    >
                      Self
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground ml-1">
                    The arbiter can resolve disputes. Use your own address to test full flow.
                  </p>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={isProcessing || !account} 
                    className="w-full btn-primary"
                  >
                    {isProcessing ? "Processing..." : "Create On-Chain Offer"}
                  </Button>
                </div>
              </form>
            </motion.section>

            {/* Manage Offer Card */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-6 md:p-8"
            >
               <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                   <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Manage & Interact</h2>
                  <p className="text-sm text-muted-foreground">Check status and perform actions</p>
                </div>
              </div>

              <div className="flex gap-3 mb-8">
                <Input 
                  placeholder="Enter Offer ID..." 
                  className="input-field font-mono"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <Button 
                  onClick={() => handleSearch()}
                  disabled={isLoadingEscrow}
                  className="btn-secondary"
                >
                  {isLoadingEscrow ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {escrowState ? (
                  <motion.div 
                    key="details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 bg-black/20 rounded-xl p-5 border border-white/5"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground uppercase tracking-widest">Offer ID</div>
                        <div className="font-mono font-bold text-lg">{escrowState["offer-id"]}</div>
                      </div>
                      <StatusBadge status={escrowState.state} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Amount</span>
                        <span className="font-mono font-medium text-primary">{escrowState.amount} KDA</span>
                      </div>
                      <div className="md:col-span-2">
                         <span className="text-muted-foreground block text-xs mb-1">Creator</span>
                         <span className="font-mono text-xs text-foreground/80 break-all">{escrowState.creator}</span>
                      </div>
                      <div className="md:col-span-3">
                         <span className="text-muted-foreground block text-xs mb-1">Buyer</span>
                         <span className="font-mono text-xs text-foreground/80 break-all">
                           {escrowState.buyer || "(Waiting for buyer)"}
                         </span>
                      </div>
                    </div>

                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {escrowState.state === "CREATED" && (
                        <Button 
                          onClick={() => acceptOffer(escrowState["offer-id"])}
                          disabled={isProcessing}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                           Accept Offer (as Buyer)
                        </Button>
                      )}

                      {escrowState.state === "ACCEPTED" && (
                        <Button 
                          onClick={() => deposit(escrowState["offer-id"], escrowState.amount)}
                          disabled={isProcessing}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                           Deposit {escrowState.amount} KDA
                        </Button>
                      )}

                      {escrowState.state === "FUNDED" && (
                         <Button 
                           onClick={() => markPaid(escrowState["offer-id"])}
                           disabled={isProcessing}
                           className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                         >
                            Mark as Paid (Buyer)
                         </Button>
                      )}

                      {(escrowState.state === "FUNDED" || escrowState.state === "PAID") && (
                         <>
                           <Button 
                             onClick={() => release(escrowState["offer-id"])}
                             disabled={isProcessing}
                             className="w-full bg-green-600 hover:bg-green-700 text-white"
                           >
                              Release Funds (Seller/Arbiter)
                           </Button>
                           <Button 
                             onClick={() => refund(escrowState["offer-id"])}
                             disabled={isProcessing}
                             className="w-full bg-red-600 hover:bg-red-700 text-white"
                           >
                              Refund Buyer (Arbiter)
                           </Button>
                         </>
                      )}
                    </div>

                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground text-sm"
                  >
                    Enter an Offer ID to view status and available actions.
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </div>

          {/* RIGHT COLUMN - LOGS & INFO */}
          <div className="lg:col-span-5 space-y-8">
             <ConsoleLog logs={logs} />
             
             <div className="glass-card p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-accent" />
                  Testing Instructions
                </h3>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                   <p><strong className="text-foreground">1. Connect:</strong> Click the wallet button top-right. Ensure Chainweaver or eckoWALLET is open.</p>
                   <p><strong className="text-foreground">2. Create:</strong> Enter a unique ID (e.g. <code className="bg-black/20 px-1 rounded font-mono text-xs">test-{Math.floor(Math.random()*1000)}</code>) and amount.</p>
                   <p><strong className="text-foreground">3. Accept:</strong> Switch wallet account if possible, or use the same one. Search the ID and click Accept.</p>
                   <p><strong className="text-foreground">4. Deposit:</strong> The seller must lock funds. This requires signing a transfer capability.</p>
                   <p><strong className="text-foreground">5. Finalize:</strong> Buyer marks paid, then Seller/Arbiter releases funds.</p>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
