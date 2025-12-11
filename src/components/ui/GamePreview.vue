<template>
    <div class="game-image-container" v-if="game && game.steam_app?.header_image">
        <a :href="steamStoreUrl" target="_blank" rel="noopener noreferrer" class="steam-link" @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave">
            <img v-show="!showTrailer" :src="game.steam_app.header_image" :alt="`${game.steam_app.name} cover image`" class="game-image"/>
            <video v-show="trailerUrl && showTrailer" ref="videoElement" :src="trailerUrl" class="game-trailer" autoplay muted loop
                playsinline></video>
        </a>
    </div>
</template>

<script>
export default {
  name: 'GamePreview',
  props: {
    // Steam Game Details from Steam API appdetails
    game: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showTrailer: false,
      trailerUrl: null
    }
  },
  computed: {
    steamStoreUrl() {
      return this.game?.steam_app
        ? `https://store.steampowered.com/app/${this.game.steam_app.steam_appid}/`
        : '#'
    },
  },
  async mounted() {
    this.trailerUrl = await this.getValidTrailerUrl();
  },
  methods: {
    onMouseEnter() {
      if (this.trailerUrl) {
        this.showTrailer = true
        // Resume video playback when mouse enters
        this.$nextTick(() => {
          this.$refs.videoElement?.play().catch((error) => {
            console.error('Error playing video:', error)
            this.showTrailer = false
          })
        })
      }
    },

    onMouseLeave() {
      // Pause video before hiding
      this.$refs.videoElement?.pause()
      this.showTrailer = false
    },

    async getValidTrailerUrl() {
      if (this.game?.steam_app?.movies) {
      // Find the first valid trailer URL
      for (const movie of this.game.steam_app.movies) {
        const videoUrl = movie?.webm?.max || movie?.mp4?.max;
        if (videoUrl) {
          try {
            const response = await fetch(videoUrl, { method: 'HEAD' });
            if (response.status === 200) {
              return videoUrl;
            }
          } catch {
            // Continue to next movie if fetch fails
          }
        }
      }
    }
    },
  },
}
</script>

<style scoped>
.game-image-container {
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: relative;
}

.game-image {
    width: 460px;
    height: 215px;
    object-fit: cover;
    display: block;
    transition: transform 0.2s ease;
}

.game-image:hover {
    transform: scale(1.02);
}

.game-trailer {
    width: 460px;
    height: 215px;
    display: block;
    background: #000;
}

.steam-link {
    display: block;
    text-decoration: none;
}

@media (max-width: 768px) {

    .game-image,
    .game-trailer {
        width: 100%;
        max-width: 280px;
        height: auto;
        aspect-ratio: 280/130;
    }
}

@media (max-width: 480px) {

    .game-image,
    .game-trailer {
        width: 100%;
        max-width: 100%;
    }
}
</style>
