;; Book Registration Contract - Simplified
;; Records details of available textbooks

;; Define data variables
(define-data-var last-book-id uint u0)

;; Define data maps
(define-map books
  { book-id: uint }
  {
    title: (string-ascii 100),
    author: (string-ascii 100),
    isbn: (string-ascii 20),
    owner: principal,
    condition: uint,
    price: uint,
    available: bool
  }
)

;; Register a new book
(define-public (register-book
                (title (string-ascii 100))
                (author (string-ascii 100))
                (isbn (string-ascii 20))
                (condition uint)
                (price uint))
  (let ((book-id (+ (var-get last-book-id) u1)))
    (begin
      (var-set last-book-id book-id)
      (map-set books
        { book-id: book-id }
        {
          title: title,
          author: author,
          isbn: isbn,
          owner: tx-sender,
          condition: condition,
          price: price,
          available: true
        }
      )
      (ok book-id)
    )
  )
)

;; Update book availability
(define-public (update-availability (book-id uint) (available bool))
  (let ((book-data (unwrap! (map-get? books { book-id: book-id }) (err u1))))
    (if (is-eq tx-sender (get owner book-data))
      (begin
        (map-set books
          { book-id: book-id }
          (merge book-data { available: available })
        )
        (ok true)
      )
      (err u2) ;; Not the owner
    )
  )
)

;; Update book price
(define-public (update-price (book-id uint) (new-price uint))
  (let ((book-data (unwrap! (map-get? books { book-id: book-id }) (err u1))))
    (if (is-eq tx-sender (get owner book-data))
      (begin
        (map-set books
          { book-id: book-id }
          (merge book-data { price: new-price })
        )
        (ok true)
      )
      (err u2) ;; Not the owner
    )
  )
)

;; Get book details
(define-read-only (get-book (book-id uint))
  (map-get? books { book-id: book-id })
)

;; Get last book ID
(define-read-only (get-last-book-id)
  (var-get last-book-id)
)

