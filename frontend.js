(function() {
/**
 * R2 Assessoria Esportiva - Frontend Application
 * Consolidated router + UI with fetch-based API integration
 * Replaces google.script.run with fetch API calls to /api/{functionName}
 */

'use strict';

// ========================================
// GLOBAL STATE
// ========================================

const AppState = {
  token: null,
  user: null,
  currentView: 'login',
  aluno: null,
  nextAlunoTab: null,
  nextAlunoSection: null,
  profViewingAlunoId: null,
  landingPrevSection: null,
  campaignHeroUrl: null,
  alunoData: null
};

// ========================================
// API LAYER
// ========================================

/**
 * Fetch wrapper with JSON handling and error propagation
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
function apiFetch(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  return fetch(url, defaultOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .catch(error => {
      console.error('[apiFetch] Error:', error);
      throw error;
    });
}

/**
 * Call API endpoint with JSON payload
 * @param {string} functionName - The API function name
 * @param {Array} args - Arguments array
 * @returns {Promise<any>} API response
 */
function callAPI(functionName, args = []) {
  const startedAt = Date.now();
  const tokenArg = args && args.length > 0 ? args[0] : null;
  const maskedToken = tokenArg 
    ? (String(tokenArg).slice(0, 8) + '...' + String(tokenArg).slice(-6)) 
    : 'null';
  
  console.debug(`[callAPI] → ${functionName} args0(token)=${maskedToken}`);

  const url = `/api/${functionName}`;
  const payload = { args: args };

  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
    .then(res => {
      const elapsed = Date.now() - startedAt;
      console.debug(`[callAPI] ← ${functionName} elapsed=${elapsed}ms res=`, res);
      return res;
    })
    .catch(err => {
      const elapsed = Date.now() - startedAt;
      console.error(`[callAPI] x ${functionName} elapsed=${elapsed}ms err=`, err);
      throw err;
    });
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'info', 'success', 'error'
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.position = 'fixed';
    container.style.right = '16px';
    container.style.bottom = '16px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.background = type === 'success' ? '#2e7d32' : (type === 'error' ? '#c62828' : '#424242');
  toast.style.color = '#fff';
  toast.style.padding = '10px 14px';
  toast.style.marginTop = '8px';
  toast.style.borderRadius = '6px';
  toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  toast.style.fontSize = '14px';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity .2s ease';
  
  container.appendChild(toast);
  
  requestAnimationFrame(() => { toast.style.opacity = '1'; });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { 
      if (toast.parentNode === container) {
        container.removeChild(toast); 
      }
    }, 200);
  }, 2000);
}

// ========================================
// INITIALIZATION & ROUTING
// ========================================

/**
 * Initialize the application
 */
function initApp() {
  showSplashScreen();
  
  // Reduced splash time to 600ms as requested
  setTimeout(() => {
    const savedToken = localStorage.getItem('r2_token');
    
    if (savedToken) {
      callAPI('apiVerifyToken', [savedToken])
        .then(response => {
          if (response && response.success) {
            AppState.token = savedToken;
            AppState.user = response.user;
            hideSplashScreen(() => routeByProfile(response.user.Perfil));
          } else {
            hideSplashScreen(() => showLogin());
          }
        })
        .catch(error => {
          console.error('Error verifying token:', error);
          hideSplashScreen(() => showLogin());
        });
    } else {
      hideSplashScreen(() => showLogin());
    }
  }, 600);
}

/**
 * Show splash screen
 */
function showSplashScreen() {
  const app = document.getElementById('app');
  if (!app) {
    console.error('[showSplashScreen] #app element not found');
    return;
  }
  
  app.innerHTML = getSplashScreenTemplate();
  
  requestAnimationFrame(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) {
      splash.style.opacity = '1';
    }
  });
}

/**
 * Hide splash screen with fade out
 * @param {Function} callback - Callback to execute after hiding
 */
function hideSplashScreen(callback) {
  const splash = document.getElementById('splashScreen');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(() => {
      if (callback) callback();
    }, 500);
  } else {
    if (callback) callback();
  }
}

/**
 * Route to view based on user profile
 * @param {string} perfil - User profile type
 */
function routeByProfile(perfil) {
  if (perfil === 'MASTER') {
    showProfessorDashboard();
  } else if (perfil === 'ALUNO') {
    showAlunoLanding();
  } else {
    showLogin();
  }
}

/**
 * Show login screen
 */
