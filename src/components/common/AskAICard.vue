<template>
  <section :class="['ask-ai-card', cardClass]" :aria-label="title">
    <div class="ask-ai-header">
      <h3 v-if="title">{{ title }}</h3>
      <slot name="header" v-if="!title"></slot>
      <button
        v-if="isCollapsed"
        class="ask-ai-button"
        @click="toggleCollapsed"
        :aria-expanded="!isCollapsed"
        :aria-label="buttonLabel"
      >
        <Sparkles class="ask-ai-icon sparkle-animate" />
        <span>{{ buttonLabel }}</span>
      </button>
    </div>
    <ExpandTransition
      :show="!isCollapsed"
      content-class="ai-content"
    >
      <slot></slot>
    </ExpandTransition>
  </section>
</template>

<script>
import { Sparkles } from 'lucide-vue-next'
import ExpandTransition from '../base/ExpandTransition.vue'

export default {
  name: 'AskAICard',
  components: {
    Sparkles,
    ExpandTransition,
  },
  props: {
    title: {
      type: String,
      default: null,
    },
    cardClass: {
      type: String,
      default: '',
    },
    buttonLabel: {
      type: String,
      default: 'Ask AI',
    },
  },
  data() {
    return {
      isCollapsed: true, // Starts closed
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
.ask-ai-card {
  margin-bottom: 30px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--secondary-border-color);
  border-radius: 12px;
}

.ask-ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.ask-ai-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ask-ai-button {
  background: linear-gradient(135deg, #8B5CF6, #A855F7);
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
}

.ask-ai-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.sparkle-animate {
  animation: sparkle-pulse 2s ease-in-out infinite;
}

@keyframes sparkle-pulse {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(5deg);
  }
  50% {
    transform: scale(1.05) rotate(-5deg);
  }
  75% {
    transform: scale(1.1) rotate(5deg);
  }
}

.ask-ai-button:hover {
  background: linear-gradient(135deg, #7C3AED, #9333EA);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
}

.ask-ai-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
}

.ask-ai-button:focus {
  outline: 2px solid #A855F7;
  outline-offset: 2px;
}

.ask-ai-close-button {
  background: transparent;
  border: 1px solid var(--secondary-border-color);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ask-ai-close-button:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--primary-border-color);
  transform: translateY(-1px);
}

.ask-ai-close-button:active {
  transform: translateY(0);
}

.ask-ai-close-button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.ai-content {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 1rem;
}

/* Remove margin-bottom from header when collapsed */
.ask-ai-card:has(.expand-content[style*="display: none"]) .ask-ai-header {
  margin-bottom: 0;
}

/* Fallback for browsers that don't support :has() */
@supports not selector(:has(*)) {
  .ask-ai-header {
    margin-bottom: 15px;
  }
}
</style>