import { describe, it, expect, beforeEach } from "vitest"

// Mock the Clarity VM environment
const mockClarity = {
  tx: {
    sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  },
  block: {
    height: 100,
  },
}

// Mock the contract functions
const conditionVerificationContract = {
  conditions: new Map([
    [1, { name: "Like New", description: "Appears new and unread with no visible wear" }],
    [2, { name: "Very Good", description: "Shows minimal signs of wear, no highlighting or notes" }],
    [3, { name: "Good", description: "Shows some signs of wear, may have limited notes/highlighting" }],
    [4, { name: "Fair", description: "Shows significant wear, may have extensive notes/highlighting" }],
    [5, { name: "Poor", description: "Significant wear, possible loose binding or damaged pages" }],
  ]),
  
  bookConditions: new Map(),
  
  verifyBookCondition(bookId, conditionId, notes) {
    // Check if the condition exists
    if (!this.conditions.has(conditionId)) {
      return { error: 2 }
    }
    
    // In a real implementation, we would check if the sender is an authorized verifier
    
    this.bookConditions.set(bookId, {
      conditionId,
      verifier: mockClarity.tx.sender,
      verified: true,
      verificationDate: mockClarity.block.height,
      notes: notes || null,
    })
    
    return { value: true }
  },
  
  selfReportCondition(bookId, conditionId) {
    // Check if the condition exists
    if (!this.conditions.has(conditionId)) {
      return { error: 2 }
    }
    
    this.bookConditions.set(bookId, {
      conditionId,
      verifier: null,
      verified: false,
      verificationDate: null,
      notes: null,
    })
    
    return { value: true }
  },
  
  getCondition(conditionId) {
    return this.conditions.get(conditionId) || null
  },
  
  getBookCondition(bookId) {
    return this.bookConditions.get(bookId) || null
  },
  
  isAuthorizedVerifier(address) {
    // For simplicity, we're returning true for all addresses
    return true
  },
}

describe("Condition Verification Contract", () => {
  beforeEach(() => {
    // Reset the contract state before each test
    conditionVerificationContract.bookConditions = new Map()
    mockClarity.block.height = 100
  })
  
  it("should have predefined conditions", () => {
    expect(conditionVerificationContract.conditions.size).toBe(5)
    
    const likeNew = conditionVerificationContract.getCondition(1)
    expect(likeNew).not.toBeNull()
    expect(likeNew.name).toBe("Like New")
    
    const poor = conditionVerificationContract.getCondition(5)
    expect(poor).not.toBeNull()
    expect(poor.name).toBe("Poor")
  })
  
  it("should allow verifiers to verify book conditions", () => {
    const result = conditionVerificationContract.verifyBookCondition(
        1, // bookId
        2, // conditionId (Very Good)
        "Minor wear on cover, otherwise excellent",
    )
    
    expect(result.value).toBe(true)
    
    const bookCondition = conditionVerificationContract.getBookCondition(1)
    expect(bookCondition).not.toBeNull()
    expect(bookCondition.conditionId).toBe(2)
    expect(bookCondition.verifier).toBe(mockClarity.tx.sender)
    expect(bookCondition.verified).toBe(true)
    expect(bookCondition.verificationDate).toBe(100)
    expect(bookCondition.notes).toBe("Minor wear on cover, otherwise excellent")
  })
  
  it("should allow users to self-report book conditions", () => {
    const result = conditionVerificationContract.selfReportCondition(
        1, // bookId
        3, // conditionId (Good)
    )
    
    expect(result.value).toBe(true)
    
    const bookCondition = conditionVerificationContract.getBookCondition(1)
    expect(bookCondition).not.toBeNull()
    expect(bookCondition.conditionId).toBe(3)
    expect(bookCondition.verifier).toBeNull()
    expect(bookCondition.verified).toBe(false)
    expect(bookCondition.verificationDate).toBeNull()
    expect(bookCondition.notes).toBeNull()
  })
  
  it("should reject invalid condition IDs", () => {
    const result = conditionVerificationContract.verifyBookCondition(
        1, // bookId
        99, // Invalid conditionId
        null,
    )
    
    expect(result.error).toBe(2)
  })
  
  it("should allow updating a book condition", () => {
    // First set the condition
    conditionVerificationContract.selfReportCondition(1, 3)
    
    // Then update it
    const result = conditionVerificationContract.verifyBookCondition(
        1, // bookId
        2, // conditionId (Very Good)
        "Verified as better than reported",
    )
    
    expect(result.value).toBe(true)
    
    const bookCondition = conditionVerificationContract.getBookCondition(1)
    expect(bookCondition.conditionId).toBe(2)
    expect(bookCondition.verified).toBe(true)
  })
})

