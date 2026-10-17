const rules = {
  fullname: v => v.trim().length >= 3 || 'Enter your full name (at least 3 characters).',
  username: v => /^[a-z0-9_]{3,20}$/i.test(v) || 'Use 3-20 letters, numbers or underscores.',
  email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter a valid email, like name@example.com.',
  password: v => (v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)) || 'Use 8+ characters with a letter and a number.',
  loginPass:v => v.length > 0 || 'Enter your password.',
};

function setState(input, result) {
  const ok = result === true;
  input.classList.toggle('is-valid', ok);
  input.classList.toggle('is-invalid', !ok);
  const fb = input.parentElement.querySelector('.invalid-feedback')
          || input.closest('.mb-3')?.querySelector('.invalid-feedback');
  if (fb && !ok) fb.textContent = result;
  return ok;
}

document.querySelectorAll('[data-toggle-password]').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.togglePassword);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.querySelector('i').className = show ? 'bi bi-eye-slash' : 'bi bi-eye';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
});

const timers = {};

const dummyTaken = {
  username: ['admin', 'subha', 'test', 'user123'],
  email:    ['admin@example.com', 'test@example.com'],
};

function dummyCheck(field, value) {
  return new Promise(resolve => {
    setTimeout(() => {
      const exists = dummyTaken[field]?.includes(value.toLowerCase()) ?? false;
      const label  = field.charAt(0).toUpperCase() + field.slice(1);
      resolve({ exists, message: exists ? `${label} is already taken.` : `${label} is available.` });
    }, 300 + Math.random() * 200);  
  });
}

function checkAvailability(input, field) {
  const msg = document.getElementById(field + 'Msg');
  clearTimeout(timers[field]);

  if (rules[field](input.value) !== true) {
    msg.innerHTML = '';
    msg.className = 'check-msg';
    return Promise.resolve(false);
  }

  msg.className = 'check-msg ajax-checking';
  msg.innerHTML = '<span class="ajax-spinner"></span> Checking…';

  return new Promise(resolve => {
    timers[field] = setTimeout(async () => {
      let data;
      try {
        const res = await fetch(`php/check_user.php?field=${field}&value=${encodeURIComponent(input.value.trim())}`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        data = await res.json();
      } catch (_) {
        data = await dummyCheck(field, input.value.trim());
      }

      const icon = data.exists
        ? '<i class="bi bi-x-circle-fill"></i> '
        : '<i class="bi bi-check-circle-fill"></i> ';
      msg.className = 'check-msg ajax-result ' + (data.exists ? 'ajax-taken' : 'ajax-free');
      msg.innerHTML = icon + data.message;
      input.classList.toggle('is-invalid', data.exists);
      input.classList.toggle('is-valid', !data.exists);
      resolve(!data.exists);
    }, 400);
  });
}

function strengthOf(p) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function fail(form) {
  form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
  form.querySelector('.is-invalid')?.focus();
}

function fakeSubmit(btn, done) {
  const label = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Please wait…';
  setTimeout(() => { btn.disabled = false; btn.innerHTML = label; done(); }, 1200);
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  const email = loginForm.email, pass = loginForm.password;
  email.addEventListener('blur', () => setState(email, rules.email(email.value)));
  pass.addEventListener('blur', () => setState(pass, rules.loginPass(pass.value)));
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const ok = [setState(email, rules.email(email.value)), setState(pass, rules.loginPass(pass.value))].every(Boolean);
    if (!ok) return fail(loginForm);
    fakeSubmit(loginForm.querySelector('button[type=submit]'), () => {
      new bootstrap.Modal('#successModal').show();
      loginForm.reset();
      loginForm.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
      });
    });
  });
}

