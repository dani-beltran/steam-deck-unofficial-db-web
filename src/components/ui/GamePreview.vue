<template>
    <div class="game-image-container" v-if="gameDetails && gameDetails.header_image">
        <a :href="steamStoreUrl" target="_blank" rel="noopener noreferrer" class="steam-link" @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave">
            <img v-show="!showTrailer" :src="gameDetails.header_image" :alt="`${gameDetails.name} cover image`" class="game-image"/>
            <video v-show="trailerUrl && showTrailer" ref="videoElement" :src="trailerUrl" class="game-trailer" autoplay muted loop
                playsinline></video>
        </a>
    </div>
</template>

<script>
export default {
    name: "GamePreview",
    props: {
        // Steam Game Details from Steam API appdetails
        gameDetails: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            showTrailer: false,
        };
    },
    computed: {
        steamStoreUrl() {
            return this.gameDetails.steam_appid
                ? `https://store.steampowered.com/app/${this.gameDetails.steam_appid}/`
                : "#";
        },
        trailerUrl() {
            if (this.gameDetails.movies && this.gameDetails.movies.length > 0) {
                // Get the first trailer's webm or mp4 URL
                const trailer = this.gameDetails.movies[0];
                if (trailer.webm && trailer.webm.max) {
                    return trailer.webm.max;
                } else if (trailer.mp4 && trailer.mp4.max) {
                    return trailer.mp4.max;
                }
            }
        },
    },
    methods: {

        onMouseEnter() {
            if (this.trailerUrl) {
                this.showTrailer = true;
                // Resume video playback when mouse enters
                this.$nextTick(() => {
                    this.$refs.videoElement?.play().catch((error) => {
                        console.error("Error playing video:", error);
                        this.showTrailer = false;
                    });
                });
            }
        },

        onMouseLeave() {
            // Pause video before hiding
            this.$refs.videoElement?.pause();
            this.showTrailer = false;
        },
    },
};
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
