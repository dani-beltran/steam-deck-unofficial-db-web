<template>
  <div class="table-container">
    <table class="properties-table">
      <thead>
        <tr>
          <th>Property</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredData.length === 0">
          <td colspan="2" class="no-data-cell">No properties to display.</td>
        </tr>
        <tr v-if="filteredData.length > 0" v-for="row in filteredData" :key="keyPrefix + '-' + row.key">
          <td class="property-cell">{{ formatKey(row.key) }}</td>
          <td class="value-cell">
            <span v-if="typeof row.value === 'boolean'" :class="row.value ? 'boolean-true' : 'boolean-false'">
              {{ row.value }}
            </span>
            <span v-else-if="typeof row.value === 'number'" class="number-value">
              {{ row.value }}
            </span>
            <span v-else-if="row.value === null || row.value === undefined" class="null-value">
              null
            </span>
            <span v-else>{{ row.value }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'PropertiesTable',
  props: {
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
    keyPrefix: {
      type: String,
      default: 'row',
    },
  },
  computed: {
    filteredData() {
      // Filter out rows where value is null or undefined
      return this.data.filter(
        (row) => row.value !== null && row.value !== undefined && row.value !== ''
      )
    },
  },
  methods: {
    formatKey(key) {
      // Replace underscores with spaces and capitalize every word
      return key
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    },
  },
}
</script>

<style scoped>
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.properties-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  table-layout: fixed;
}

.properties-table th {
  background: var(--primary-color);
  color: white;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.properties-table th:first-child,
.properties-table td:first-child {
  width: 40%;
}

.properties-table th:nth-child(2),
.properties-table td:nth-child(2) {
  width: 60%;
}

.properties-table td {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.properties-table tr:nth-child(even) {
  background: #f9fafb;
}

.properties-table tr:hover {
  background: #f3f4f6;
}

.property-cell {
  font-weight: 600;
  color: #374151;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  overflow-wrap: break-word;
}

.value-cell {
  color: #6b7280;
  word-break: break-all;
  overflow-wrap: break-word;
}

.boolean-true {
  color: #059669;
  font-weight: 600;
}

.boolean-false {
  color: #dc2626;
  font-weight: 600;
}

.number-value {
  color: #7c3aed;
  font-weight: 600;
}

.null-value {
  color: #9ca3af;
  font-style: italic;
}

.no-data-cell {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 32px 16px;
}

@media (max-width: 768px) {
  .properties-table th,
  .properties-table td {
    padding: 12px;
    font-size: 0.9rem;
  }
  
  .properties-table th:first-child,
  .properties-table td:first-child {
    width: 50%;
  }

  .properties-table th:nth-child(2),
  .properties-table td:nth-child(2) {
    width: 50%;
  }
}
</style>