function showLogin() {
  AppState.currentView = 'login';
  const app = document.getElementById('app');
  if (!app) return;
  
  app.innerHTML = getLoginTemplate();
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  const forgotLink = document.querySelector('.forgot-link');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Funcionalidade em desenvolvimento. Entre em contato com o suporte.', 'info');
    });
  }
}

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email')?.value;
  const senha = document.getElementById('senha')?.value;
  const errorDiv = document.getElementById('errorMessage');
  const submitBtn = document.getElementById('submitBtn');
  
  if (!email || !senha) {
    if (errorDiv) {
      errorDiv.textContent = 'Por favor, preencha todos os campos.';
      errorDiv.style.display = 'block';
    }
    return;
  }
  
  if (errorDiv) {
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
  }
  
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando...';
  }
  
  callAPI('apiLogin', [email, senha])
    .then(response => {
      if (response && response.success) {
        AppState.token = response.token;
        AppState.user = response.user;
        localStorage.setItem('r2_token', response.token);
        
        showToast('Login realizado com sucesso!', 'success');
        setTimeout(() => routeByProfile(response.user.Perfil), 300);
      } else {
        throw new Error('Credenciais inválidas');
      }
    })
    .catch(error => {
      console.error('Login error:', error);
      const msg = error.message || 'Credenciais inválidas. Tente novamente.';
      if (errorDiv) {
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
      }
      showToast(msg, 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Entrar';
      }
    });
}

/**
 * Handle logout
 */
function handleLogout() {
  AppState.token = null;
  AppState.user = null;
  localStorage.removeItem('r2_token');
  showLogin();
}

// ========================================
// PROFESSOR DASHBOARD
// ========================================

/**
 * Show professor dashboard
 */
function showProfessorDashboard() {
  AppState.currentView = 'professor-dashboard';
  const app = document.getElementById('app');
  if (!app) return;
  
  app.innerHTML = getProfessorDashboardTemplate();
  
  loadDashboardStats();
  setupNavigation();
}

/**
 * Load dashboard statistics
 */
function loadDashboardStats() {
  const loadingDiv = document.getElementById('statsLoading');
  const statsContainer = document.getElementById('statsContainer');
  
  if (!loadingDiv || !statsContainer) {
    console.warn('[loadDashboardStats] Elements not found');
    return;
  }
  
  loadingDiv.style.display = 'block';
  
  callAPI('apiProfDashboardStats', [AppState.token])
    .then(response => {
      if (response && response.success) {
        const stats = response.stats || {};
        
        const totalAlunosEl = document.getElementById('totalAlunos');
        const alunosAtivosEl = document.getElementById('alunosAtivos');
        const totalAvaliacoesEl = document.getElementById('totalAvaliacoes');
        const totalTreinosEl = document.getElementById('totalTreinos');
        
        if (totalAlunosEl) totalAlunosEl.textContent = stats.totalAlunos || 0;
        if (alunosAtivosEl) alunosAtivosEl.textContent = stats.alunosAtivos || 0;
        if (totalAvaliacoesEl) totalAvaliacoesEl.textContent = stats.totalAvaliacoes || 0;
        if (totalTreinosEl) totalTreinosEl.textContent = stats.totalTreinos || 0;
        
        loadingDiv.style.display = 'none';
        statsContainer.style.display = 'grid';
        showToast('Dashboard atualizado.', 'info');
      }
    })
    .catch(error => {
      console.error('Error loading stats:', error);
      if (loadingDiv) {
        loadingDiv.innerHTML = '<p>Erro ao carregar estatísticas.</p>';
      }
      showToast('Erro ao carregar estatísticas.', 'error');
    });
}

/**
 * Setup navigation handlers
 */
function setupNavigation() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
  
  const navItems = document.querySelectorAll('[data-view]');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove('active');
      }
      
      const view = item.getAttribute('data-view');
      navigateTo(view);
    });
  });
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

/**
 * Navigate to specific view
 * @param {string} view - View name
 */
function navigateTo(view) {
  switch(view) {
    case 'dashboard':
      showProfessorDashboard();
      break;
    case 'alunos':
      showAlunos();
      break;
    case 'cadastro-aluno':
      showCadastroAluno();
      break;
    default:
      console.log('View not implemented:', view);
      showToast('Funcionalidade em desenvolvimento', 'info');
  }
}

// ========================================
// ALUNOS MODULE
// ========================================

/**
 * Show list of alunos
 */
