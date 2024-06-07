document.addEventListener('DOMContentLoaded', async () => {
  const likeButtons = document.querySelectorAll('.like-button');
  likeButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const buttonElement = event.currentTarget;
      const eventId = buttonElement.getAttribute('data-event-id');


      try {
        const response = await fetch('/add_favorite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ eventId }),
        });

        const data = await response.json();
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          console.log(data.message);
        }
      } catch (error) {
        console.error('Error adding favorite:', error);
      }

    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const unlikeForms = document.querySelectorAll('.unlike-form');

  unlikeForms.forEach((form) => {
      form.addEventListener('submit', async (event) => {
          event.preventDefault();

          const formData = new FormData(form);
          const eventId = formData.get('eventId');

          try {
              const response = await fetch('/unlike', {
                  method: 'POST',
                  body: new URLSearchParams(formData),
                  headers: {
                      'Content-Type': 'application/x-www-form-urlencoded'
                  }
              });

              if (response.ok) {
                  alert('Event removed from favorites successfully');
                  form.closest('li').remove(); // Remove the event from the list
              } else {
                  alert('Failed to remove the event from favorites');
              }
          } catch (error) {
              console.error('Error removing event from favorites:', error);
              alert('Server error');
          }
      });
  });
});


