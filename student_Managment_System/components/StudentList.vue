<template>
  <section class="students-section">
    <h2>Students List</h2>
    <div class="search-bar">
      <input
        v-model="internalSearchTerm"
        type="search"
        placeholder="Search by name, email, phone, or course (Server-Side)"
      />
      <p class="search-info" v-if="internalSearchTerm">
        Searching the whole database...
      </p>
    </div>
    
    <div v-if="loading && students.length === 0" class="loading">Loading students...</div>
    <div v-else-if="students.length === 0" class="empty-state">
      No students found. Add one to get started!
    </div>
    <div v-else class="students-table-container">
      <table class="students-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Photo</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Course</th>
            <th>Created At</th>
            <th>Admission Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in students" :key="student.id">
            <td>{{ student.id }}</td>
            <td>
              <div class="avatar-container">
                <img v-if="student.photo" :src="student.photo" alt="Student Photo" class="student-avatar" />
                <div v-else class="student-avatar-placeholder">
                  {{ getInitials(student.name) }}
                </div>
              </div>
            </td>
            <td>{{ student.name }}</td>
            <td>{{ student.email }}</td>
            <td>{{ student.phone || '-' }}</td>
            <td>{{ student.course || '-' }}</td>
            <td>{{ formatDate(student.created_at) }}</td>
            <td>{{ formatDate(student.admission_date) }}</td>
            <td class="actions">
              <button @click="$emit('edit', student)" class="btn-edit">Edit</button>
              <button @click="$emit('delete', student.id)" class="btn-delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Infinite load indicator -->
      <div v-if="backgroundLoading" class="background-loading">
        Loading more students...
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  students: {
    type: Array,
    required: true
  },
  searchTerm: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  backgroundLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:searchTerm', 'edit', 'delete']);

const internalSearchTerm = computed({
  get: () => props.searchTerm,
  set: (val) => emit('update:searchTerm', val)
});

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};
</script>

<style scoped>
.students-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.students-section h2 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 18px;
}

.search-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.search-bar input {
  flex: 1 1 300px;
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 14px;
}

.search-bar input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}

.search-info {
  margin: 0;
  color: #7f8c8d;
  font-size: 13px;
  font-style: italic;
}

.loading {
  text-align: center;
  color: #7f8c8d;
  padding: 40px 20px;
}

.background-loading {
  text-align: center;
  color: #3498db;
  padding: 15px;
  font-size: 12px;
  font-weight: bold;
  font-style: italic;
  border-top: 1px solid #ecf0f1;
}

.empty-state {
  text-align: center;
  color: #95a5a6;
  padding: 40px 20px;
  font-style: italic;
}

.students-table-container {
  overflow-x: auto;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table thead {
  background-color: #ecf0f1;
}

.students-table th {
  padding: 12px;
  text-align: left;
  font-weight: bold;
  color: #2c3e50;
  border-bottom: 2px solid #bdc3c7;
}

.students-table td {
  padding: 12px;
  border-bottom: 1px solid #ecf0f1;
}

.students-table tr:hover {
  background-color: #f9f9f9;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
}

.btn-edit {
  background-color: #3498db;
  color: white;
}

.btn-edit:hover {
  background-color: #2980b9;
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background-color: #c0392b;
}

.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #ecf0f1;
}

.student-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
}
</style>