function showAlunos() {
  const mainContent = document.querySelector('.content-area');
  if (!mainContent) {
    console.error('[showAlunos] .content-area not found');
    return;
  }
  
  mainContent.innerHTML = getLoadingTemplate('Carregando alunos...');
  
  callAPI('apiListarAlunos', [AppState.token])
    .then(response => {
      if (!response || response.success !== true) {
        const msg = (response && response.error) ? response.error : 'Resposta inválida do servidor';
        throw new Error(msg);
      }
      
      mainContent.innerHTML = getAlunosListTemplate(response.alunos || []);
    })
    .catch(error => {
      console.error('Error loading alunos:', error);
      mainContent.innerHTML = '<div class="card"><p>Erro ao carregar alunos.</p></div>';
      showToast('Erro ao carregar alunos.', 'error');
    });
}

/**
 * View aluno details
 * @param {string} alunoId - Aluno ID
 */
function viewAluno(alunoId) {
  console.log('[viewAluno] alunoId:', alunoId);
  
  const mainContent = document.querySelector('.content-area');
  if (!mainContent) return;
  
  mainContent.innerHTML = getLoadingTemplate('Carregando detalhes...');
  
  callAPI('apiGetAluno', [AppState.token, alunoId])
    .then(response => {
      if (!response || response.success !== true) {
        const msg = (response && response.error) ? response.error : 'Erro ao carregar aluno';
        throw new Error(msg);
      }
      
      const aluno = response.aluno;
      mainContent.innerHTML = getAlunoDetailTemplate(aluno);
    })
    .catch(error => {
      console.error('Error loading aluno:', error);
      mainContent.innerHTML = `
        <div class="card">
          <p>Erro ao carregar aluno: ${error.message}</p>
          <button class="btn btn-secondary" onclick="showAlunos()">Voltar</button>
        </div>
      `;
    });
}

/**
 * Edit aluno
 * @param {string} alunoId - Aluno ID
 */
function editAluno(alunoId) {
  const mainContent = document.querySelector('.content-area');
  if (!mainContent) return;
  
  mainContent.innerHTML = getLoadingTemplate('Carregando...');
  
  callAPI('apiGetAluno', [AppState.token, alunoId])
    .then(res => {
      if (!res || res.success !== true) {
        throw new Error(res?.error || 'Erro ao carregar aluno');
      }
      mainContent.innerHTML = getEditAlunoTemplate(res.aluno);
    })
    .catch(err => {
      mainContent.innerHTML = `<div class="card"><p>Erro: ${err.message || err}</p><button class="btn btn-secondary" onclick="showAlunos()">Voltar</button></div>`;
    });
}

/**
 * Show cadastro aluno form
 */
function showCadastroAluno() {
  const mainContent = document.querySelector('.content-area');
  if (!mainContent) return;
  
  mainContent.innerHTML = getCadastroAlunoTemplate();
  
  const form = document.getElementById('cadastroAlunoForm');
  if (form) {
    form.addEventListener('submit', handleCadastroAluno);
  }
}

/**
 * Handle cadastro aluno form submission
 * @param {Event} e - Form event
 */
function handleCadastroAluno(e) {
  e.preventDefault();
  
  const formEl = e.target;
  if (formEl.dataset.submitting === 'true') {
    return;
  }
  formEl.dataset.submitting = 'true';
  
  const formData = new FormData(e.target);
  const dadosAluno = {};
  
  for (let [key, value] of formData.entries()) {
    dadosAluno[key] = value;
  }
  
  const submitBtn = document.getElementById('submitBtn');
  const successDiv = document.getElementById('successMessage');
  const errorDiv = document.getElementById('errorMessage');
  
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Cadastrando...';
  }
  if (successDiv) successDiv.style.display = 'none';
  if (errorDiv) errorDiv.style.display = 'none';
  
  callAPI('apiCadastrarAluno', [AppState.token, dadosAluno])
    .then(response => {
      if (response && response.success) {
        if (successDiv) {
          successDiv.textContent = response.message || 'Aluno cadastrado com sucesso!';
          successDiv.style.display = 'block';
        }
        showToast('Aluno cadastrado com sucesso!', 'success');
        e.target.reset();
        
        setTimeout(() => {
          showAlunos();
        }, 1000);
      } else {
        const base = response?.error || 'Erro ao cadastrar aluno.';
        if (errorDiv) {
          errorDiv.textContent = base;
          errorDiv.style.display = 'block';
        }
        showToast(base, 'error');
      }
    })
    .catch(error => {
      console.error('Error cadastrando aluno:', error);
      const msg = error.message || 'Erro ao cadastrar aluno.';
      if (errorDiv) {
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
      }
      showToast(msg, 'error');
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Cadastrar Aluno';
      }
      delete formEl.dataset.submitting;
    });
}

