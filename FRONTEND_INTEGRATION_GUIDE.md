# Frontend.js Integration Guide

## Overview

This file (`frontend.js`) consolidates the frontend router and UI logic from `Frontend_Router.html` and `Frontend_UI.html`, replacing all `google.script.run` calls with a fetch-based API that POSTs to `/api/{functionName}` with JSON payloads.

## Quick Start

### 1. Include in Your HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>R2 Assessoria</title>
  <!-- Include Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'r2-primary': '#3EA4D4',
            'r2-primary-dark': '#3DA4CC',
            'r2-secondary': '#247DAA',
            'r2-bg': '#D7E1E7',
            'r2-text': '#1C3C59',
            'r2-text-body': '#455C74',
            'r2-text-muted': '#728396',
          }
        }
      }
    }
  </script>
</head>
<body>
  <div id="app"></div>
  
  <!-- Include frontend.js -->
  <script src="frontend.js"></script>
  
  <!-- Initialize -->
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      window.initApp();
    });
  </script>
</body>
</html>
```

### 2. Backend API Requirements

Your backend must expose endpoints at `/api/{functionName}` that:
- Accept POST requests
- Expect JSON payload: `{ "args": [...] }`
- Return JSON responses: `{ "success": true/false, ... }`

Example endpoints needed:
- `/api/apiVerifyToken` - Verify authentication token
- `/api/apiLogin` - User login
- `/api/apiProfDashboardStats` - Dashboard statistics
- `/api/apiListarAlunos` - List students
- `/api/apiGetAluno` - Get student details
- `/api/apiCadastrarAluno` - Register student
- `/api/apiAtualizarAluno` - Update student
- `/api/apiAtualizarStatusAluno` - Update student status
- `/api/apiAlunoDashboard` - Student dashboard data

## API Layer

### apiFetch(url, options)

Low-level fetch wrapper with JSON handling and error propagation.

```javascript
apiFetch('/api/apiLogin', {
  method: 'POST',
  body: JSON.stringify({ args: ['user@example.com', 'password'] })
})
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### callAPI(functionName, args)

High-level API caller that automatically formats requests.

```javascript
// Login
callAPI('apiLogin', ['user@example.com', 'password'])
  .then(response => {
    if (response.success) {
      console.log('Logged in:', response.user);
    }
  });

// List students (with token)
callAPI('apiListarAlunos', [token])
  .then(response => {
    if (response.success) {
      console.log('Students:', response.alunos);
    }
  });
```

**Note**: The first argument in most API calls should be the authentication token.

## Global Functions

All these functions are exposed on `window` for inline HTML usage:

### Core Functions

- **`window.initApp()`** - Initialize the application (600ms splash, then login or dashboard)
- **`window.showAlunos()`** - Show students list
- **`window.viewAluno(alunoId)`** - Show student details
- **`window.editAluno(alunoId)`** - Show edit student form
- **`window.handleCadastroAluno(event)`** - Handle new student form submission
- **`window.handleSalvarEdicaoAluno()`** - Handle student edit save
- **`window.toggleAlunoStatus(alunoId, isChecked)`** - Toggle student active/inactive status

### Helper Functions

- **`window.showToast(message, type)`** - Show notification (types: 'info', 'success', 'error')
- **`window.showCadastroAluno()`** - Show new student form
- **`window.callAPI(functionName, args)`** - Make API call
- **`window.apiFetch(url, options)`** - Low-level fetch wrapper

### State Access

- **`window.AppState`** - Global application state object

```javascript
// Access current user
console.log(window.AppState.user);

// Access token
console.log(window.AppState.token);
```

## Application State

The `AppState` object contains:

```javascript
{
  token: null,              // Authentication token
  user: null,               // Current user object
  currentView: 'login',     // Current view name
  aluno: null,              // Current student (for student view)
  nextAlunoTab: null,       // Next student tab to show
  nextAlunoSection: null,   // Next student section to scroll to
  profViewingAlunoId: null, // Professor viewing student ID
  landingPrevSection: null, // Previous landing section
  campaignHeroUrl: null,    // Campaign hero image URL
  alunoData: null           // Student dashboard data cache
}
```

