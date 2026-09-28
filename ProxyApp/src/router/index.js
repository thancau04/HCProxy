import { createRouter, createWebHistory } from 'vue-router';
import { apiRequest } from '@/utils/api';

const routes = [
  // 1. Redirect mặc định
  { 
    path: '/', 
    redirect: '/login' 
  },

  // 2. Auth Routes (Pages)
  { 
    path: '/login', 
    name: 'Login',
    component: () => import('@/views/UserLogin.vue') // Lazy load
  },
  { 
    path: '/register', 
    name: 'Register',
    component: () => import('@/views/UserRegister.vue') 
  },

  // 3. Main Dashboard
  { 
    path: '/dashboard', 
    name: 'Dashboard',
    component: () => import('@/views/AppDashboard.vue'),
    meta: { requiresAuth: true } 
  },

  // 4. Feature Routes (Nếu bạn muốn tách riêng thành trang)
  // Lưu ý: Nếu bạn đã nhúng các component này vào Dashboard rồi thì không cần route này nữa
  // Nhưng tôi vẫn để đây để code cũ của bạn không bị gãy.
  { 
    path: '/proxy-pool-manager', 
    name: 'PoolProxyManager', 
    component: () => import('@/views/PoolProxyManager.vue'), // Đổi thành View nếu là trang riêng
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin', 
    name: 'AdminConfig', 
    component: () => import('@/views/AdminConfig.vue'), 
    meta: { requiresAuth: true, requiresAdmin: true } 
  },
  
  // 5. Catch-all (404) - Tự động quay về Dashboard nếu gõ linh tinh
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/dashboard' 
  }
];

const router = createRouter({
  history: createWebHistory(), // Vite tự xử lý base url
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Luôn cuộn lên đầu trang khi chuyển route
    return { top: 0 };
  }
});

// --- NAVIGATION GUARD (Bảo vệ Route) ---
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  // 1. Nếu Route yêu cầu đăng nhập mà chưa có token -> Đá về Login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  // 2. Nếu đã đăng nhập mà cố vào Login/Register -> Đá về Dashboard
  if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    return next('/dashboard');
  }

  // 3. Kiểm tra quyền Admin (Chỉ chạy khi vào route Admin)
  if (to.meta.requiresAdmin) {
    try {
      // Gọi API validate để check role
      const data = await apiRequest('/user/validate');
      
      if (data.isAdmin || data.role === 'admin') { // Check kỹ trường role
        return next();
      } else {
        // Không phải admin -> Về dashboard
        return next('/dashboard');
      }
    } catch (error) {
      // Token lỗi hoặc hết hạn -> Xóa token và về login
      console.error('Admin check failed:', error);
      localStorage.clear();
      return next('/login');
    }
  }

  // Cho phép đi tiếp
  next();
});

export default router;