/**
 * Handle save aluno edit
 */
function handleSalvarEdicaoAluno() {
  const form = document.getElementById('editarAlunoForm');
  if (!form) return;
  
  const alunoId = form.getAttribute('data-aluno-id');
  const payload = {
    NomeCompleto: document.getElementById('ed_NomeCompleto')?.value || '',
    Email: document.getElementById('ed_Email')?.value || '',
    Telefone: document.getElementById('ed_Telefone')?.value || '',
    StatusAluno: document.getElementById('ed_StatusAluno')?.checked ? 'Ativo' : 'Inativo'
  };
  
  const successDiv = document.getElementById('successMessage');
  const errorDiv = document.getElementById('errorMessage');
  const btn = document.getElementById('btnSalvarEdicao');
  
  if (successDiv) successDiv.style.display = 'none';
  if (errorDiv) errorDiv.style.display = 'none';
  if (btn) {
    btn.disabled = true;
    const t = btn.querySelector('.btn-text');
    if (t) t.textContent = 'Salvando...';
  }
  
  callAPI('apiAtualizarAluno', [AppState.token, alunoId, payload])
    .then(res => {
      if (!res || res.success !== true) {
        throw new Error(res?.error || 'Falha ao salvar alterações');
      }
      if (successDiv) {
        successDiv.textContent = 'Aluno atualizado com sucesso.';
        successDiv.style.display = 'block';
      }
      showToast('Alterações salvas com sucesso.', 'success');
      setTimeout(() => showAlunos(), 1000);
    })
    .catch(err => {
      if (errorDiv) {
        errorDiv.textContent = err.message || 'Erro ao salvar alterações.';
        errorDiv.style.display = 'block';
      }
      showToast(err.message || 'Erro ao salvar alterações.', 'error');
    })
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        const t = btn.querySelector('.btn-text');
        if (t) t.textContent = 'Salvar Alterações';
      }
    });
}

/**
 * Toggle aluno status
 * @param {string} alunoId - Aluno ID
 * @param {boolean} isChecked - New status
 */
function toggleAlunoStatus(alunoId, isChecked) {
  const status = isChecked ? 'Ativo' : 'Inativo';
  const row = document.querySelector(`[data-aluno-id="${alunoId}"]`)?.closest('tr');
  const cellDiv = row ? row.querySelector('td .status-cell') : null;
  const chk = document.querySelector(`input[data-aluno-id="${alunoId}"]`);
  
  if (cellDiv) cellDiv.classList.add('loading');
  if (chk) chk.disabled = true;
  
  callAPI('apiAtualizarStatusAluno', [AppState.token, alunoId, status])
    .then(res => {
      if (!res || res.success !== true) {
        throw new Error(res?.error || 'Falha ao atualizar status');
      }
      if (row) {
        const statusLabel = row.querySelector('td .status-text');
        if (statusLabel) statusLabel.textContent = status;
      }
      showToast('Status atualizado para ' + status + '.', 'success');
    })
    .catch(err => {
      showToast('Erro ao atualizar status: ' + (err.message || err), 'error');
      if (chk) chk.checked = !isChecked;
    })
    .finally(() => {
      if (cellDiv) cellDiv.classList.remove('loading');
      if (chk) chk.disabled = false;
    });
}

// ========================================
// ALUNO LANDING (Student view)
// ========================================

/**
 * Show aluno landing page
 */
function showAlunoLanding() {
  AppState.currentView = 'aluno-landing';
  const app = document.getElementById('app');
  if (!app) return;
  
  app.innerHTML = getAlunoLandingTemplate();
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  callAPI('apiAlunoDashboard', [AppState.token])
    .then(res => {
      if (!res || res.success !== true) {
        throw new Error(res?.error || 'Falha ao carregar dados');
      }
      
      AppState.aluno = res.aluno || null;
      AppState.alunoData = {
        avaliacoes: res.avaliacoes || [],
        treinos: res.treinos || [],
        aluno: res.aluno || {}
      };
      
      const n = document.getElementById('landingAlunoNome');
      const e = document.getElementById('landingAlunoEmail');
      const s = document.getElementById('landingAlunoStatus');
      
      if (n) n.textContent = res.aluno?.NomeCompleto || 'Não informado';
      if (e) e.textContent = res.aluno?.Email || 'Não informado';
      if (s) s.textContent = res.aluno?.StatusAluno || 'Inativo';
    })
    .catch(err => {
      console.error('[showAlunoLanding] error:', err);
      const main = document.getElementById('app');
      if (main) {
        main.innerHTML = '<div class="card"><p>Erro ao carregar seus dados.</p></div>';
      }
    });
}

