document.addEventListener('DOMContentLoaded', () => {
  const unlikeForms = document.querySelectorAll('.unlike-form')

  unlikeForms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault()

      const formData = new FormData(form)
      const eventId = formData.get('eventId')

      try {
        const response = await fetch('/remove-favorite', {
          method: 'POST',
          body: new URLSearchParams(formData),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })

        if (response.ok) {
          alert('Event removed from favorites successfully')
          form.closest('li').remove() // Remove the event from the list
        } else {
          alert('Failed to remove the event from favorites')
        }
      } catch (error) {
        console.error('Error removing event from favorites:', error)
        alert('Server error')
      }
    })
  })
})
