<template>
  <div class="search-container">
    <div class="input-wrapper">
      <input 
        v-model="searchTerm" 
        type="text" 
        :placeholder="placeholder" 
        class="search-input"
        @input="handleInput"
        @keydown="handleKeyDown"
        @blur="handleBlur"
        @focus="handleFocus"
        autocomplete="off"
        spellcheck="false"
        :aria-label="loading ? 'Searching...' : 'Enter search term'"
        ref="searchInput"
      />
      <Button 
        @click="handleSearch" 
        variant="search" 
        size="large"
        :disabled="loading"
        :aria-label="loading ? 'Searching...' : 'Run the search'"
      >
        <Spinner 
          v-if="loading"
          class="search-icon" 
          :size="24"
        />
        <Search v-else class="search-icon" aria-hidden="true" />
      </Button>
    </div>
  </div>
</template>

<script>
import { Search } from 'lucide-vue-next'
import Button from '../base/Button.vue'
import Spinner from '../base/Spinner.vue'

export default {
  name: 'SearchBar',
  components: {
    Button,
    Search,
    Spinner,
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Enter search term...',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'search', 'input', 'keydown', 'blur', 'focus'],
  computed: {
    searchTerm: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
  },
  methods: {
    handleSearch() {
      // Hide mobile keyboard by blurring input
      if (this.$refs.searchInput) {
        this.$refs.searchInput.blur()
      }
      this.$emit('search', this.searchTerm)
    },

    handleInput() {
      this.$emit('input', this.searchTerm)
    },

    handleKeyDown(event) {
      this.$emit('keydown', event)
    },

    handleBlur(event) {
      this.$emit('blur', event)
    },

    handleFocus(event) {
      this.$emit('focus', event)
    },
  },
}
</script>

<style scoped>
.search-container {
  width: 100%;
  max-width: 600px;
}

.input-wrapper {
  display: flex;
  position: relative;
  box-shadow: var(--shadow-md);
  border-radius: 12px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 20px 24px;
  border: 2px solid var(--secondary-border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 1.1rem;
  outline: none;
  transition: all 0.2s ease;
  border-radius: 12px 0 0 12px;
  border-right: none;
  width: 100%;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-icon {
  width: 24px;
  height: 24px;
  color: white;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 768px) {
  .search-input {
    padding: 16px 20px;
  }
}
</style>