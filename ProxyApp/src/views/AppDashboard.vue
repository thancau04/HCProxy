<template>
  <ToastProvider>
    <div class="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 flex flex-col">
      
      <header class="sticky top-0 z-40 w-full bg-white border-b border-gray-200 h-14 flex-none">
        <div class="h-full px-4 sm:px-6 flex items-center justify-between max-w-[1920px] mx-auto">
          
          <div class="flex items-center gap-2 cursor-pointer select-none" @click="$router.push('/dashboard')">
            <span class="text-lg font-bold tracking-tight text-gray-900">
              48<span class="text-blue-600">Proxy</span>
            </span>
          </div>
  
          <div class="flex items-center gap-1 sm:gap-2">
            <button 
              @click="openNetworkDialog"
              class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95"
              title="Change Interface"
            >
              <Network class="h-4 w-4" />
              <span class="hidden sm:inline">Interface</span>
            </button>
            
            <button 
              v-if="isAdmin" 
              @click="$router.push('/admin')"
              class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-amber-600 hover:bg-amber-50 transition-all active:scale-95"
              title="Admin Console"
            >
              <Crown class="h-4 w-4" />
              <span class="hidden sm:inline">Admin</span>
            </button>
  
            <div class="h-5 w-px bg-gray-200 mx-2 hidden sm:block"></div>

            <button 
              @click="openProfileDialog"
              class="flex items-center gap-2 pl-1 pr-1 sm:pr-3 py-1 rounded-full hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 active:scale-95"
            >
              <div class="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 ring-2 ring-white shadow-sm">
                {{ username.charAt(0).toUpperCase() }}
              </div>
              <span class="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">{{ username }}</span>
              <ChevronDown class="h-3 w-3 text-gray-400 hidden sm:block" />
            </button>
          </div>
        </div>
      </header>
  
      <main class="flex-1 w-full max-w-[1920px] mx-auto p-4 sm:p-6 overflow-x-hidden">
        <ServerInfo :server-info="serverInfo" @refresh="fetchServerInfo" />
      </main>
  
      <DialogRoot v-model:open="showProfileDialog">
        <DialogPortal>
          <DialogOverlay class="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 data-[state=open]:opacity-100 data-[state=closed]:opacity-0" />
          
          <DialogContent class="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-[320px] -translate-x-1/2 -translate-y-1/2 bg-white p-0 shadow-2xl rounded-xl border border-gray-100 outline-none 
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            data-[state=open]:opacity-100 data-[state=open]:scale-100 
            data-[state=closed]:opacity-0 data-[state=closed]:scale-90"
          >
            <div class="p-5 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50 rounded-t-xl">
              <div class="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                <User class="h-5 w-5" />
              </div>
              <div class="overflow-hidden">
                <div class="font-semibold text-gray-900 truncate">{{ username }}</div>
                <div class="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <div :class="['w-1.5 h-1.5 rounded-full', isAdmin ? 'bg-amber-500' : 'bg-green-500']"></div>
                  {{ isAdmin ? 'Administrator' : 'Standard Account' }}
                </div>
              </div>
              <DialogClose class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
                <X class="h-4 w-4" />
              </DialogClose>
            </div>

            <div class="p-5 space-y-4">
              <div class="space-y-1.5">
                <div class="flex justify-between items-center">
                  <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Access Token</label>
                </div>
                <div class="flex items-center gap-2">
                  <code class="flex-1 bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-600 font-mono truncate select-all">
                    {{ token }}
                  </code>
                  <button 
                    @click="copyToken" 
                    class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 transition-all active:scale-90"
                    title="Copy"
                  >
                    <Copy class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div class="p-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
              <button 
                @click="logout" 
                class="w-full flex items-center justify-center gap-2 rounded-md bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm active:scale-[0.98]"
              >
                <LogOut class="h-4 w-4" /> Sign out
              </button>
            </div>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>

      <DialogRoot v-model:open="showNetworkDialog">
        <DialogPortal>
          <DialogOverlay class="fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 data-[state=open]:opacity-100 data-[state=closed]:opacity-0" />
          
          <DialogContent class="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-[420px] -translate-x-1/2 -translate-y-1/2 bg-white p-0 shadow-2xl rounded-xl border border-gray-200 outline-none overflow-hidden 
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            data-[state=open]:opacity-100 data-[state=open]:scale-100 
            data-[state=closed]:opacity-0 data-[state=closed]:scale-90"
          >
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <DialogTitle class="text-base font-bold text-gray-900">Network Interface</DialogTitle>
                <DialogDescription class="text-xs text-gray-500 mt-0.5">Select the binding address for proxies</DialogDescription>
              </div>
              <div v-if="serverInfo.IP" class="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-bold border border-blue-100">
                {{ serverInfo.IP }}
              </div>
            </div>

            <div class="p-2 bg-gray-50/30 min-h-[200px]">
              <div v-if="loadingNetwork" class="h-40 flex flex-col items-center justify-center text-gray-400">
                <Loader2 class="h-6 w-6 animate-spin mb-2 text-blue-600" />
                <span class="text-xs font-medium">Scanning interfaces...</span>
              </div>

              <div v-else-if="interfaces.length" class="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                <div 
                  v-for="iface in interfaces" 
                  :key="iface.ipAddress"
                  @click="selectedInterface = iface"
                  :class="[
                    'group relative flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 transition-all border',
                    selectedInterface?.ipAddress === iface.ipAddress 
                      ? 'bg-blue-50 border-blue-200 z-10 shadow-sm' 
                      : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50 text-gray-600'
                  ]"
                >
                  <div class="flex items-center gap-3">
                    <div :class="[
                      'flex items-center justify-center w-8 h-8 rounded border text-xs font-bold transition-colors',
                      selectedInterface?.ipAddress === iface.ipAddress 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-gray-100 border-gray-200 text-gray-500 group-hover:bg-white'
                    ]">
                      <Cable class="h-4 w-4" />
                    </div>
                    <div>
                      <div :class="['text-sm font-medium', selectedInterface?.ipAddress === iface.ipAddress ? 'text-blue-700' : 'text-gray-700']">
                        {{ iface.interfaceName || 'Unknown Interface' }}
                      </div>
                      <div class="text-[11px] font-mono text-gray-500">
                        {{ iface.ipAddress || 'N/A' }}
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="selectedInterface?.ipAddress === iface.ipAddress" class="text-blue-600">
                    <Check class="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div v-else class="h-40 flex flex-col items-center justify-center text-gray-400">
                <Cable class="h-8 w-8 mb-2 opacity-20" />
                <span class="text-xs">No interfaces found</span>
              </div>
            </div>

            <div class="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button 
                @click="showNetworkDialog = false" 
                class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded border border-transparent transition-colors active:scale-95"
              >
                Cancel
              </button>
              <button 
                @click="confirmNetworkSelection"
                :disabled="!selectedInterface || loadingNetwork"
                class="px-6 py-2 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95"
              >
                Apply
              </button>
            </div>

          </DialogContent>
        </DialogPortal>
      </DialogRoot>

      <ToastRoot 
        v-model:open="toast.show" 
        class="bg-white rounded border border-gray-200 shadow-xl p-4 fixed bottom-6 right-6 z-[100] flex items-center gap-3 w-auto max-w-sm 
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        data-[state=open]:translate-y-0 data-[state=open]:opacity-100 data-[state=open]:scale-100
        data-[state=closed]:translate-y-4 data-[state=closed]:opacity-0 data-[state=closed]:scale-95"
      >
        <div :class="['shrink-0 p-1 rounded-full', toast.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600']">
          <CheckCircle2 v-if="toast.type === 'success'" class="h-4 w-4" />
          <AlertCircle v-else class="h-4 w-4" />
        </div>
        <div>
          <ToastTitle class="font-semibold text-gray-900 text-sm">Notification</ToastTitle>
          <ToastDescription class="text-gray-500 text-xs mt-0.5">{{ toast.message }}</ToastDescription>
        </div>
      </ToastRoot>
      <ToastViewport class="fixed bottom-0 right-0 p-4 flex flex-col gap-2 w-full max-w-sm z-[100]" />

    </div>
  </ToastProvider>
