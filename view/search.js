document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form')
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const keyword = document.getElementById('site-search').value
    window.location.href = `/all-events?keyword=${keyword}`
  })
})