// ========================================
// CHART STUBS (Placeholders)
// ========================================

/**
 * Initialize evolution charts (stub)
 * @param {Array} avaliacoes - Evaluations data
 * @param {Array} treinos - Training data
 * @param {Object} aluno - Student data
 */
function initializeEvolucaoCharts(avaliacoes, treinos, aluno) {
  console.log('[initializeEvolucaoCharts] Stub - charts not implemented');
  // Placeholder for chart initialization
  // Would use Chart.js in real implementation
}

// ========================================
// TEMPLATES (Minimized)
// ========================================

/**
 * Get splash screen template
 */
function getSplashScreenTemplate() {
  return `
    <div class="fixed inset-0 bg-r2-bg flex items-center justify-center z-50 transition-opacity duration-500" id="splashScreen" style="opacity: 0;">
      <div class="flex flex-col items-center justify-center space-y-6 p-8">
        <div class="mb-4">
          <div class="w-32 h-32 rounded-full bg-r2-primary flex items-center justify-center text-white text-4xl font-bold">R2</div>
        </div>
        <h1 class="text-4xl font-bold text-r2-text mt-4 text-center">R2 Assessoria Esportiva</h1>
        <p class="text-lg text-r2-text-body text-center">Transformando vidas através do movimento</p>
        <div class="mt-8">
          <div class="w-12 h-12 border-4 border-r2-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get login template
 */
function getLoginTemplate() {
  return `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-r2-bg to-blue-50 p-4">
      <div class="w-full max-w-md">
        <div class="bg-white p-8 space-y-6 rounded-2xl shadow-2xl border border-gray-100">
          <div class="text-center">
            <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-r2-primary flex items-center justify-center text-white text-3xl font-bold">R2</div>
            <h1 class="text-3xl font-bold text-r2-text">R2 Assessoria Esportiva</h1>
          </div>
          
          <div id="errorMessage" style="display: none;" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"></div>
          
          <form id="loginForm" class="space-y-5">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-r2-text" for="email">Email</label>
              <input type="email" id="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-r2-primary focus:border-r2-primary transition duration-150 outline-none" required>
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-r2-text" for="senha">Senha</label>
              <input type="password" id="senha" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-r2-primary focus:border-r2-primary transition duration-150 outline-none" required>
            </div>
            
            <button type="submit" id="submitBtn" class="w-full py-3 px-4 rounded-lg text-white font-semibold bg-r2-primary hover:bg-r2-primary-dark transition duration-200 shadow-lg hover:shadow-xl">
              Entrar
            </button>
            
            <div class="text-center">
              <a href="#" class="text-sm text-r2-primary hover:text-r2-secondary transition duration-150 forgot-link">Esqueci minha senha</a>
            </div>
          </form>
          
          <div class="text-center text-xs text-r2-text-muted pt-4 border-t border-gray-100">
            © 2025 R2 Assessoria Esportiva
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get professor dashboard template
 */
function getProfessorDashboardTemplate() {
  return `
    <div class="flex min-h-screen bg-gray-100">
      <aside class="w-64 bg-white shadow-lg" id="sidebar">
        <div class="p-6 border-b">
          <div class="w-20 h-20 mx-auto rounded-full bg-r2-primary flex items-center justify-center text-white text-2xl font-bold mb-3">R2</div>
          <h2 class="text-xl font-medium text-center">R2 Assessoria</h2>
        </div>
        
        <nav class="py-5">
          <a href="#" class="flex items-center px-6 py-3 hover:bg-gray-100 text-gray-700" data-view="dashboard">
            <span class="mr-4">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" class="flex items-center px-6 py-3 hover:bg-gray-100 text-gray-700" data-view="alunos">
            <span class="mr-4">👥</span>
            <span>Alunos</span>
          </a>
          <a href="#" class="flex items-center px-6 py-3 hover:bg-gray-100 text-gray-700" data-view="cadastro-aluno">
            <span class="mr-4">➕</span>
            <span>Novo Aluno</span>
          </a>
        </nav>
      </aside>
      
      <main class="flex-1 p-6">
        <div class="bg-white p-5 rounded-lg mb-6 shadow flex justify-between items-center">
          <h1 class="text-3xl font-medium">Gestão</h1>
          <div class="flex gap-3 items-center">
            <span>${AppState.user?.NomeCompleto || 'Usuário'}</span>
            <button class="px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600" id="logoutBtn">Sair</button>
          </div>
        </div>
        
        <div class="content-area">
          <div id="statsLoading" class="text-center p-12">
            <div class="w-12 h-12 border-4 border-r2-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Carregando estatísticas...</p>
          </div>
          
          <div id="statsContainer" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6" style="display: none;">
            <div class="bg-white p-6 rounded-xl shadow">
              <div class="text-sm text-gray-500">Total de Alunos</div>
              <div class="text-3xl font-bold" id="totalAlunos">0</div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow">
              <div class="text-sm text-gray-500">Alunos Ativos</div>
              <div class="text-3xl font-bold" id="alunosAtivos">0</div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow">
              <div class="text-sm text-gray-500">Avaliações</div>
              <div class="text-3xl font-bold" id="totalAvaliacoes">0</div>
            </div>
            <div class="bg-white p-6 rounded-xl shadow">
              <div class="text-sm text-gray-500">Treinos</div>
              <div class="text-3xl font-bold" id="totalTreinos">0</div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow">
            <h2 class="text-2xl font-semibold mb-3">Bem-vindo ao Sistema R2</h2>
            <p>Use o menu lateral para navegar.</p>
          </div>
        </div>
      </main>
    </div>
  `;
}

/**
 * Get loading template
 * @param {string} message - Loading message
 */
function getLoadingTemplate(message = 'Carregando...') {
  return `
    <div class="flex flex-col items-center justify-center p-12">
      <div class="w-12 h-12 border-4 border-r2-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Get alunos list template
 * @param {Array} alunos - List of alunos
 */
function getAlunosListTemplate(alunos) {
  let rows = '';
  
  if (!alunos || alunos.length === 0) {
    rows = '<tr><td colspan="4" class="text-center py-4">Nenhum aluno cadastrado.</td></tr>';
  } else {
    alunos.forEach(aluno => {
      rows += `
        <tr>
          <td class="px-4 py-3">${aluno.NomeCompleto || '-'}</td>
          <td class="px-4 py-3">${aluno.Email || '-'}</td>
          <td class="px-4 py-3">${aluno.Telefone || '-'}</td>
          <td class="px-4 py-3">
            <button class="px-3 py-1 bg-r2-primary text-white rounded hover:bg-r2-secondary" onclick="viewAluno('${aluno.ID_Aluno}')">
              Ver
            </button>
            <button class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2" onclick="editAluno('${aluno.ID_Aluno}')">
              Editar
            </button>
          </td>
        </tr>
      `;
    });
  }
  
  return `
    <div class="bg-white p-6 rounded-xl shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">Alunos</h2>
        <button class="px-4 py-2 bg-r2-primary text-white rounded hover:bg-r2-secondary" onclick="showCadastroAluno()">
          Novo Aluno
        </button>
      </div>
      
      <table class="w-full">
        <thead>
          <tr class="border-b">
            <th class="px-4 py-3 text-left">Nome</th>
            <th class="px-4 py-3 text-left">Email</th>
            <th class="px-4 py-3 text-left">Telefone</th>
            <th class="px-4 py-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Get aluno detail template
 * @param {Object} aluno - Aluno data
 */
function getAlunoDetailTemplate(aluno) {
  return `
    <div class="bg-white p-6 rounded-xl shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold">Detalhes do Aluno</h2>
        <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onclick="showAlunos()">
          Voltar
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="font-semibold">Nome Completo:</p>
          <p>${aluno.NomeCompleto || '-'}</p>
        </div>
        <div>
          <p class="font-semibold">Email:</p>
          <p>${aluno.Email || '-'}</p>
        </div>
        <div>
          <p class="font-semibold">Telefone:</p>
          <p>${aluno.Telefone || '-'}</p>
        </div>
        <div>
          <p class="font-semibold">Status:</p>
          <p>${aluno.StatusAluno || '-'}</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get cadastro aluno template
 */
function getCadastroAlunoTemplate() {
  return `
    <div class="bg-white p-6 rounded-xl shadow">
      <h2 class="text-2xl font-semibold mb-4">Cadastrar Aluno</h2>
      
      <div id="successMessage" style="display: none;" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4"></div>
      <div id="errorMessage" style="display: none;" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4"></div>
      
      <form id="cadastroAlunoForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nome Completo</label>
          <input type="text" name="NomeCompleto" class="w-full px-4 py-2 border rounded-lg" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input type="email" name="Email" class="w-full px-4 py-2 border rounded-lg" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Telefone</label>
          <input type="text" name="Telefone" class="w-full px-4 py-2 border rounded-lg">
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Data de Nascimento</label>
          <input type="date" name="DataNascimento" class="w-full px-4 py-2 border rounded-lg">
        </div>
        
        <div class="flex gap-3">
          <button type="submit" id="submitBtn" class="px-6 py-2 bg-r2-primary text-white rounded-lg hover:bg-r2-secondary">
            Cadastrar Aluno
          </button>
          <button type="button" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600" onclick="showAlunos()">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `;
}

/**
 * Get edit aluno template
 * @param {Object} aluno - Aluno data
 */
function getEditAlunoTemplate(aluno) {
  return `
    <div class="bg-white p-6 rounded-xl shadow">
      <h2 class="text-2xl font-semibold mb-4">Editar Aluno</h2>
      
      <div id="successMessage" style="display: none;" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4"></div>
      <div id="errorMessage" style="display: none;" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4"></div>
      
      <form id="editarAlunoForm" data-aluno-id="${aluno.ID_Aluno}" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nome Completo</label>
          <input type="text" id="ed_NomeCompleto" value="${aluno.NomeCompleto || ''}" class="w-full px-4 py-2 border rounded-lg" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input type="email" id="ed_Email" value="${aluno.Email || ''}" class="w-full px-4 py-2 border rounded-lg" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">Telefone</label>
          <input type="text" id="ed_Telefone" value="${aluno.Telefone || ''}" class="w-full px-4 py-2 border rounded-lg">
        </div>
        
        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="ed_StatusAluno" ${aluno.StatusAluno === 'Ativo' ? 'checked' : ''}>
            <span>Status Ativo</span>
          </label>
        </div>
        
        <div class="flex gap-3">
          <button type="button" id="btnSalvarEdicao" class="px-6 py-2 bg-r2-primary text-white rounded-lg hover:bg-r2-secondary" onclick="handleSalvarEdicaoAluno()">
            <span class="btn-text">Salvar Alterações</span>
          </button>
          <button type="button" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600" onclick="showAlunos()">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `;
}

/**
 * Get aluno landing template
 */
function getAlunoLandingTemplate() {
  return `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-r2-primary">R2 Assessoria</h1>
          <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" id="logoutBtn">
            Sair
          </button>
        </div>
      </header>
      
      <main class="max-w-7xl mx-auto px-4 py-8">
        <div class="bg-white p-6 rounded-xl shadow mb-6">
          <h2 class="text-xl font-semibold mb-4">Meu Perfil</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-gray-500">Nome</p>
              <p id="landingAlunoNome" class="font-medium">-</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Email</p>
              <p id="landingAlunoEmail" class="font-medium">-</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <p id="landingAlunoStatus" class="font-medium">-</p>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-xl shadow">
            <h3 class="text-lg font-semibold mb-3">Minhas Avaliações</h3>
            <p class="text-gray-600">Funcionalidade em desenvolvimento</p>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow">
            <h3 class="text-lg font-semibold mb-3">Meus Treinos</h3>
            <p class="text-gray-600">Funcionalidade em desenvolvimento</p>
          </div>
        </div>
      </main>
    </div>
  `;
}

// ========================================
// EXPOSE GLOBAL FUNCTIONS
// ========================================

window.initApp = initApp;
window.showAlunos = showAlunos;
window.viewAluno = viewAluno;
window.editAluno = editAluno;
window.handleCadastroAluno = handleCadastroAluno;
window.handleSalvarEdicaoAluno = handleSalvarEdicaoAluno;
window.toggleAlunoStatus = toggleAlunoStatus;
window.showCadastroAluno = showCadastroAluno;
window.showToast = showToast;
window.callAPI = callAPI;
window.apiFetch = apiFetch;
window.AppState = AppState;

})();
