<script setup>
import { ref, onMounted } from 'vue';
import CommentSection from './components/CommentSection.vue';

const userId = ref('');
const users = ref(null);
const newEmail = ref('');
const csrfToken = ref('');

// Function to get the CSRF token from the server
const getCsrfToken = async () => {
  const response = await fetch('http://localhost:3000/api/csrf-token', {
    credentials: 'include', // Include credentials for CORS
  });
  const data = await response.json();
  csrfToken.value = data.csrfToken; // Store the CSRF token
};

// Function to fetch user information based on user ID
const getUser = async () => {
  const response = await fetch(`http://localhost:3000/api/user/${userId.value}`);
  users.value = await response.json();
};

// Function to change the user's email
const changeEmail = async () => {
  await fetch(`http://localhost:3000/api/user/${userId.value}/change-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken.value, // Include CSRF token in headers
    },
    body: JSON.stringify({ email: newEmail.value }), // Send email in JSON format
  });
};

onMounted(() => {
  getCsrfToken(); // Fetch CSRF token when the component mounts
});
</script>

<template>
  <div id="app">
    <h1>User Dashboard</h1>
    <div>
      <input v-model="userId" placeholder="Enter User ID" />
      <button @click="getUser">Get User Info</button>
    </div>
    <div v-if="users">
      <template v-for="user in users">
        <h2>{{ user.name }}</h2>
        <p>Email: {{ user.email }}</p>
        <hr />
      </template>
    </div>
    <CommentSection />
    <form @submit.prevent="changeEmail">
      <h3>Change Email</h3>
      <input v-model="newEmail" placeholder="New Email" />
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<style scoped>
/* Add any additional styling here */
</style>
