<template>
  <div class="thumbs-rating">
    <Tooltip :text="user ? '' : 'Sign in to provide feedback'" position="left">
      <button class="thumb-btn up" :class="{ active: userVote === 'up' }" @click="vote('up')" aria-label="Thumbs up"
        :disabled="!user">
        <ThumbsUp class="icon" />
        <span class="count">{{ thumbsUp }}</span>
      </button>
    </Tooltip>
    <Tooltip :text="user ? '' : 'Sign in to provide feedback'" position="left">
      <button class="thumb-btn down" :class="{ active: userVote === 'down' }" @click="vote('down')"
        aria-label="Thumbs down" :disabled="!user">
        <ThumbsDown class="icon" />
        <span class="count">{{ thumbsDown }}</span>
      </button>
    </Tooltip>
  </div>

</template>

<script>
import { ThumbsDown, ThumbsUp } from 'lucide-vue-next'
import Tooltip from '@/components/base/Tooltip.vue'
export default {
  name: 'ThumbsRating',
  components: {
    ThumbsUp,
    ThumbsDown,
    Tooltip,
  },
  data() {
    return {
      thumbsUp: 0,
      thumbsDown: 0,
    }
  },
  props: {
    user: {
      type: Object,
      default: null,
    },
    gameSettings: {
      type: Object,
      required: true,
    },
  },
  computed: {
    userVote() {
      if (
        !this.user ||
        !this.user.deckuProfile ||
        !this.user.deckuProfile.votes ||
        !this.gameSettings
      ) {
        return null
      }
      return (
        this.user.deckuProfile.votes.find((vote) => vote.game_settings_id === this.gameSettings._id)
          ?.vote_type || null
      )
    },
  },
  watch: {
    gameSettings: {
      immediate: true,
      handler() {
        this.thumbsUp = this.gameSettings.thumbs_up ?? 0
        this.thumbsDown = this.gameSettings.thumbs_down ?? 0
      },
    },
  },
  emits: ['vote'],
  methods: {
    vote(type) {
      if (!this.user) {
        return
      }
      const previousVote = this.userVote
      // if the same vote is clicked, remove the vote passing null
      const vote = previousVote === type ? null : type
      this.$emit('vote', vote)
    },
  },
}
</script>

<style scoped>
.thumbs-rating {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thumb-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #606060;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background 0.2s, color 0.2s;
}

.thumb-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
  color: #b0b0b0;
}

.thumb-btn .icon {
  width: 24px;
  height: 24px;
  margin-right: 6px;
  fill: currentColor;
}

.thumb-btn.up.active,
.thumb-btn.up:hover {
  background: #e8f0fe;
  color: #1967d2;
}

.thumb-btn.down.active,
.thumb-btn.down:hover {
  background: #fbe9e7;
  color: #d23f31;
}

.count {
  min-width: 24px;
  text-align: right;
  font-weight: 500;
}
</style>
