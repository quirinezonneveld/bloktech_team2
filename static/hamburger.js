document.addEventListener('DOMContentLoaded', async () => {
  const hamburgerOpenButton = document.getElementById('hamburger')
  const navBlock = document.querySelector('.nav-block')
  const hamburgerClosigButton = document.getElementById('hamburger-closing-button')

  hamburgerOpenButton.addEventListener('click', () => {
    console.log('menu opened')
    navBlock.classList.add('show')
  })

  hamburgerClosigButton.addEventListener('click', () => {
    console.log('menu closed')
    navBlock.classList.remove('show')
  })
})
