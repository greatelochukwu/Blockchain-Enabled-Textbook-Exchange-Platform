;; Exchange Matching Contract - Simplified
;; Pairs students with needed textbooks

;; Define data variables
(define-data-var last-exchange-id uint u0)

;; Define data maps
(define-map exchanges
  { exchange-id: uint }
  {
    book-id: uint,
    seller: principal,
    buyer: principal,
    price: uint,
    status: (string-ascii 20), ;; "pending", "accepted", "completed", "cancelled"
    created-at: uint
  }
)

;; Create a new exchange request
(define-public (create-exchange (book-id uint) (seller principal) (price uint))
  (let ((exchange-id (+ (var-get last-exchange-id) u1)))
    (begin
      (var-set last-exchange-id exchange-id)
      (map-set exchanges
        { exchange-id: exchange-id }
        {
          book-id: book-id,
          seller: seller,
          buyer: tx-sender,
          price: price,
          status: "pending",
          created-at: block-height
        }
      )
      (ok exchange-id)
    )
  )
)

;; Accept an exchange request
(define-public (accept-exchange (exchange-id uint))
  (let ((exchange (unwrap! (map-get? exchanges { exchange-id: exchange-id }) (err u1))))
    (if (is-eq tx-sender (get seller exchange))
      (begin
        (map-set exchanges
          { exchange-id: exchange-id }
          (merge exchange { status: "accepted" })
        )
        (ok true)
      )
      (err u2) ;; Not the seller
    )
  )
)

;; Complete an exchange
(define-public (complete-exchange (exchange-id uint))
  (let ((exchange (unwrap! (map-get? exchanges { exchange-id: exchange-id }) (err u1))))
    (if (or (is-eq tx-sender (get buyer exchange)) (is-eq tx-sender (get seller exchange)))
      (begin
        (map-set exchanges
          { exchange-id: exchange-id }
          (merge exchange { status: "completed" })
        )
        (ok true)
      )
      (err u2) ;; Not a participant
    )
  )
)

;; Cancel an exchange
(define-public (cancel-exchange (exchange-id uint))
  (let ((exchange (unwrap! (map-get? exchanges { exchange-id: exchange-id }) (err u1))))
    (if (or (is-eq tx-sender (get buyer exchange)) (is-eq tx-sender (get seller exchange)))
      (begin
        (map-set exchanges
          { exchange-id: exchange-id }
          (merge exchange { status: "cancelled" })
        )
        (ok true)
      )
      (err u2) ;; Not a participant
    )
  )
)

;; Get exchange details
(define-read-only (get-exchange (exchange-id uint))
  (map-get? exchanges { exchange-id: exchange-id })
)

;; Get last exchange ID
(define-read-only (get-last-exchange-id)
  (var-get last-exchange-id)
)

