import { describe, it, expect, beforeEach } from "vitest"

// Mock the Clarity VM environment
const mockClarity = {
  tx: {
    sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  },
}

// Mock the contract functions
const bookRegistrationContract = {
  lastBookId: 0,
  books: new Map(),
  
  registerBook(title, author, isbn, condition, price) {
    const bookId = this.lastBookId + 1
    this.lastBookId = bookId
    
    this.books.set(bookId, {
      title,
      author,
      isbn,
      owner: mockClarity.tx.sender,
      condition,
      price,
      available: true,
    })
    
    return { value: bookId }
  },
  
  updateAvailability(bookId, available) {
    if (!this.books.has(bookId)) {
      return { error: 1 }
    }
    
    const book = this.books.get(bookId)
    if (book.owner !== mockClarity.tx.sender) {
      return { error: 2 }
    }
    
    book.available = available
    this.books.set(bookId, book)
    return { value: true }
  },
  
  updatePrice(bookId, newPrice) {
    if (!this.books.has(bookId)) {
      return { error: 1 }
    }
    
    const book = this.books.get(bookId)
    if (book.owner !== mockClarity.tx.sender) {
      return { error: 2 }
    }
    
    book.price = newPrice
    this.books.set(bookId, book)
    return { value: true }
  },
  
  getBook(bookId) {
    return this.books.get(bookId) || null
  },
  
  getLastBookId() {
    return this.lastBookId
  },
}

describe("Book Registration Contract", () => {
  beforeEach(() => {
    // Reset the contract state before each test
    bookRegistrationContract.lastBookId = 0
    bookRegistrationContract.books = new Map()
  })
  
  it("should register a new book", () => {
    const result = bookRegistrationContract.registerBook(
        "Introduction to Computer Science",
        "John Smith",
        "978-1234567890",
        2,
        25,
    )
    
    expect(result.value).toBe(1)
    expect(bookRegistrationContract.getLastBookId()).toBe(1)
    
    const book = bookRegistrationContract.getBook(1)
    expect(book).not.toBeNull()
    expect(book.title).toBe("Introduction to Computer Science")
    expect(book.author).toBe("John Smith")
    expect(book.isbn).toBe("978-1234567890")
    expect(book.owner).toBe(mockClarity.tx.sender)
    expect(book.condition).toBe(2)
    expect(book.price).toBe(25)
    expect(book.available).toBe(true)
  })
  
  it("should update book availability", () => {
    // First register a book
    bookRegistrationContract.registerBook("Introduction to Computer Science", "John Smith", "978-1234567890", 2, 25)
    
    // Update availability to false
    const result = bookRegistrationContract.updateAvailability(1, false)
    expect(result.value).toBe(true)
    
    const book = bookRegistrationContract.getBook(1)
    expect(book.available).toBe(false)
  })
  
  it("should update book price", () => {
    // First register a book
    bookRegistrationContract.registerBook("Introduction to Computer Science", "John Smith", "978-1234567890", 2, 25)
    
    // Update price to 30
    const result = bookRegistrationContract.updatePrice(1, 30)
    expect(result.value).toBe(true)
    
    const book = bookRegistrationContract.getBook(1)
    expect(book.price).toBe(30)
  })
})

