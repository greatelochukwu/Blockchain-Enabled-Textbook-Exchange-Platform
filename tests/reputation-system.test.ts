import { describe, it, expect, beforeEach } from "vitest"

// Mock the Clarity VM environment
const mockClarity = {
  tx: {
    sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", // Default sender (reviewer)
  },
}

// Mock reviewee address
const REVIEWEE_ADDRESS = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"

// Mock the contract functions
const reputationSystemContract = {
  userRatings: new Map(),
  userFeedback: new Map(),
  
  leaveFeedback(exchangeId, reviewee, rating, comment) {
    // Ensure rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return { error: 1 }
    }
    
    // Record the feedback
    const feedbackKey = `${exchangeId}-${mockClarity.tx.sender}`
    this.userFeedback.set(feedbackKey, {
      reviewee,
      rating,
      comment,
    })
    
    // Update the user's rating
    const currentRating = this.userRatings.get(reviewee) || {
      totalScore: 0,
      ratingCount: 0,
    }
    
    const newTotal = currentRating.totalScore + rating
    const newCount = currentRating.ratingCount + 1
    
    this.userRatings.set(reviewee, {
      totalScore: newTotal,
      ratingCount: newCount,
    })
    
    return { value: true }
  },
  
  getUserRating(user) {
    return (
        this.userRatings.get(user) || {
          totalScore: 0,
          ratingCount: 0,
        }
    )
  },
  
  getFeedback(exchangeId, reviewer) {
    const feedbackKey = `${exchangeId}-${reviewer}`
    return this.userFeedback.get(feedbackKey) || null
  },
  
  getAverageRating(user) {
    const rating = this.getUserRating(user)
    if (rating.ratingCount === 0) {
      return 0
    }
    return Math.floor((rating.totalScore * 100) / rating.ratingCount)
  },
}

describe("Reputation System Contract", () => {
  beforeEach(() => {
    // Reset the contract state before each test
    reputationSystemContract.userRatings = new Map()
    reputationSystemContract.userFeedback = new Map()
    mockClarity.tx.sender = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM" // Reset to reviewer
  })
  
  it("should allow users to leave feedback", () => {
    const result = reputationSystemContract.leaveFeedback(
        1, // exchangeId
        REVIEWEE_ADDRESS,
        5, // rating
        "Excellent seller, book was in perfect condition",
    )
    
    expect(result.value).toBe(true)
    
    const feedback = reputationSystemContract.getFeedback(1, mockClarity.tx.sender)
    expect(feedback).not.toBeNull()
    expect(feedback.reviewee).toBe(REVIEWEE_ADDRESS)
    expect(feedback.rating).toBe(5)
    expect(feedback.comment).toBe("Excellent seller, book was in perfect condition")
  })
  
  it("should update user rating when feedback is left", () => {
    reputationSystemContract.leaveFeedback(
        1, // exchangeId
        REVIEWEE_ADDRESS,
        5, // rating
        "Excellent seller",
    )
    
    let rating = reputationSystemContract.getUserRating(REVIEWEE_ADDRESS)
    expect(rating.totalScore).toBe(5)
    expect(rating.ratingCount).toBe(1)
    
    // Leave another feedback
    reputationSystemContract.leaveFeedback(
        2, // exchangeId
        REVIEWEE_ADDRESS,
        4, // rating
        "Good seller",
    )
    
    rating = reputationSystemContract.getUserRating(REVIEWEE_ADDRESS)
    expect(rating.totalScore).toBe(9)
    expect(rating.ratingCount).toBe(2)
    
    // Check average rating
    const avgRating = reputationSystemContract.getAverageRating(REVIEWEE_ADDRESS)
    expect(avgRating).toBe(450) // 4.50
  })
  
  it("should reject invalid ratings", () => {
    // Try with rating = 0
    let result = reputationSystemContract.leaveFeedback(
        1, // exchangeId
        REVIEWEE_ADDRESS,
        0, // Invalid rating
        "Invalid rating",
    )
    
    expect(result.error).toBe(1)
    
    // Try with rating = 6
    result = reputationSystemContract.leaveFeedback(
        1, // exchangeId
        REVIEWEE_ADDRESS,
        6, // Invalid rating
        "Invalid rating",
    )
    
    expect(result.error).toBe(1)
  })
})