const regForm = document.getElementById('registerForm');
if (regForm) {
  const f = regForm, bar = document.getElementById('strengthBar');
  const colors = ['#c0392b', '#e67e22', '#F2B134', '#2F6B4F'];

  const matchCheck = () => setState(f.confirm,
    (f.confirm.value !== '' && f.confirm.value === f.password.value) || 'Passwords do not match.');

  f.fullname.addEventListener('blur', () => setState(f.fullname, rules.fullname(f.fullname.value)));
  f.username.addEventListener('input', () => checkAvailability(f.username, 'username'));
  f.email.addEventListener('input', () => checkAvailability(f.email, 'email'));
  f.username.addEventListener('blur', () => rules.username(f.username.value) !== true && setState(f.username, rules.username(f.username.value)));
  f.email.addEventListener('blur', () => rules.email(f.email.value) !== true && setState(f.email, rules.email(f.email.value)));
  f.password.addEventListener('input', () => {
    const s = strengthOf(f.password.value);
    bar.style.width = (s * 25) + '%'; bar.style.background = colors[Math.max(s - 1, 0)];
    setState(f.password, rules.password(f.password.value));
    if (f.confirm.value) matchCheck();
  });
  f.confirm.addEventListener('input', matchCheck);

  f.addEventListener('submit', async e => {
    e.preventDefault();
    const ok = [
      setState(f.fullname, rules.fullname(f.fullname.value)),
      setState(f.username, rules.username(f.username.value)),
      setState(f.email, rules.email(f.email.value)),
      setState(f.password, rules.password(f.password.value)),
      matchCheck(),
    ].every(Boolean);
    f.terms.classList.toggle('is-invalid', !f.terms.checked);
    const free = ok && await checkAvailability(f.username, 'username') && await checkAvailability(f.email, 'email');
    if (!ok || !f.terms.checked || !free) return fail(f);
    fakeSubmit(f.querySelector('button[type=submit]'), () => {
      new bootstrap.Modal('#successModal').show();
      f.reset();
      f.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
      });
      if (bar) { bar.style.width = '0'; }
      const uMsg = document.getElementById('usernameMsg');
      const eMsg = document.getElementById('emailMsg');
      if (uMsg) uMsg.textContent = '';
      if (eMsg) eMsg.textContent = '';
    });
  });
}

// ---------- Interactive AJAX Demo Modal (index.html) ----------
const demoModal = document.getElementById('demoModal');
if (demoModal) {
  const dUser = document.getElementById('demoUsername');
  const dEmail = document.getElementById('demoEmail');
  const dUserMsg = document.getElementById('demoUsernameMsg');
  const dEmailMsg = document.getElementById('demoEmailMsg');
  const logEl = document.getElementById('ajaxLog');
  const clearBtn = document.getElementById('clearLog');

  function logAjax(text, type = 'info') {
    if (!logEl) return;
    const time = new Date().toTimeString().split(' ')[0];
    const item = document.createElement('div');
    item.className = 'ajax-log-entry';
    const cls = type === 'taken' ? 'ajax-log-warn' : type === 'free' ? 'ajax-log-success' : 'text-muted';
    item.innerHTML = `<span class="ajax-log-time">[${time}]</span> <span class="${cls}">${text}</span>`;
    if (logEl.querySelector('.fst-italic')) logEl.innerHTML = '';
    logEl.prepend(item);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      logEl.innerHTML = '<span class="text-muted fst-italic">Log cleared. Waiting for requests…</span>';
    });
  }

  async function checkDemoField(input, field, msgEl) {
    const val = input.value.trim();
    if (!val) {
      msgEl.innerHTML = '';
      input.classList.remove('is-valid', 'is-invalid');
      return;
    }
    msgEl.className = 'check-msg ajax-checking';
    msgEl.innerHTML = '<span class="ajax-spinner"></span> Checking…';
    logAjax(`GET php/check_user.php?field=${field}&value=${val}`, 'info');

    let data;
    try {
      const res = await fetch(`php/check_user.php?field=${field}&value=${encodeURIComponent(val)}`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
      logAjax(`200 OK (PHP) - ${data.message}`, data.exists ? 'taken' : 'free');
    } catch (_) {
      data = await dummyCheck(field, val);
      logAjax(`[Fallback Simulated] - ${data.message}`, data.exists ? 'taken' : 'free');
    }

    const icon = data.exists ? '<i class="bi bi-x-circle-fill"></i> ' : '<i class="bi bi-check-circle-fill"></i> ';
    msgEl.className = 'check-msg ajax-result ' + (data.exists ? 'ajax-taken' : 'ajax-free');
    msgEl.innerHTML = icon + data.message;
    input.classList.toggle('is-invalid', data.exists);
    input.classList.toggle('is-valid', !data.exists);
  }

  let demoTimers = {};
  [dUser, dEmail].forEach((el, idx) => {
    if (!el) return;
    const field = idx === 0 ? 'username' : 'email';
    const msg = idx === 0 ? dUserMsg : dEmailMsg;
    el.addEventListener('input', () => {
      clearTimeout(demoTimers[field]);
      demoTimers[field] = setTimeout(() => checkDemoField(el, field, msg), 350);
    });
  });

  document.querySelectorAll('.chip[data-target]').forEach(chip => {
    chip.addEventListener('click', () => {
      const target = document.getElementById(chip.dataset.target);
      if (!target) return;
      target.value = chip.dataset.value;
      target.dispatchEvent(new Event('input'));
    });
  });
}

