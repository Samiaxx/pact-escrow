(module p2p-escrow GOVERNANCE

  ;; --------------------------------------------------------------------------
  ;; Schemas and Tables
  ;; --------------------------------------------------------------------------

  (defschema escrow-schema
    id:string
    creator:string
    buyer:string
    arbiter:string
    amount:decimal
    state:string
    ;; States: "CREATED", "ACCEPTED", "FUNDED", "PAID", "COMPLETED", "REFUNDED"
  )

  (deftable escrows:{escrow-schema})

  ;; --------------------------------------------------------------------------
  ;; Capabilities & Constants
  ;; --------------------------------------------------------------------------

  (defcap GOVERNANCE ()
    (enforce-guard (read-keyset "admin-keyset")))

  (defcap ESCROW-Owner (id:string)
    (with-read escrows id { "creator" := creator }
      (enforce-guard (read-keyset creator))))

  (defconst ESCROW_ACCOUNT "p2p-escrow-vault")

  ;; --------------------------------------------------------------------------
  ;; Functions
  ;; --------------------------------------------------------------------------

  (defun create-offer (id:string creator:string amount:decimal arbiter:string)
    "Creator opens a new offer. State -> CREATED"
    (insert escrows id
      { "id": id
      , "creator": creator
      , "buyer": ""
      , "arbiter": arbiter
      , "amount": amount
      , "state": "CREATED"
      })
  )

  (defun accept-offer (id:string buyer:string)
    "Buyer accepts the offer. State -> ACCEPTED"
    (with-read escrows id { "state" := state }
      (enforce (= state "CREATED") "Offer is not in CREATED state")
      (update escrows id
        { "buyer": buyer
        , "state": "ACCEPTED"
        })
    )
  )

  (defun deposit (id:string)
    "Creator deposits KDA into the contract. State -> FUNDED"
    (with-read escrows id
      { "creator" := creator
      , "amount" := amount
      , "state" := state
      }
      (enforce (= state "ACCEPTED") "Offer must be ACCEPTED before deposit")
      
      ;; Transfer KDA from Creator to Contract
      (coin.transfer creator ESCROW_ACCOUNT amount)
      
      (update escrows id
        { "state": "FUNDED" })
    )
  )

  (defun mark-paid (id:string)
    "Buyer marks that they have paid off-chain. State -> PAID"
    (with-read escrows id { "state" := state, "buyer" := buyer }
      (enforce (= state "FUNDED") "Escrow must be FUNDED")
      ;; In a real app, enforce buyer signature here
      (update escrows id { "state": "PAID" })
    )
  )

  (defun release (id:string)
    "Releases KDA to the Buyer. Can be called by Creator or Arbiter. State -> COMPLETED"
    (with-read escrows id
      { "creator" := creator
      , "buyer" := buyer
      , "arbiter" := arbiter
      , "amount" := amount
      , "state" := state
      }
      (enforce (or (= state "PAID") (= state "FUNDED")) "Invalid state for release")
      
      ;; Logic to verify sender is Creator or Arbiter would go here in a production guard
      ;; For this PoC, we assume the transaction is signed by one of them
      
      (coin.transfer ESCROW_ACCOUNT buyer amount)
      
      (update escrows id { "state": "COMPLETED" })
    )
  )

  (defun refund (id:string)
    "Refunds KDA to the Creator. Can be called by Arbiter. State -> REFUNDED"
    (with-read escrows id
      { "creator" := creator
      , "amount" := amount
      , "state" := state
      }
      (enforce (or (= state "PAID") (= state "FUNDED")) "Invalid state for refund")
      
      (coin.transfer ESCROW_ACCOUNT creator amount)
      
      (update escrows id { "state": "REFUNDED" })
    )
  )

  (defun get-escrow (id:string)
    (read escrows id)
  )
)

;; Create the escrow account
(coin.create-account "p2p-escrow-vault" (create-user-guard (p2p-escrow.release)))
