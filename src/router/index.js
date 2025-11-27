import { createRouter, createWebHistory } from 'vue-router'
import GamePage from '../views/GamePage.vue'
import Home from '../views/Home.vue'
import NotFound from '../views/NotFound.vue'
import SearchResults from '../views/SearchResults.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: SearchResults,
  },
  {
    path: '/game/:gameId',
    name: 'Game',
    component: GamePage,
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    // If there's a saved position (browser back/forward), use it
    if (savedPosition) {
      return savedPosition
    }
    // Otherwise, scroll to top
    return { top: 0 }
  },
})

export default router
