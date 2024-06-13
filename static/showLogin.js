document
.getElementById('loginBtn')
.addEventListener('click', function () {
  document.getElementById('loginForm').classList.add('active');
  document.getElementById('registerForm').classList.remove('active');
  document.getElementById('loginBtn').classList.add('active');
  document.getElementById('registerBtn').classList.remove('active');
});

document
.getElementById('registerBtn')
.addEventListener('click', function () {
  document.getElementById('registerForm').classList.add('active');
  document.getElementById('loginForm').classList.remove('active');
  document.getElementById('registerBtn').classList.add('active');
  document.getElementById('loginBtn').classList.remove('active');
});

// By default, show the login form and set login button as active
document.getElementById('loginForm').classList.add('active');
document.getElementById('loginBtn').classList.add('active');