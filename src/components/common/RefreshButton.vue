<template>
  <Button :disabled="isDisabled" @click="$emit('refresh')" variant="primary" size="medium">
    <span class="refresh-content">
      <RotateCw />
      <span v-if="isDisabled">Refresh ({{ countdown }})</span>
      <span v-else>Refresh</span>
    </span>
  </Button>
</template>

<script>
import { RotateCw } from 'lucide-vue-next'
import Button from '@/components/base/Button.vue'
export default {
  components: { Button, RotateCw },
  name: 'RefreshButton',
  emits: ['refresh'],
  props: {
    countdownStart: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      countdown: this.countdownStart,
      isDisabled: true,
      timer: null,
    }
  },
  mounted() {
    this.startCountdown()
  },
  beforeUnmount() {
    clearInterval(this.timer)
  },
  methods: {
    startCountdown() {
      this.isDisabled = true
      this.countdown = this.countdownStart
      this.timer = setInterval(() => {
        if (this.countdown > 1) {
          this.countdown--
        } else {
          this.isDisabled = false
          clearInterval(this.timer)
        }
      }, 1000)
    },
    reset() {
      clearInterval(this.timer)
      this.startCountdown()
    },
  },
}
</script>

<style scoped>
button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-content {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
}
</style>
