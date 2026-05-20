<template>
  <section class="stats-section">
    <div class="stat-card">
      <h3>Total Students</h3>
      <p class="stat-number">{{ count }}</p>
      <div v-if="backgroundLoading" class="loading-indicator">
        Loading more...
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    required: true
  },
  backgroundLoading: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #7f8c8d;
  font-size: 14px;
  font-weight: normal;
}

.stat-number {
  margin: 0;
  font-size: 36px;
  font-weight: bold;
  color: #2c3e50;
}

.loading-indicator {
  position: absolute;
  bottom: 10px;
  right: 15px;
  font-size: 11px;
  color: #3498db;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
</style>
