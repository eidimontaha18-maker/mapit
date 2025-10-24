import './style.css';

import Login from './Login.vue';
import Register from './Register.vue';

const appDiv = document.querySelector<HTMLDivElement>('#app')!;

let currentView: 'login' | 'register' | 'main' = 'login';

function render() {
  if (currentView === 'login') {
    appDiv.innerHTML = `<div id="login-root"></div>`;
    mountVueComponent(Login, '#login-root', {
      onLogin: () => switchToMain(),
      onSwitch: (view: string) => switchView(view),
    });
  } else if (currentView === 'register') {
    appDiv.innerHTML = `<div id="register-root"></div>`;
    mountVueComponent(Register, '#register-root', {
      onRegister: () => switchToMain(),
      onSwitch: (view: string) => switchView(view),
    });
  } else {
    appDiv.innerHTML = `<h1>Welcome to the Main Page!</h1>`;
  }
}

function switchView(view: string) {
  if (view === 'login' || view === 'register') {
    currentView = view;
    render();
  }
}

function switchToMain() {
  currentView = 'main';
  render();
}

// Dummy mount function for Vue SFCs in Vite/TS (replace with real Vue app if using Vue)

// Use 'unknown' instead of 'any' and remove unused parameter warning
function mountVueComponent(_comp: unknown, selector: string, _props: unknown) {
  // _props is intentionally unused for placeholder
  document.querySelector(selector)!.innerHTML =
    '<div style="padding:2rem;text-align:center;">[Component Placeholder: Use Vue or React for real mounting]</div>';
}

render();
