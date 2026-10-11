# Nook: Responsive Login & Registration UI

Internship Task 2: Interactive UI & Frontend Development.

**Stack:** HTML5, CSS3, JavaScript (ES6), Bootstrap 5.3, Bootstrap Icons, Google Fonts, PHP (dummy AJAX endpoint)

## Features
- Mobile-first layout using the Bootstrap grid, navbar, carousel, cards, modals, buttons
- Responsive utilities (`d-none d-md-flex`, `d-md-block`, ...)
- Custom brand palette via CSS variables, smooth scrolling, hover effects
- JS validation for login and registration, password match check, show/hide password, strength meter
- AJAX username/email availability check against `php/check_user.php`
- Reusable Navbar and Footer in `js/components.js`

## Run
```bash
php -S localhost:8000
```
Open http://localhost:8000. Taken demo values: username `admin`, `subha`, `test`; email `admin@example.com`.
(Opening the HTML files directly also works; the AJAX check then shows a friendly fallback message.)

## Structure
```
index.html  login.html  register.html
css/style.css
js/components.js  js/main.js
php/check_user.php
```