</template>
  
<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { apiRequest, copyToClipboard as copyUtil } from '@/utils/api';
import ServerInfo from '@/components/ServerInfo.vue';

import {
  DialogRoot, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose,
  ToastProvider, ToastRoot, ToastTitle, ToastDescription, ToastViewport
} from 'radix-vue';

import { 
  Network, Crown, User, X, Copy, LogOut, Loader2, Cable, Check, AlertCircle, ChevronDown, CheckCircle2 
} from 'lucide-vue-next';

const router = useRouter();
const token = localStorage.getItem('token');
const username = localStorage.getItem('username') || 'User';
const isAdmin = ref(false);

const showProfileDialog = ref(false);
const showNetworkDialog = ref(false);

const serverInfo = ref({ HostName: '', IP: '', Proxies: [] });
const interfaces = ref([]);
const selectedInterface = ref(null);
const loadingNetwork = ref(false);
const toast = ref({ show: false, message: '', type: 'success' });

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => toast.value.show = false, 3000);
};

const checkAdminStatus = async () => {
  if (!token) return;
  try {
    const data = await apiRequest('/user/validate');
    isAdmin.value = data.isAdmin || data.role === 'admin';
  } catch (e) {
    isAdmin.value = false;
  }
};

const logout = () => {
  localStorage.clear();
  router.push('/login');
};

