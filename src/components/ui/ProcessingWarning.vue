<template>
  <div class="processing-warning-container">
    <div class="mb-4">
      <h3>{{ gameName }}: Not found</h3>
    </div>
    <div class="processing-warning">
      <h3>Game Being Processed <div class="warning-icon">⏳</div> </h3>
      <p>Our caffeinated Decku monkeys are scraping the internet non-stop to find you the best game settings for this game.</p>
      <p>Can't guarantee they will do a good job though. They are monkeys after all.</p>
      <p>Please check back in a few minutes. In the meantime, feel free to explore other games!</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProcessingWarning',
  props: {
    gameName: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped>
.processing-warning-container {
  text-align: center;
  margin-bottom: 20px;
}

.warning-icon {
  font-size: 2rem;
  display: inline-block;
  animation: spinPause 6s ease-in-out infinite;
}

@keyframes spinPause {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(180deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(360deg);
  }
}


.processing-warning {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  color: #92400e;
  padding: 20px;
  border-radius: 8px;
  text-align: left;
}

.processing-warning h3 {
  color: #92400e;
  margin: 0 0 12px 0;
  font-size: 1.2rem;
}

.processing-warning p {
  margin: 8px 0;
}
</style>