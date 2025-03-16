;; Reputation System Contract - Simplified
;; Tracks reliability of participants

;; Define data maps
(define-map user-ratings
  { user: principal }
  {
    total-score: uint,
    rating-count: uint
  }
)

(define-map user-feedback
  { exchange-id: uint, reviewer: principal }
  {
    reviewee: principal,
    rating: uint, ;; 1-5
    comment: (string-ascii 200)
  }
)

;; Leave feedback for a user
(define-public (leave-feedback
                (exchange-id uint)
                (reviewee principal)
                (rating uint)
                (comment (string-ascii 200)))
  (begin
    ;; Ensure rating is between 1 and 5
    (asserts! (and (>= rating u1) (<= rating u5)) (err u1))

    ;; Record the feedback
    (map-set user-feedback
      { exchange-id: exchange-id, reviewer: tx-sender }
      {
        reviewee: reviewee,
        rating: rating,
        comment: comment
      }
    )

    ;; Update the user's rating
    (let (
      (current-rating (default-to { total-score: u0, rating-count: u0 }
                      (map-get? user-ratings { user: reviewee })))
      (new-total (+ (get total-score current-rating) rating))
      (new-count (+ (get rating-count current-rating) u1))
    )
      (map-set user-ratings
        { user: reviewee }
        {
          total-score: new-total,
          rating-count: new-count
        }
      )
    )

    (ok true)
  )
)

;; Get user rating
(define-read-only (get-user-rating (user principal))
  (default-to { total-score: u0, rating-count: u0 }
              (map-get? user-ratings { user: user }))
)

;; Get feedback for an exchange
(define-read-only (get-feedback (exchange-id uint) (reviewer principal))
  (map-get? user-feedback { exchange-id: exchange-id, reviewer: reviewer })
)

;; Calculate average rating (returns value multiplied by 100 for precision)
(define-read-only (get-average-rating (user principal))
  (let (
    (rating (get-user-rating user))
    (total (get total-score rating))
    (count (get rating-count rating))
  )
    (if (> count u0)
      (/ (* total u100) count)
      u0
    )
  )
)

