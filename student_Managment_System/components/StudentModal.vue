<template>
  <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h2>Edit Student</h2>
      <form @submit.prevent="submitForm">
        <div class="form-field-wrapper">
          <label class="modal-field-label">Name</label>
          <input v-model="form.name" type="text" placeholder="Name" required />
        </div>
        <div class="form-field-wrapper">
          <label class="modal-field-label">Email</label>
          <input v-model="form.email" type="email" placeholder="Email" required />
        </div>
        <div class="form-field-wrapper">
          <label class="modal-field-label">Phone</label>
          <input v-model="form.phone" type="tel" placeholder="Phone" />
        </div>
        <div class="form-field-wrapper">
          <label class="modal-field-label">Course</label>
          <input v-model="form.course" type="text" placeholder="Course" />
        </div>
        <div class="form-field-wrapper">
          <label class="modal-field-label">Admission Date</label>
          <input v-model="form.admission_date" type="date" required />
        </div>
        <div class="form-field-wrapper">
          <label class="modal-field-label">Created At</label>
          <input v-model="form.created_at" type="date" required />
        </div>
        <div class="form-field-wrapper">
          <label class="modal-field-label">Student Photo</label>
          <div class="photo-input-wrapper">
            <input
              type="file"
              accept="image/*"
              @change="handlePhoto"
              id="edit-photo-input"
              class="photo-file-input"
            />
            <div v-if="photoPreview || form.photo" class="preview-box">
              <img :src="photoPreview || form.photo" alt="Preview" class="avatar-preview" />
              <button type="button" @click="clearPhoto" class="btn-clear-photo">Remove</button>
            </div>
            <label v-else for="edit-photo-input" class="photo-upload-label">
              <span>Choose Photo</span>
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn-save" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save' }}
          </button>
          <button type="button" @click="$emit('close')" class="btn-cancel">Cancel</button>
        </div>
        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  student: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const form = reactive({
  name: '',
  email: '',
  phone: '',
  course: '',
  admission_date: '',
  created_at: '',
  photo: null
});

const photoFile = ref(null);
const photoPreview = ref(null);
const submitting = ref(false);
const errorMessage = ref('');

watch(() => props.isOpen, (newVal) => {
  if (newVal && props.student) {
    const format = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
    form.name = props.student.name;
    form.email = props.student.email;
    form.phone = props.student.phone;
    form.course = props.student.course;
    form.admission_date = format(props.student.admission_date);
    form.created_at = format(props.student.created_at);
    form.photo = props.student.photo;
    
    photoFile.value = null;
    photoPreview.value = null;
    errorMessage.value = '';
  }
});

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
  form.photo = null; 
  const input = document.getElementById('edit-photo-input');
  if (input) input.value = '';
};

const submitForm = async () => {
  submitting.value = true;
  errorMessage.value = '';

  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('email', form.email);
  formData.append('phone', form.phone || '');
  formData.append('course', form.course || '');
  formData.append('admission_date', form.admission_date);
  formData.append('created_at', form.created_at);
  
  if (photoFile.value) {
    formData.append('photo', photoFile.value);
  } else if (form.photo) {
    formData.append('photo', form.photo);
  } else {
    formData.append('photo', '');
  }

  try {
    await emit('save', props.student.id, formData);
    emit('close');
  } catch (err) {
    errorMessage.value = err.message || 'Failed to update student';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
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

.btn-save:hover:not(:disabled) {
  background-color: #229954;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background-color: #7f8c8d;
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

.error-msg {
  color: #e74c3c;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}
</style>
