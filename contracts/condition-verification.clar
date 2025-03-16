;; Condition Verification Contract - Simplified
;; Validates the quality of listed books

;; Define data maps
(define-map conditions
  { condition-id: uint }
  {
    name: (string-ascii 20),
    description: (string-ascii 100)
  }
)

;; Define data maps
(define-map book-conditions
  { book-id: uint }
  {
    condition-id: uint,
    verifier: (optional principal),
    verified: bool,
    verification-date: (optional uint),
    notes: (optional (string-utf8 200))
  }
)

;; Initialize standard conditions
(begin
  (map-set conditions { condition-id: u1 } { name: "Like New", description: "Appears new and unread" })
  (map-set conditions { condition-id: u2 } { name: "Very Good", description: "Minimal signs of wear" })
  (map-set conditions { condition-id: u3 } { name: "Good", description: "Some signs of wear" })
  (map-set conditions { condition-id: u4 } { name: "Fair", description: "Significant wear" })
  (map-set conditions { condition-id: u5 } { name: "Poor", description: "Heavy wear, may have damage" })
)

;; Define public functions
(define-public (verify-book-condition
                (book-id uint)
                (condition-id uint)
                (notes (optional (string-utf8 200))))
  (begin
    ;; Only authorized verifiers can verify books
    (asserts! (is-authorized-verifier tx-sender) (err u1))

    ;; Ensure the condition exists
    (asserts! (is-some (map-get? conditions { condition-id: condition-id })) (err u2))

    (map-set book-conditions
      { book-id: book-id }
      {
        condition-id: condition-id,
        verifier: (some tx-sender),
        verified: true,
        verification-date: (some block-height),
        notes: notes
      }
    )
    (ok true)
  )
)

(define-public (self-report-condition
                (book-id uint)
                (condition-id uint))
  (begin
    ;; Ensure the condition exists
    (asserts! (is-some (map-get? conditions { condition-id: condition-id })) (err u2))

    ;; Check if the book exists and user is the owner (would call book-registration contract)
    ;; For simplicity, we're not implementing the cross-contract call here

    (map-set book-conditions
      { book-id: book-id }
      {
        condition-id: condition-id,
        verifier: none,
        verified: false,
        verification-date: none,
        notes: none
      }
    )
    (ok true)
  )
)

;; Get condition details
(define-read-only (get-condition (condition-id uint))
  (map-get? conditions { condition-id: condition-id })
)

(define-read-only (get-book-condition (book-id uint))
  (map-get? book-conditions { book-id: book-id })
)

;; Verify if condition ID is valid
(define-read-only (is-valid-condition (condition-id uint))
  (is-some (map-get? conditions { condition-id: condition-id }))
)

(define-read-only (is-authorized-verifier (address principal))
  ;; In a real implementation, this would check against a list of authorized verifiers
  ;; For simplicity, we're returning true for all
  true
)

