;; Simple test script to verify withdrawal functionality
;; This will test basic contract interactions locally

;; Test getting current signer data (should return default values)
(print "=== Testing sbtc-registry ===")
(print (contract-call? .sbtc-registry get-current-signer-data))

;; Test token balance (should be 0 initially) 
(print "=== Testing sbtc-token ===")
(print (contract-call? .sbtc-token get-balance tx-sender))
(print (contract-call? .sbtc-token get-total-supply))

;; Test withdrawal address validation
(print "=== Testing sbtc-withdrawal ===")
(let ((test-recipient { version: 0x00, hashbytes: 0x1234567890123456789012345678901234567890 }))
  (print (contract-call? .sbtc-withdrawal validate-recipient test-recipient))
)

(print "=== Contract tests completed ===")
