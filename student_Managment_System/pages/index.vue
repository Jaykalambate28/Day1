<script setup>
// Redirect to dashboard on page load
definePageMeta({
  layout: false
});

useHead({
  title: 'Redirecting...'
});

navigateTo('/dashboard', { redirectCode: 301 });
</script>

<template>
  <div style="display: flex; align-items: center; justify-content: center; height: 100vh;">
    <p>Redirecting to dashboard...</p>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
}

/* Simple Navigation Header */
.navbar {
  padding: 15px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.navbar h1 {
  font-size: 20px;
  color: #333333;
  font-weight: normal;
}

.login-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* Simple White Card */
.login-box {
  width: 100%;
  max-width: 360px;
  padding: 30px;
  border: 1px solid #cccccc;
  border-radius: 4px;
  background-color: #ffffff;
}

.login-box h2 {
  font-size: 22px;
  margin-bottom: 5px;
  color: #222222;
}

.subtitle {
  font-size: 13px;
  color: #666666;
  margin-bottom: 20px;
}

/* Inputs and Forms */
.form-field {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-field label {
  font-size: 12px;
  font-weight: bold;
  color: #444444;
}

.form-field input {
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid #999999;
  border-radius: 4px;
  outline: none;
  background-color: #ffffff;
  color: #333333;
}

.form-field input:focus {
  border-color: #007bff;
}

/* Buttons */
.btn-login {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-login:hover {
  background-color: #0056b3;
}

.error-msg {
  color: #d9534f;
  font-size: 13px;
  margin-bottom: 15px;
}
</style>
