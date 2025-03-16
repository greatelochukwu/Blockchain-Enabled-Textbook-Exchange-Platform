import { describe, it, expect, beforeEach } from "vitest"

// Mock the Clarity VM environment
const mockClarity = {
  tx: {
    sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Default sender (buyer)
  },
  block: {
    height: 100,
  },
}

// Mock seller address
const SELLER_ADDRESS = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"

// Mock the contract functions
const exchangeMatchingContract = {
  lastExchangeId: 0,
  exchanges: new Map(),
  
  createExchange(bookId, seller, price) {
    const exchangeId = this.lastExchangeId + 1
    this.lastExchangeId = exchangeId
    
    this.exchanges.set(exchangeId, {
      bookId,
      seller,
      buyer: mockClarity.tx.sender,
      price,
      status: "pending",
      createdAt: mockClarity.block.height,
    })
    
    return { value: exchangeId }
  },
  
  acceptExchange(exchangeId) {
    if (!this.exchanges.has(exchangeId)) {
      return { error: 1 }
    }
    
    const exchange = this.exchanges.get(exchangeId)
    
    if (exchange.seller !== mockClarity.tx.sender) {
      return { error: 2 }
    }
    
    exchange.status = "accepted"
    this.exchanges.set(exchangeId, exchange)
    
    return { value: true }
  },
  
  completeExchange(exchangeId) {
    if (!this.exchanges.has(exchangeId)) {
      return { error: 1 }
    }
    
    const exchange = this.exchanges.get(exchangeId)
    
    if (exchange.buyer !== mockClarity.tx.sender && exchange.seller !== mockClarity.tx.sender) {
      return { error: 2 }
    }
    
    exchange.status = "completed"
    this.exchanges.set(exchangeId, exchange)
    
    return { value: true }
  },
  
  getExchange(exchangeId) {
    return this.exchanges.get(exchangeId) || null
  },
}

describe("Exchange Matching Contract", () => {
  beforeEach(() => {
    // Reset the contract state before each test
    exchangeMatchingContract.lastExchangeId = 0
    exchangeMatchingContract.exchanges = new Map()
    mockClarity.block.height = 100
    mockClarity.tx.sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" // Reset to buyer
  })
  
  it("should create an exchange", () => {
    const result = exchangeMatchingContract.createExchange(1, SELLER_ADDRESS, 25)
    
    expect(result.value).toBe(1)
    
    const exchange = exchangeMatchingContract.getExchange(1)
    expect(exchange).not.toBeNull()
    expect(exchange.bookId).toBe(1)
    expect(exchange.seller).toBe(SELLER_ADDRESS)
    expect(exchange.buyer).toBe(mockClarity.tx.sender)
    expect(exchange.price).toBe(25)
    expect(exchange.status).toBe("pending")
    expect(exchange.createdAt).toBe(100)
  })
  
  it("should allow a seller to accept an exchange", () => {
    // First create an exchange
    exchangeMatchingContract.createExchange(1, SELLER_ADDRESS, 25)
    
    // Switch to seller
    mockClarity.tx.sender = SELLER_ADDRESS
    
    // Accept the exchange
    const result = exchangeMatchingContract.acceptExchange(1)
    
    expect(result.value).toBe(true)
    
    const exchange = exchangeMatchingContract.getExchange(1)
    expect(exchange.status).toBe("accepted")
  })
  
  it("should allow participants to complete an exchange", () => {
    // Create an exchange
    exchangeMatchingContract.createExchange(1, SELLER_ADDRESS, 25)
    
    // Accept as the seller
    mockClarity.tx.sender = SELLER_ADDRESS
    exchangeMatchingContract.acceptExchange(1)
    
    // Complete as the buyer
    mockClarity.tx.sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    
    const result = exchangeMatchingContract.completeExchange(1)
    expect(result.value).toBe(true)
    
    const exchange = exchangeMatchingContract.getExchange(1)
    expect(exchange.status).toBe("completed")
  })
})

