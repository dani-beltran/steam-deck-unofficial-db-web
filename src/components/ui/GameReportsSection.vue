<template>
  <div class="report-section">
  <div class="section-header">
    <h2 class="section-title">Community Game Reports</h2>
  </div>
  <Card
    v-if="reports && reports.length > 0"
  >
    <div class="reports-container">
      <div
        v-for="(report, index) in reports"
        :key="`${report.source}-${report.hash || index}`"
        class="report-card"
        @click="openLink(report.url)"
      >
        <!-- Reporter Info -->
        <div class="report-header">
          <div class="reporter-info">
            <div
              target="_blank"
              rel="noopener noreferrer"
              class="reporter-link"
              :aria-label="`View ${report.reporter.username}'s profile`"
              @click="openLink(report.reporter.user_profile_url)"
            >
              <img
                v-if="report.reporter.user_profile_avatar_url && !imageErrors[index]"
                :src="report.reporter.user_profile_avatar_url"
                :alt="`${report.reporter.username}'s avatar`"
                class="reporter-avatar"
                @error="handleImageError(index)"
              />
              <div v-else class="reporter-avatar-placeholder">
                {{ getInitials(report.reporter.username) }}
              </div>
              <span class="reporter-name">{{ report.reporter.username }}</span>
            </div>
          </div>

          <div class="report-metadata">
            <span v-if="report.steamdeck_settings?.frame_rate_cap || report.steamdeck_settings?.screen_refresh_rate" class="frame-rate-badge">
              {{ report.steamdeck_settings.frame_rate_cap || report.steamdeck_settings.screen_refresh_rate }} FPS
            </span>
            <span v-if="report.steamdeck_settings?.tdp_limit" class="tdp-badge">
              {{ report.steamdeck_settings.tdp_limit }} W
            </span>
            <span v-if="report.steamdeck_hardware" class="hardware-badge" :class="`hardware-${report.steamdeck_hardware}`">
              {{ formatHardware(report.steamdeck_hardware) }}
            </span>
          </div>

          <div class="report-source">
            <span class="source-badge" :class="`source-${report.source}`">
              {{ report.source }}
            </span>
            
            <span v-if="report.posted_at" class="posted-date" :title="formatFullDate(report.posted_at)">
              {{ formatDate(report.posted_at) }}
            </span>
          </div>
        </div>

        <!-- Report Content -->
        <div class="report-content" v-if="report.notes">
            <p class="notes-text">
              {{ this.cutText(`${report.title || ""} ${report.notes}`, 80) }}
            </p>
          
            <div class="see-more-text">
              <span>Continue reading...</span>
            </div>
        </div>
      </div>

      <div v-if="reports.length === 0" class="no-reports">
        <p>No community reports available yet.</p>
      </div>
    </div>
  </Card>
  </div>
</template>

<script>
import Card from '../base/Card.vue'

export default {
  name: 'GameReportsSection',
  components: {
    Card,
  },
  props: {
    reports: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      imageErrors: {},
    }
  },
  methods: {
    openLink(url) {
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    },
    cutText(text, maxLength) {
      if (text.length <= maxLength) return text
      return `${text.slice(0, maxLength).replace(/\n/g, ' ')}...`
    },
    formatKey(key) {
      return key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },
    formatHardware(hardware) {
      return hardware.toUpperCase()
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
      return `${Math.floor(diffDays / 365)} years ago`
    },
    formatFullDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },
    getInitials(username) {
      if (!username) return '?'
      const words = username.split(' ')
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase()
      }
      return username.substring(0, 2).toUpperCase()
    },
    handleImageError(reportKey) {
      // Mark this image as errored so the placeholder will show
      this.imageErrors[reportKey] = true
    },
  },
}
</script>

<style scoped>
.section-header {
  margin-bottom: 16px;
}

.reports-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.report-card {
  background: var(--bg-primary);
  border: 1px solid var(--secondary-border-color);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.report-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.reporter-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reporter-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-primary);
  transition: opacity 0.2s ease;
}

.reporter-link:hover {
  opacity: 0.8;
}

.reporter-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--secondary-border-color);
}

.reporter-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.reporter-name {
  font-weight: 500;
  color: var(--text-primary);
}

.report-source {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.report-metadata {
  display: flex;
  align-items: center;
  justify-content: right;
  gap: 8px;
  flex: 1;
}

.source-badge,
.hardware-badge,
.frame-rate-badge,
.tdp-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.source-badge {
  background: #e0e7ff;
  color: #3730a3;
}

.source-protondb {
  background: #dcfce7;
  color: #166534;
}

.source-sharedeck {
  background: #fef3c7;
  color: #92400e;
}

.source-steamdeckhq {
  background: #fce7f3;
  color: #be185d;
}

.hardware-badge {
  background: #f3f4f6;
  color: #374151;
}

.hardware-oled {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #78350f;
}

.hardware-lcd {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: #1e3a8a;
}

.frame-rate-badge {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #064e3b;
}

.tdp-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #92400e;
}

.posted-date {
  font-size: 0.75rem;
  color: var(--secondary-text-color);
}

.report-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.report-section {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--secondary-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label {
  font-size: 0.8rem;
  color: var(--secondary-text-color);
  font-weight: 500;
}

.setting-value {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 400;
}

.notes-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.see-more-text {
  margin-left: 6px;
  font-size: 0.8rem;
  color: var(--primary-color);
  font-weight: 500;
  opacity: 0;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

.report-card:hover .see-more-text {
  opacity: 1;
}

.no-reports {
  text-align: center;
  padding: 40px 20px;
  color: var(--secondary-text-color);
}

.no-reports p {
  margin: 0;
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .report-header {
    align-items: flex-start;
  }

  .report-header > div {
    flex: 1 1 100%;
  }

  .report-source {
    justify-content: space-between;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .reporter-avatar,
  .reporter-avatar-placeholder {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 1024px) {
  .see-more-text {
    display: none;
  }
}
</style>
