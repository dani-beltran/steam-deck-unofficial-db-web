import { reactive, readonly } from 'vue'
import apiService from '../services/backend/apiService.js'

/**
 * User Store
 * Manages authenticated user state and prevents redundant API calls
 */
const state = reactive({
  user: null,
  loading: false,
  error: null,
  lastFetched: null,
})

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

/**
 * Fetch the authenticated user from the backend
 * Uses cached data if available and not expired
 * @param {boolean} forceRefresh - Force a fresh fetch even if cached data exists
 * @returns {Promise<Object|null>} The user data or null
 */
async function fetchUser(forceRefresh = false) {
  // Return cached user if available and not expired
  const now = Date.now()
  const cacheValid = state.lastFetched && (now - state.lastFetched) < CACHE_DURATION
  
  if (!forceRefresh && state.user && cacheValid) {
    return state.user
  }

  // Prevent duplicate simultaneous requests
  if (state.loading) {
    // Wait for the current request to complete
    return new Promise((resolve) => {
      const checkLoading = setInterval(() => {
        if (!state.loading) {
          clearInterval(checkLoading)
          resolve(state.user)
        }
      }, 100)
    })
  }

  state.loading = true
  state.error = null

  try {
    const user = await apiService.fetchAuthUser()
    state.user = user
    state.lastFetched = Date.now()
    return user
  } catch (error) {
    state.error = error.message || 'Failed to fetch user'
    console.error('Error in userStore.fetchUser:', error)
    return null
  } finally {
    state.loading = false
  }
}

/**
 * Clear the user from the store (e.g., on logout)
 */
function clearUser() {
  state.user = null
  state.lastFetched = null
  state.error = null
}

/**
 * Update the user data in the store
 * @param {Object} userData - The updated user data
 */
function setUser(userData) {
  state.user = userData
  state.lastFetched = Date.now()
}

/**
 * Get the current user from the store (synchronous)
 * @returns {Object|null} The cached user data or null
 */
function getUser() {
  return state.user
}

export default {
  state: readonly(state),
  fetchUser,
  clearUser,
  setUser,
  getUser,
}
