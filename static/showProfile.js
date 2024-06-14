function showProfile() {
    document.querySelector('.profile_userInfo').style.display = 'block'
    document.querySelector('.favorite-events').style.display = 'none'
    document.getElementById('profileButton').classList.add('active')
    document.getElementById('favoritesButton').classList.remove('active')
}

function showFavorites() {
    document.querySelector('.profile_userInfo').style.display = 'none'
    document.querySelector('.favorite-events').style.display = 'block'
    document.getElementById('profileButton').classList.remove('active')
    document.getElementById('favoritesButton').classList.add('active')
}

function toggleImageChanger() {
    const changerContent = document.querySelector('.imageChangerContent')
    const changeButton = document.querySelector('.changeImage')
    if (changerContent.style.display === 'none') {
        changerContent.style.display = 'block'
        changeButton.style.display = 'none'
    } else {
        changerContent.style.display = 'none'
        changeButton.style.display = 'block'
    }
}

// Default to showing the profile on page load
showProfile()