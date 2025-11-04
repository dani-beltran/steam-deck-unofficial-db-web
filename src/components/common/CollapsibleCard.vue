<template>
  <section :class="['collapsible-card', cardClass]" :aria-label="ariaLabel">
    <div class="collapsible-header">
      <h3 v-if="title">{{ title }}</h3>
      <slot name="header" v-if="!title"></slot>
      <button 
        class="collapse-toggle"
        @click="toggleCollapsed"
        :aria-expanded="!isCollapsed"
        :aria-label="toggleAriaLabel"
      >
        <svg 
          :class="['collapse-icon', { rotated: isCollapsed }]" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div v-show="!isCollapsed" class="collapsible-content">
      <slot></slot>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CollapsibleCard',
  props: {
    title: {
      type: String,
      default: null,
    },
    initiallyCollapsed: {
      type: Boolean,
      default: false,
    },
    cardClass: {
      type: String,
      default: '',
    },
    ariaLabel: {
      type: String,
      default: null,
    },
    toggleAriaLabel: {
      type: String,
      default: 'Toggle section visibility',
    },
  },
  data() {
    return {
      isCollapsed: this.initiallyCollapsed,
    }
  },
  methods: {
    toggleCollapsed() {
      this.isCollapsed = !this.isCollapsed
      this.$emit('toggle', this.isCollapsed)
    },
  },
}
</script>

<style scoped>
.collapsible-card {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.collapsible-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.collapsible-header h3 {
  margin: 0;
  color: #374151;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.collapse-toggle:hover {
  background: #f3f4f6;
  color: #374151;
}

.collapse-toggle:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.collapse-icon {
  transition: transform 0.2s ease;
}

.collapse-icon.rotated {
  transform: rotate(-90deg);
}

.collapsible-content {
  color: #4b5563;
  line-height: 1.6;
  font-size: 1rem;
}

/* Remove margin-bottom from header when collapsed */
.collapsible-card:has(.collapsible-content[style*="display: none"]) .collapsible-header {
  margin-bottom: 0;
}

/* Fallback for browsers that don't support :has() */
@supports not selector(:has(*)) {
  .collapsible-header {
    margin-bottom: 15px;
  }
}
</style>