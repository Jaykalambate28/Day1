<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1>Student Management Dashboard</h1>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="dashboard-grid">
        
        <!-- Add Student Form -->
        <section class="form-section">
          <h2>Add New Student</h2>
          <form @submit.prevent="addStudent">
            <div class="form-row">
              <input
                v-model="newStudent.name"
                type="text"
                placeholder="Student Name"
                required
              />
              <input
                v-model="newStudent.email"
                type="email"
                placeholder="Email"
                required
              />
            </div>
            <div class="form-row">
              <input
                v-model="newStudent.phone"
                type="tel"
                placeholder="Phone"
              />
              <input
                v-model="newStudent.course"
                type="text"
                placeholder="Course"
              />
            </div>
            <div class="form-row date-row">
              <div class="date-input-container">
                <label class="input-label">Admission Date</label>
                <input
                  v-model="newStudent.admission_date"
                  type="date"
                  required
                />
              </div>
              <div class="date-input-container">
                <label class="input-label">Created At</label>
                <input
                  v-model="newStudent.created_at"
                  type="date"
                  required
                />
              </div>
            </div>
            <div class="form-row photo-row">
              <div class="photo-input-container">
                <label class="input-label">Student Photo</label>
                <div class="photo-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handlePhotoUpload($event, 'add')"
                    id="add-photo-input"
                    class="photo-file-input"
                  />
                  <div v-if="photoPreview" class="preview-box">
                    <img :src="photoPreview" alt="Preview" class="avatar-preview" />
                    <button type="button" @click="clearPhoto('add')" class="btn-clear-photo">Remove</button>
                  </div>
                  <label v-else for="add-photo-input" class="photo-upload-label">
                    <span>Choose Photo</span>
                  </label>
                </div>
              </div>
            </div>
            <button type="submit" class="btn-add">Add Student</button>
          </form>
          <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>
          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
        </section>

        <!-- Students List -->
        <section class="students-section">
          <h2>Students List</h2>
          <div class="search-bar">
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Search by id, name, email, phone, or course"
            />
            <p class="search-info" v-if="searchTerm">
              Showing {{ filteredStudents.length }} of {{ students.length }} students
            </p>
          </div>
          <div v-if="loading" class="loading">Loading students...</div>
          <div v-else-if="students.length === 0" class="empty-state">
            No students found. Add one to get started!
          </div>
          <div v-else-if="filteredStudents.length === 0" class="empty-state">
            No matching students found for "{{ searchTerm }}".
          </div>
          <div v-else class="students-table">
            <table>
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
                <tr v-for="student in filteredStudents" :key="student.id">
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
                    <button @click="editStudent(student)" class="btn-edit">Edit</button>
                    <button @click="deleteStudent(student.id)" class="btn-delete">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- Pagination Controls -->
            <div class="pagination-controls">
              <button 
                @click="loadPreviousPage" 
                :disabled="page === 1 || loading"
                class="btn-pagination"
              >
                ← Back
              </button>
              <span class="pagination-info">
                Page {{ page }} of {{ totalPages }}
              </span>
              <button 
                @click="loadNextPage" 
                :disabled="page >= totalPages || loading"
                class="btn-pagination"
              >
                Next →
              </button>
            </div>
          </div>
        </section>

        <!-- Edit Student Modal -->
        <div v-if="editingStudent" class="modal-overlay" @click="editingStudent = null">
          <div class="modal" @click.stop>
            <h2>Edit Student</h2>
            <form @submit.prevent="updateStudent">
              <div class="form-field-wrapper">
                <label class="modal-field-label">Name</label>
                <input
                  v-model="editingStudent.name"
                  type="text"
                  placeholder="Name"
                  required
                />
              </div>
              <div class="form-field-wrapper">
                <label class="modal-field-label">Email</label>
                <input
                  v-model="editingStudent.email"
                  type="email"
                  placeholder="Email"
                  required
                />
              </div>
              <div class="form-field-wrapper">
                <label class="modal-field-label">Phone</label>
                <input
                  v-model="editingStudent.phone"
                  type="tel"
                  placeholder="Phone"
                />
              </div>
              <div class="form-field-wrapper">
                <label class="modal-field-label">Course</label>
                <input
                  v-model="editingStudent.course"
                  type="text"
                  placeholder="Course"
                />
              </div>
              <div class="form-field-wrapper">
                <label class="modal-field-label">Admission Date</label>
                <input
                  v-model="editingStudent.admission_date"
                  type="date"
                  required
                />
              </div>
              <div class="form-field-wrapper">
                <label class="modal-field-label">Student Photo</label>
                <div class="photo-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handlePhotoUpload($event, 'edit')"
                    id="edit-photo-input"
                    class="photo-file-input"
                  />
                  <div v-if="editPhotoPreview || editingStudent.photo" class="preview-box">
                    <img :src="editPhotoPreview || editingStudent.photo" alt="Preview" class="avatar-preview" />
                    <button type="button" @click="clearPhoto('edit')" class="btn-clear-photo">Remove</button>
                  </div>
                  <label v-else for="edit-photo-input" class="photo-upload-label">
                    <span>Choose Photo</span>
                  </label>
                </div>
              </div>
              <div class="modal-actions">
                <button type="submit" class="btn-save">Save</button>
                <button type="button" @click="editingStudent = null" class="btn-cancel">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStudents } from '~/composables/useStudents';

