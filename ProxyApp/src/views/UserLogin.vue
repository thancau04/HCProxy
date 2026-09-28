<template>
  <ToastProvider>
    <div class="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8">
      <div class="w-full max-w-[400px] space-y-8 rounded-xl border border-gray-200 bg-white p-10 shadow-xl shadow-gray-200/50">
        
        <div class="text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <User class="h-6 w-6 text-white" />
          </div>
          <h2 class="mt-6 text-2xl font-bold tracking-tight text-gray-900">Welcome back!</h2>
          <p class="mt-2 text-sm text-gray-500">Sign in to your dashboard</p>
        </div>
  
        <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
          
          <div class="space-y-2">
            <Label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700" for="username">
              Username
            </Label>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User class="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="username"
                v-model="username"
                type="text"
                class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                :class="{'border-red-500 focus-visible:ring-red-500': usernameError}"
                placeholder="Enter your username"
                @input="clearErrors"
              />
            </div>
            <p v-if="usernameError" class="text-[0.8rem] font-medium text-red-500">{{ usernameError }}</p>
          </div>
  
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label class="text-sm font-medium leading-none text-gray-700" for="password">
                Password
              </Label>
              <a href="#" class="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline">
                Forgot password?
              </a>
            </div>
            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock class="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="password"
                v-model="password"
                type="password"
                class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 pl-9 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                :class="{'border-red-500 focus-visible:ring-red-500': passwordError}"
                placeholder="••••••••"
                @input="clearErrors"
              />
            </div>
            <p v-if="passwordError" class="text-[0.8rem] font-medium text-red-500">{{ passwordError }}</p>
          </div>
  
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
  
        <div class="text-center text-sm">
          <span class="text-gray-500">Don't have an account? </span>
          <router-link to="/register" class="font-semibold text-blue-600 hover:text-blue-500 hover:underline underline-offset-4">
            Create an account
          </router-link>
        </div>
      </div>
    </div>

    <ToastRoot 
      v-model:open="toastOpen" 
      class="bg-white rounded-lg shadow-lg border border-gray-200 p-[15px] grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-[15px] items-center data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:animate-swipeOut"
    >
      <div class="flex items-center gap-2 [grid-area:_title]">
        <CheckCircle2 v-if="toastType === 'success'" class="h-5 w-5 text-green-600" />
        <AlertCircle v-else class="h-5 w-5 text-red-600" />
        <ToastTitle class="font-medium text-gray-900 text-[15px]">
          {{ toastTitle }}
        </ToastTitle>
      </div>
      <ToastDescription class="[grid-area:_description] m-0 text-slate-500 text-[13px] leading-[1.3] pl-7">
        {{ toastMessage }}
      </ToastDescription>
    </ToastRoot>
    <ToastViewport class="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
  </ToastProvider>
</template>
  
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiRequest } from '@/utils/api'; // Giả định helper của bạn ở đây
import { 
  ToastProvider, 
  ToastRoot, 
  ToastTitle, 
  ToastDescription, 
  ToastViewport,
  Label 
} from 'radix-vue';
import { User, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-vue-next';

const router = useRouter();

// Form State
const username = ref('');
const password = ref('');
const usernameError = ref('');
const passwordError = ref('');
const loading = ref(false);

// Toast State
const toastOpen = ref(false);
const toastTitle = ref('');
const toastMessage = ref('');
const toastType = ref('success'); // 'success' | 'error'

// Helper functions
const showToast = (title, message, type = 'success') => {
  toastTitle.value = title;
  toastMessage.value = message;
  toastType.value = type;
  toastOpen.value = true;
};

const clearErrors = () => {
  usernameError.value = '';
  passwordError.value = '';
};

const handleLogin = async () => {
  loading.value = true;
  clearErrors();

  // Basic Validation
  if (!username.value.trim()) {
    usernameError.value = 'Username is required';
    loading.value = false;
    return;
  }
  if (!password.value) {
    passwordError.value = 'Password is required';
    loading.value = false;
    return;
  }

  try {
    // API Call
    const data = await apiRequest('/user/login', 'GET', { 
      username: username.value.trim(), 
      password: password.value 
    });

    if (!data.token || !data.id) {
      throw new Error('Invalid response from server');
    }

    // Save Auth Data
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.id);
    localStorage.setItem('username', username.value.trim());

    showToast('Success', 'Signed in successfully!', 'success');
    
    // Redirect after delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);

  } catch (error) {
    const msg = error.message === 'Invalid response from server' 
      ? 'System error. Please try again.' 
      : 'Incorrect username or password.';
    showToast('Error', msg, 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Keyframes cho Toast Animation */
@keyframes slideIn {
  from { transform: translateX(calc(100% + var(--viewport-padding))); }
  to { transform: translateX(0); }
}
@keyframes hide {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes swipeOut {
  from { transform: translateX(var(--radix-toast-swipe-end-x)); }
  to { transform: translateX(calc(100% + var(--viewport-padding))); }
}

/* Áp dụng animation qua Tailwind data attributes trong template phía trên */
</style>