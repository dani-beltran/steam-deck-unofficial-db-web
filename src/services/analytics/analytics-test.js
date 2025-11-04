/**
 * Test file for analytics tracking
 * This file can be used to test analytics events in the browser console
 */

import {
  trackCustomEvent,
  trackGameSelect,
  trackSearch,
  trackSearchInput,
  trackSuggestionSelect,
} from '../src/services/analytics'

// Test functions - these can be called from browser console during development
window.testAnalytics = {
  // Test search tracking
  testSearch: () => {
    trackSearch('Portal 2', 'game_search', { search_source: 'test' })
    console.log('✅ Search event tracked: Portal 2')
  },

  // Test search input tracking
  testSearchInput: () => {
    trackSearchInput('Portal', 6, 'game_search_input')
    console.log('✅ Search input event tracked: Portal (length: 6)')
  },

  // Test suggestion selection
  testSuggestionSelect: () => {
    trackSuggestionSelect('Portal 2', 0, 'Portal')
    console.log('✅ Suggestion select event tracked: Portal 2 (index: 0)')
  },

  // Test game selection
  testGameSelect: () => {
    const mockGame = { id: 620, name: 'Portal 2' }
    trackGameSelect(mockGame, 'search_result')
    console.log('✅ Game select event tracked: Portal 2 (ID: 620)')
  },

  // Test custom event
  testCustomEvent: () => {
    trackCustomEvent('test_event', {
      category: 'testing',
      action: 'manual_test',
      value: 1,
    })
    console.log('✅ Custom event tracked: test_event')
  },

  // Run all tests
  runAllTests: () => {
    console.log('🧪 Running all analytics tests...')
    window.testAnalytics.testSearch()
    window.testAnalytics.testSearchInput()
    window.testAnalytics.testSuggestionSelect()
    window.testAnalytics.testGameSelect()
    window.testAnalytics.testCustomEvent()
    console.log('✅ All analytics tests completed!')
  },
}

console.log('📊 Analytics testing functions loaded!')
console.log('Use window.testAnalytics.runAllTests() to test all events')
console.log('Or use individual test methods like window.testAnalytics.testSearch()')