// Use the composable for paginated/background loading and server-side search
const {
  students,
  loading,
  backgroundLoading,
  error,
  searchTerm,
  hasMore,
  total,
  page,
  totalPages,
  loadInitial,
  loadNextPage,
  loadPreviousPage,
  addStudent: apiAddStudent,
  updateStudent: apiUpdateStudent,
  deleteStudent: apiDeleteStudent
} = useStudents();

const successMessage = ref('');
const errorMessage = ref('');
const editingStudent = ref(null);

// Photo upload reactive state
const photoFile = ref(null);
const photoPreview = ref(null);
const editPhotoFile = ref(null);
const editPhotoPreview = ref(null);

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const newStudent = ref({
  name: '',
  email: '',
  phone: '',
  course: '',
  admission_date: getTodayDateStr(),
  created_at: getTodayDateStr(),
});

const handlePhotoUpload = (e, type) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    if (type === 'add') {
      photoFile.value = file;
      photoPreview.value = event.target.result;
    } else {
      editPhotoFile.value = file;
      editPhotoPreview.value = event.target.result;
    }
  };
  reader.readAsDataURL(file);
};

const clearPhoto = (type) => {
  if (type === 'add') {
    photoFile.value = null;
    photoPreview.value = null;
    const input = document.getElementById('add-photo-input');
    if (input) input.value = '';
  } else {
    editPhotoFile.value = null;
    editPhotoPreview.value = null;
    if (editingStudent.value) editingStudent.value.photo = null; // Mark photo as deleted
    const input = document.getElementById('edit-photo-input');
    if (input) input.value = '';
  }
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// When searching, the server provides matches across the whole DB. Otherwise show loaded students.
const filteredStudents = computed(() => {
  return students.value;
});

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

onMounted(async () => {
  await loadInitial();
});

// Add new student
const addStudent = async () => {
  try {
    errorMessage.value = '';
    successMessage.value = '';

    const formData = new FormData();
    formData.append('name', newStudent.value.name);
    formData.append('email', newStudent.value.email);
    formData.append('phone', newStudent.value.phone || '');
    formData.append('course', newStudent.value.course || '');
    formData.append('admission_date', newStudent.value.admission_date);
    formData.append('created_at', newStudent.value.created_at);
    if (photoFile.value) {
      formData.append('photo', photoFile.value);
    }

    const response = await apiAddStudent(formData);

    if (response.ok) {
      successMessage.value = 'Student added successfully!';
      newStudent.value = {
        name: '',
        email: '',
        phone: '',
        course: '',
        admission_date: getTodayDateStr(),
        created_at: getTodayDateStr()
      };
      photoFile.value = null;
      photoPreview.value = null;
      const input = document.getElementById('add-photo-input');
      if (input) input.value = '';
      setTimeout(() => (successMessage.value = ''), 3000);
    } else {
      errorMessage.value = 'Failed to add student';
    }
  } catch (err) {
    errorMessage.value = err.message || 'Error adding student';
  }
};

// Edit student
const editStudent = (student) => {
  const formattedDate = student.admission_date ? new Date(student.admission_date).toISOString().split('T')[0] : '';
  editingStudent.value = { ...student, admission_date: formattedDate };
  editPhotoFile.value = null;
  editPhotoPreview.value = null;
};

// Update student
const updateStudent = async () => {
  try {
    errorMessage.value = '';
    successMessage.value = '';

    const formData = new FormData();
    formData.append('name', editingStudent.value.name);
    formData.append('email', editingStudent.value.email);
    formData.append('phone', editingStudent.value.phone || '');
    formData.append('course', editingStudent.value.course || '');
    formData.append('admission_date', editingStudent.value.admission_date);
    
    if (editPhotoFile.value) {
      formData.append('photo', editPhotoFile.value);
    } else if (editingStudent.value.photo) {
      formData.append('photo', editingStudent.value.photo);
    } else {
      formData.append('photo', '');
    }

    const response = await apiUpdateStudent(editingStudent.value.id, formData);

    if (response.ok) {
      successMessage.value = 'Student updated successfully!';
      editingStudent.value = null;
      editPhotoFile.value = null;
      editPhotoPreview.value = null;
      await loadInitial();
      setTimeout(() => (successMessage.value = ''), 3000);
    } else {
      errorMessage.value = 'Failed to update student';
    }
  } catch (err) {
    errorMessage.value = 'Error updating student';
  }
};

// Delete student
const deleteStudent = async (id) => {
  if (confirm('Are you sure you want to delete this student?')) {
    try {
      const response = await apiDeleteStudent(id);

      if (response.ok) {
        successMessage.value = 'Student deleted successfully!';
        await loadInitial();
        setTimeout(() => (successMessage.value = ''), 3000);
      } else {
        errorMessage.value = 'Failed to delete student';
      }
    } catch (err) {
      errorMessage.value = 'Error deleting student';
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Header */
.dashboard-header {
  background-color: #2c3e50;
  color: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 28px;
}

/* Main */
.dashboard-main {
  flex: 1;
  padding: 30px 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.dashboard-grid {
  display: grid;
  gap: 30px;
}

/* Stats */
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

/* Form Section */
.form-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section h2 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.form-section input {
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 14px;
}

.form-section input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}

.btn-add {
  width: 100%;
  padding: 10px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
}

.btn-add:hover {
  background-color: #229954;
}

.success-msg {
  color: #27ae60;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 0;
}

.error-msg {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 10px;
  margin-bottom: 0;
}

/* Students Section */
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
}

.loading {
  text-align: center;
  color: #7f8c8d;
  padding: 40px 20px;
}

.empty-state {
  text-align: center;
  color: #95a5a6;
  padding: 40px 20px;
  font-style: italic;
}

.students-table table {
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
}

.modal h2 {
  margin-top: 0;
  color: #2c3e50;
}

.modal input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
}

.btn-save {
  background-color: #27ae60;
  color: white;
}

.btn-save:hover {
  background-color: #229954;
}

.btn-cancel {
  background-color: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background-color: #7f8c8d;
}

.date-input-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  grid-column: span 2;
}

.input-label {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: bold;
  text-align: left;
}

.form-field-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  text-align: left;
}

.modal-field-label {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: bold;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .students-table {
    overflow-x: auto;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}

/* Photo Upload Styles */
.photo-row {
  grid-column: span 2;
}

.photo-input-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
}

.photo-input-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 5px;
}

.photo-file-input {
  display: none;
}

.photo-upload-label {
  padding: 10px 16px;
  background-color: #f1f2f6;
  color: #2c3e50;
  border: 2px dashed #bdc3c7;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.photo-upload-label:hover {
  background-color: #e2e4eb;
  border-color: #3498db;
  color: #3498db;
}

.preview-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-preview {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3498db;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.btn-clear-photo {
  padding: 5px 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.btn-clear-photo:hover {
  background-color: #c0392b;
}

/* Datatable Avatar Styles */
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
  letter-spacing: 0.5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Pagination Controls */
.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.btn-pagination {
  padding: 10px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-pagination:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination-info {
  color: #2c3e50;
  font-weight: bold;
  font-size: 14px;
  min-width: 100px;
  text-align: center;
}
</style>