## Templates

All templates are minimized but maintain required IDs and classes:

### Available Templates (Internal)

- `getSplashScreenTemplate()` - Splash screen (600ms)
- `getLoginTemplate()` - Login form
- `getProfessorDashboardTemplate()` - Professor dashboard
- `getAlunosListTemplate(alunos)` - Students table
- `getAlunoDetailTemplate(aluno)` - Student details view
- `getCadastroAlunoTemplate()` - New student form
- `getEditAlunoTemplate(aluno)` - Edit student form
- `getAlunoLandingTemplate()` - Student landing page
- `getLoadingTemplate(message)` - Loading spinner

## Usage Examples

### Show a notification

```javascript
window.showToast('Operação realizada com sucesso!', 'success');
window.showToast('Erro ao processar solicitação', 'error');
window.showToast('Carregando dados...', 'info');
```

### Navigate to students list

```html
<button onclick="window.showAlunos()">Ver Alunos</button>
```

### View specific student

```html
<button onclick="window.viewAluno('123')">Ver Detalhes</button>
```

### Toggle student status

```html
<input type="checkbox" 
       data-aluno-id="123" 
       onchange="window.toggleAlunoStatus('123', this.checked)">
```

### Custom API call

```javascript
window.callAPI('customFunction', [token, param1, param2])
  .then(response => {
    if (response.success) {
      console.log('Success:', response);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    window.showToast('Erro na operação', 'error');
  });
```

## Authentication Flow

1. **Initial Load**: `initApp()` checks for saved token in localStorage
2. **Token Verification**: Calls `/api/apiVerifyToken` with saved token
3. **Success**: Routes to appropriate dashboard (MASTER → Professor, ALUNO → Student)
4. **Failure**: Shows login screen
5. **Login**: Saves token to localStorage and AppState
6. **Logout**: Clears token and returns to login

## Error Handling

All API calls include:
- Error logging to console
- Toast notifications for user feedback
- Fallback error messages
- Safe DOM element access with null checks

## Customization

### Change Splash Duration

Edit line ~173 in `frontend.js`:

```javascript
}, 600);  // Change to desired milliseconds
```

### Add New Templates

Templates follow this pattern:

```javascript
function getMyTemplate() {
  return `
    <div class="bg-white p-6 rounded-xl shadow">
      <h2 class="text-2xl font-semibold mb-4">My Template</h2>
      <!-- Content -->
    </div>
  `;
}
```

### Add New Global Functions

At the end of the file:

```javascript
window.myNewFunction = myNewFunction;
```

## Testing

A test HTML file is provided (`test-frontend.html`) with mock API responses. To test:

1. Open `test-frontend.html` in a browser
2. Check browser console for logs
3. Test login flow (any credentials work with mock)
4. Navigate through the application

## Browser Compatibility

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Requires: fetch API, Promises, ES6 syntax, localStorage
- Uses: Tailwind CSS for styling

## Security Notes

1. Tokens are masked in console logs (first 8 + last 6 chars shown)
2. Passwords should be transmitted over HTTPS only
3. Token stored in localStorage (consider httpOnly cookies for production)
4. Input validation should be implemented server-side

## Troubleshooting

### "app element not found"
Ensure your HTML has `<div id="app"></div>`

### API calls fail
Check browser console for network errors. Verify backend endpoints are accessible.

### Templates not rendering
Check console for JavaScript errors. Verify Tailwind CSS is loaded.

### Token persists after logout
Clear localStorage: `localStorage.clear()`

## File Information

- **Size**: ~37KB
- **Lines**: 1,168
- **Functions**: 30+
- **Templates**: 10+
- **Format**: Plain JavaScript (IIFE wrapped)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend API responses match expected format
3. Test with `test-frontend.html` and mock responses
4. Review this guide for usage examples

---

**Created for**: R2 Assessoria Esportiva  
**Version**: 1.0  
**Date**: October 2025
