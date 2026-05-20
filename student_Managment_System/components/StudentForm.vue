<template>
  <section class="form-section">
    <h2>Add New Student</h2>
    <form @submit.prevent="submitForm">
      <div class="form-row">
        <input v-model="form.name" type="text" placeholder="Student Name" required />
        <input v-model="form.email" type="email" placeholder="Email" required />
      </div>
      <div class="form-row">
        <input v-model="form.phone" type="tel" placeholder="Phone" />
        <input v-model="form.course" type="text" placeholder="Course" />
      </div>
      <div class="form-row date-row">
        <div class="date-input-container">
          <label class="input-label">Admission Date</label>
          <input v-model="form.admission_date" type="date" required />
        </div>
        <div class="date-input-container">
          <label class="input-label">Created At</label>
          <input v-model="form.created_at" type="date" required />
        </div>
      </div>
      <div class="form-row photo-row">
        <div class="photo-input-container">
          <label class="input-label">Student Photo</label>
          <div class="photo-input-wrapper">
            <input
              type="file"
              accept="image/*"
              @change="handlePhoto"
              id="add-photo-input"
              class="photo-file-input"
            />
            <div v-if="photoPreview" class="preview-box">
              <img :src="photoPreview" alt="Preview" class="avatar-preview" />
              <button type="button" @click="clearPhoto" class="btn-clear-photo">Remove</button>
            </div>
            <label v-else for="add-photo-input" class="photo-upload-label">
              <span>Choose Photo</span>
            </label>
          </div>
        </div>
      </div>
      <button type="submit" class="btn-add" :disabled="submitting">
        {{ submitting ? 'Adding...' : 'Add Student' }}
      </button>
    </form>
    <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue';

const emit = defineEmits(['add']);

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const form = reactive({
  name: '',
  email: '',
  phone: '',
  course: '',
  admission_date: getTodayDateStr(),
  created_at: getTodayDateStr(),
});

const photoFile = ref(null);
const photoPreview = ref(null);
const submitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const handlePhoto = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    photoFile.value = file;
    photoPreview.value = event.target.result;
  };
  reader.readAsDataURL(file);
};

const clearPhoto = () => {
  photoFile.value = null;
  photoPreview.value = null;
  const input = document.getElementById('add-photo-input');
  if (input) input.value = '';
};

const submitForm = async () => {
  submitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('email', form.email);
  formData.append('phone', form.phone || '');
  formData.append('course', form.course || '');
  formData.append('admission_date', form.admission_date);
  formData.append('created_at', form.created_at);
  
  if (photoFile.value) {
    formData.append('photo', photoFile.value);
  }

  try {
    await emit('add', formData);
    successMessage.value = 'Student added successfully!';
    
    // Reset form
    form.name = '';
    form.email = '';
    form.phone = '';
    form.course = '';
    form.admission_date = getTodayDateStr();
    form.created_at = getTodayDateStr();
    clearPhoto();
    
    setTimeout(() => (successMessage.value = ''), 3000);
  } catch (err) {
    errorMessage.value = err.message || 'Failed to add student';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
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

.btn-add:hover:not(:disabled) {
  background-color: #229954;
}

.btn-add:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

.date-input-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.input-label {
  font-size: 12px;
  color: #7f8c8d;
  font-weight: bold;
}

.photo-row {
  grid-column: span 2;
}

.photo-input-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
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
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
