<template>
  <div class="processing-warning-container">
    <div class="mb-4">
      <h3>{{ gameName }} not found</h3>
    </div>
    <div class="processing-warning">
      <h3>Game Being Processed <div class="warning-icon">⏳</div> </h3>
      <p>Our caffeinated Decku monkeys are searching the internet non-stop to find you game settings reports for this game.</p>
      <p><strong>Please, check back in a few minutes 🙏</strong> In the meantime, feel free to explore other games!</p>
      <p></p>
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
}

.processing-warning p {
  text-align: left;
  line-height: 1.2em;
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