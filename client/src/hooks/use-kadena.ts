import { useState, useCallback, useEffect } from 'react';
import Pact from 'pact-lang-api';

export const NETWORK_ID = "mainnet01";
export const CHAIN_ID = "1";
export const API_HOST = `https://api.chainweb.com/chainweb/0.0/${NETWORK_ID}/chain/${CHAIN_ID}/pact`;
export const CONTRACT_NAME = "free.p2p-escrow"; // User can change this in UI if needed, defaulting for now

export interface EscrowState {
  "offer-id": string;
  creator: string;
  buyer: string;
  arbiter: string;
  amount: number;
  state: string; // "CREATED", "ACCEPTED", "FUNDED", "PAID", "COMPLETED", "REFUNDED"
}

export interface TransactionLog {
  id: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  reqKey?: string;
  timestamp: number;
}

export function useKadena() {
  const [account, setAccount] = useState<string | null>(null);
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to add logs
  const addLog = useCallback((message: string, status: 'pending' | 'success' | 'error' = 'pending', reqKey?: string) => {
    setLogs(prev => [{
      id: Math.random().toString(36).substring(7),
      message,
      status,
      reqKey,
      timestamp: Date.now()
    }, ...prev]);
  }, []);

  // Update a log entry status
  const updateLog = useCallback((reqKey: string, status: 'success' | 'error', message: string) => {
    setLogs(prev => prev.map(log => 
      log.reqKey === reqKey ? { ...log, status, message } : log
    ));
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.kadena || !window.kadena.isKadena) {
      addLog("Wallet not found. Please install Chainweaver, Zelcore, or eckoWALLET.", "error");
      return;
    }

    try {
      const res = await window.kadena.request({
        method: "kda_connect",
        networkId: NETWORK_ID,
      });
      
      if (res.status === 'success') {
        // eckoWALLET returns account object, others might vary. 
        // Requesting account details specifically usually preferred after connect.
        const accountRes = await window.kadena.request({
          method: "kda_requestAccount",
          networkId: NETWORK_ID,
        });

        if (accountRes.status === 'success' && accountRes.wallet.account) {
           setAccount(accountRes.wallet.account);
           addLog(`Connected to wallet: ${accountRes.wallet.account.substring(0, 8)}...`, "success");
        } else {
           // Fallback for some wallet versions
           setAccount("connected-wallet"); 
           addLog("Connected to wallet.", "success");
        }
      } else {
        addLog("Failed to connect wallet.", "error");
      }
    } catch (e: any) {
      addLog(`Connection error: ${e.message}`, "error");
    }
  }, [addLog]);

  // Generic function to send a command
  const sendCommand = useCallback(async (
    pactCode: string, 
    caps: any[] = [], 
    envData: any = {}, 
    sender: string = account || "",
    gasLimit: number = 2500,
    gasPrice: number = 0.0000001
  ) => {
    if (!account) {
      addLog("Please connect wallet first", "error");
      return null;
    }

    setIsProcessing(true);
    addLog("Building transaction...", "pending");

    const cmd = {
      pactCode,
      caps,
      envData,
      sender,
      chainId: CHAIN_ID,
      gasLimit,
      gasPrice,
      ttl: 28800,
      signingPubKey: account, // Hint for the wallet
      networkId: NETWORK_ID,
    };

    try {
      // 1. Sign
      const res = await window.kadena.request({
        method: "kda_requestSign",
        networkId: NETWORK_ID,
        signingCmd: cmd 
      });

      if (res.status !== "success") {
        throw new Error("Signing failed or rejected");
      }

      const signedCmd = res.signedCmd;

      // 2. Send
      addLog("Sending to blockchain...", "pending");
      const txRes = await Pact.wallet.sendSigned(signedCmd, API_HOST);
      
      const reqKey = txRes.requestKeys[0];
      addLog(`Transaction Sent! ReqKey: ${reqKey}`, "pending", reqKey);

      // 3. Listen (Poll)
      addLog(`Waiting for confirmation... (${reqKey})`, "pending", reqKey);
      
      // We implement a simple poll mechanism
      const poll = async () => {
         try {
           const pollRes = await Pact.fetch.poll({ requestKeys: [reqKey] }, API_HOST);
           if (pollRes[reqKey]) {
             const result = pollRes[reqKey];
             if (result.result.status === 'success') {
               updateLog(reqKey, "success", `Success: ${JSON.stringify(result.result.data)}`);
             } else {
               updateLog(reqKey, "error", `Failure: ${JSON.stringify(result.result.error.message)}`);
             }
             setIsProcessing(false);
           } else {
             // Keep polling
             setTimeout(poll, 2000);
           }
         } catch (e) {
           updateLog(reqKey, "error", "Polling error (check explorer)");
           setIsProcessing(false);
         }
      };
      
      setTimeout(poll, 2000);
      return reqKey;

    } catch (e: any) {
      addLog(`Transaction failed: ${e.message}`, "error");
      setIsProcessing(false);
      return null;
    }
  }, [account, addLog, updateLog]);


  // === SPECIFIC CONTRACT FUNCTIONS ===

  const createOffer = useCallback(async (offerId: string, amount: number, arbiter: string) => {
    const pactCode = `(${CONTRACT_NAME}.create-offer "${offerId}" "${account}" ${amount.toFixed(1)} "${arbiter}")`;
    // create-offer usually doesn't need special caps beyond gas
    return sendCommand(pactCode, [Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", [])]);
  }, [account, sendCommand]);

  const acceptOffer = useCallback(async (offerId: string) => {
    const pactCode = `(${CONTRACT_NAME}.accept-offer "${offerId}" "${account}")`;
    return sendCommand(pactCode, [Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", [])]);
  }, [account, sendCommand]);

  const deposit = useCallback(async (offerId: string, amount: number) => {
    const pactCode = `(${CONTRACT_NAME}.deposit "${offerId}")`;
    // Needs TRANSFER capability
    const caps = [
      Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", []),
      Pact.lang.mkCap("Transfer capability", "Transfer funds to escrow", "coin.TRANSFER", [account, "p2p-escrow-vault", amount])
    ];
    return sendCommand(pactCode, caps);
  }, [account, sendCommand]);

  const markPaid = useCallback(async (offerId: string) => {
    const pactCode = `(${CONTRACT_NAME}.mark-paid "${offerId}")`;
    return sendCommand(pactCode, [Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", [])]);
  }, [account, sendCommand]);

  const release = useCallback(async (offerId: string) => {
    const pactCode = `(${CONTRACT_NAME}.release "${offerId}")`;
    return sendCommand(pactCode, [Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", [])]);
  }, [account, sendCommand]);

  const refund = useCallback(async (offerId: string) => {
    const pactCode = `(${CONTRACT_NAME}.refund "${offerId}")`;
    return sendCommand(pactCode, [Pact.lang.mkCap("Gas capability", "Pay gas", "coin.GAS", [])]);
  }, [account, sendCommand]);

  const fetchEscrow = useCallback(async (offerId: string): Promise<EscrowState | null> => {
    try {
      const response = await Pact.fetch.local({
        pactCode: `(${CONTRACT_NAME}.get-escrow "${offerId}")`,
        meta: Pact.lang.mkMeta(
          account || "", 
          CHAIN_ID, 
          0.0000001, 
          150000, 
          Math.floor(Date.now() / 1000), 
          28800
        ),
      }, API_HOST);

      if (response.result.status === "success") {
        return response.result.data as EscrowState;
      } else {
        throw new Error(JSON.stringify(response.result.error));
      }
    } catch (e: any) {
      console.error("Fetch failed", e);
      return null;
    }
  }, [account]);

  return {
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
  };
}

// Add types for window.kadena
declare global {
  interface Window {
    kadena?: {
      isKadena: boolean;
      request: (args: any) => Promise<any>;
    };
  }
}
