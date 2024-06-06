document.addEventListener('DOMContentLoaded', async () => {
  const hamburger = document.getElementById('hamburger');
  const navBlock = document.querySelector('.nav-block');

  hamburger.addEventListener('click', () => {
    console.log('button clicked');
    navBlock.classList.toggle('show');
  });
});
