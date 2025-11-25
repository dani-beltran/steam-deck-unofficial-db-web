<template>
  <div class="add-report-card">
    <h3 class="add-report-title">Add your own report</h3>
    <div class="source-badges">
      <a
        :href="`https://sharedeck.games/apps/${gameId}/reports/new`"
        target="_blank"
        rel="noopener noreferrer"
        class="source-badge source-sharedeck"
        aria-label="Add report on ShareDeck"
      >
        sharedeck <SquarePen class="icon-square-pen"/>
      </a>
      <a
        :href="`https://www.protondb.com/contribute?appId=${gameId}`"
        target="_blank"
        rel="noopener noreferrer"
        class="source-badge source-protondb"
        aria-label="Add report on ProtonDB"
      >
        protondb <SquarePen class="icon-square-pen"/>
      </a>
    </div>
  </div>
</template>

<script>
import { SquarePen } from 'lucide-vue-next';

export default {
  name: 'AddReport',
  components: {
    SquarePen
  },
  props: {
    gameId: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped>
.add-report-card {
  background: var(--bg-card);
  border: 1px solid var(--secondary-border-color);
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.add-report-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.source-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.source-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.source-badge:hover {
  opacity: 0.8;
}

.source-protondb {
  background: #dcfce7;
  color: #166534;
}

.source-sharedeck {
  background: #fef3c7;
  color: #92400e;
}

.icon-square-pen {
  width: 0.75rem;
  height: 0.75rem;
  vertical-align: middle;
  margin-left: 2px;
}
</style>
