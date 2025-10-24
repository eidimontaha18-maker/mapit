<template>
  <div class="auth-container">
    <form class="auth-form" @submit.prevent="onLogin">
      <h2>Login</h2>
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
      <p>Don't have an account? <a href="#" @click.prevent="$emit('switch', 'register')">Register</a></p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  emits: ['login', 'switch'],
  setup(_, { emit }) {
    const email = ref('');
    const password = ref('');
    const onLogin = () => {
      // Simulate login
      emit('login', { email: email.value });
    };
    return { email, password, onLogin };
  },
});
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8ffae 0%, #43c6ac 100%);
}
.auth-form {
  background: #fff;
  padding: 2rem 2.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 320px;
}
.auth-form h2 {
  margin-bottom: 1rem;
  color: #43c6ac;
}
.auth-form input {
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 0.5rem;
  font-size: 1rem;
}
.auth-form button {
  background: linear-gradient(90deg, #43c6ac, #f8ffae);
  border: none;
  color: #222;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}
.auth-form button:hover {
  background: linear-gradient(90deg, #f8ffae, #43c6ac);
}
.auth-form p {
  text-align: center;
  font-size: 0.95rem;
}
.auth-form a {
  color: #43c6ac;
  text-decoration: underline;
  cursor: pointer;
}
</style>
