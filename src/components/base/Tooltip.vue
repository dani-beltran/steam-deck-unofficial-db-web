<template>
  <div class="tooltip-wrapper" :class="wrapperClass">
    <slot></slot>
    <span v-if="text" class="tooltip-content" :class="position">
      {{ text }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'Tooltip',
  props: {
    text: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      default: 'top',
      validator: (value) =>
        [
          'top',
          'bottom',
          'left',
          'right',
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
        ].includes(value),
    },
    wrapperClass: {
      type: String,
      default: '',
    },
  },
}
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
  cursor: help;
}

.tooltip-content {
  position: absolute;
  background: rgba(31, 41, 55, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  text-transform: none;
  letter-spacing: normal;
  transform: scale(0.95);
}

/* Top position (default) */
.tooltip-content.top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) scale(0.95);
}

.tooltip-content.top::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(31, 41, 55, 0.95);
}

/* Bottom position */
.tooltip-content.bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) scale(0.95);
}

.tooltip-content.bottom::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-bottom-color: rgba(31, 41, 55, 0.95);
}

/* Left position */
.tooltip-content.left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%) scale(0.95);
}

.tooltip-content.left::after {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-left-color: rgba(31, 41, 55, 0.95);
}

/* Right position */
.tooltip-content.right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%) scale(0.95);
}

.tooltip-content.right::after {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: rgba(31, 41, 55, 0.95);
}

/* Top-Left position */
.tooltip-content.top-left {
  bottom: calc(100% + 8px);
  right: 0;
  transform: scale(0.95);
}

.tooltip-content.top-left::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 12px;
  border: 6px solid transparent;
  border-top-color: rgba(31, 41, 55, 0.95);
}

/* Top-Right position */
.tooltip-content.top-right {
  bottom: calc(100% + 8px);
  left: 0;
  transform: scale(0.95);
}

.tooltip-content.top-right::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 12px;
  border: 6px solid transparent;
  border-top-color: rgba(31, 41, 55, 0.95);
}

/* Bottom-Left position */
.tooltip-content.bottom-left {
  top: calc(100% + 8px);
  right: 0;
  transform: scale(0.95);
}

.tooltip-content.bottom-left::after {
  content: '';
  position: absolute;
  bottom: 100%;
  right: 12px;
  border: 6px solid transparent;
  border-bottom-color: rgba(31, 41, 55, 0.95);
}

/* Bottom-Right position */
.tooltip-content.bottom-right {
  top: calc(100% + 8px);
  left: 0;
  transform: scale(0.95);
}

.tooltip-content.bottom-right::after {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 12px;
  border: 6px solid transparent;
  border-bottom-color: rgba(31, 41, 55, 0.95);
}

/* Hover effects */
.tooltip-wrapper:hover .tooltip-content.top {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.tooltip-wrapper:hover .tooltip-content.bottom {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.tooltip-wrapper:hover .tooltip-content.left {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}

.tooltip-wrapper:hover .tooltip-content.right {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}

.tooltip-wrapper:hover .tooltip-content.top-left,
.tooltip-wrapper:hover .tooltip-content.top-right,
.tooltip-wrapper:hover .tooltip-content.bottom-left,
.tooltip-wrapper:hover .tooltip-content.bottom-right {
  opacity: 1;
  transform: scale(1);
}

/* Optional hover effect on wrapper */
.tooltip-wrapper:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
</style>
