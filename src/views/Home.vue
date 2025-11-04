<template>
  <div class="home">
    <HomeHeader />
    <!-- Game Name Search Section -->
    <section aria-label="Game Search" class="search-section">
      <GameSearch @game-selected="onGameSelected" />
    </section>

    <!-- Popular Games Carousel Section -->
    <section aria-label="Popular Games" class="popular-section">
      <PopularGames @game-selected="onGameSelected" />
    </section>
  </div>
</template>

<script>
import GameSearch from '../components/ui/GameSearch.vue'
import HomeHeader from '../components/ui/HomeHeader.vue'
import PopularGames from '../components/ui/PopularGames.vue'

export default {
  name: 'Home',
  components: {
    GameSearch,
    HomeHeader,
    PopularGames,
  },
  created() {
    // Set document title for home page
    document.title = 'Steam Deck Settings DB - Game Optimization Settings'
  },
  methods: {
    onGameSelected(game, searchTerm) {
      // Navigate to the game page
      this.$router.push({
        name: 'Game',
        params: { gameId: game.steam_appid ?? game.id },
        query: searchTerm ? { q: searchTerm } : {},
      })
    },
  },
}
</script>

<style scoped>
.home {
  width: 100%;
}

.search-section {
  margin-bottom: 110px;
}

.popular-section {
  margin-bottom: 20px;
  max-width: 100%;
}
</style>