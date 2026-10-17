(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  const link = (href, label) =>
    `<li class="nav-item"><a class="nav-link ${page === href ? 'active' : ''}" href="${href}">${label}</a></li>`;

  const navbar = `
  <nav class="navbar navbar-expand-md site-nav navbar-dark sticky-top">
    <div class="container">
      <a class="brand" href="index.html">UserPulse<span>.</span></a>
      <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav" aria-label="Toggle menu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="nav">
        <ul class="navbar-nav ms-auto align-items-md-center gap-md-1">
          ${link('index.html', 'Home')}
          <li class="nav-item d-none d-md-block"><a class="nav-link" href="index.html#features">Features</a></li>
          ${link('login.html', 'Log in')}
          <li class="nav-item ms-md-2 mt-2 mt-md-0"><a class="btn btn-saffron btn-sm px-3" href="register.html">Create account</a></li>
        </ul>
      </div>
    </div>
  </nav>`;

  const footer = `
  <footer class="site-footer py-4 mt-auto">
    <div class="container d-flex flex-column flex-md-row justify-content-between gap-2 small">
      <span>&copy; ${new Date().getFullYear()} UserPulse. Built for Internship Task 2.</span>
      <span class="d-flex gap-3">
        <a href="login.html">Log in</a><a href="register.html">Register</a>
        <a href="https://github.com/" aria-label="GitHub"><i class="bi bi-github"></i></a>
      </span>
    </div>
  </footer>`;

  document.getElementById('navbar')?.insertAdjacentHTML('afterbegin', navbar);
  document.getElementById('footer')?.insertAdjacentHTML('afterbegin', footer);
})();