const copyToken = async () => {
  if (token) {
    const success = await copyUtil(token);
    showToast(success ? 'Copied to clipboard' : 'Failed to copy', success ? 'success' : 'error');
  }
};

const openProfileDialog = () => { showProfileDialog.value = true; };
const openNetworkDialog = () => { showNetworkDialog.value = true; };

const fetchServerInfo = async () => {
  if (!token) return;
  try {
    const data = await apiRequest('/server/info');
    serverInfo.value = {
      HostName: data.HostName || 'N/A',
      IP: data.IP || 'N/A',
      Proxies: typeof data.Proxies === 'string' ? JSON.parse(data.Proxies) : (data.Proxies || [])
    };
  } catch (e) {
    console.error(e);
  }
};

const fetchInterfaces = async () => {
  if (!token) return;
  loadingNetwork.value = true;
  interfaces.value = [];
  try {
    const data = await apiRequest('/network/interfaces');
    interfaces.value = data.map(({ ipAddress, interfaceName }) => ({ ipAddress, interfaceName }));
  } catch (e) {
    showToast('Network scan failed', 'error');
  } finally {
    loadingNetwork.value = false;
  }
};

const confirmNetworkSelection = async () => {
  if (!selectedInterface.value) return;
  loadingNetwork.value = true;
  try {
    const payload = {
      Token: token,
      IpAddress: selectedInterface.value.ipAddress,
      InterfaceName: selectedInterface.value.interfaceName,
    };
    await apiRequest('/network/select', 'POST', {}, payload);
    showToast('Interface updated successfully', 'success');
    serverInfo.value.IP = selectedInterface.value.ipAddress;
    showNetworkDialog.value = false;
    await fetchServerInfo();
  } catch (e) {
    showToast(e.message, 'error');
  } finally {
    loadingNetwork.value = false;
  }
};

onMounted(() => {
  checkAdminStatus();
  fetchServerInfo();
});

watch(showNetworkDialog, (isOpen) => { if (isOpen) fetchInterfaces(); });
</script>

<style scoped>
/* Không sử dụng @keyframes custom để tránh xung đột. */
/* Sử dụng class transition của Tailwind kết hợp Radix state là đủ. */

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>