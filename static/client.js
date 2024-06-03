
// Add info from .env file to process.env
require('dotenv').config();
async function getEvents() {
  try {
    const response = await fetch(URL);
    const data = await response.json();
    //console.log(data);
  } catch (error) {
    console.error('error loading data', error);
  }
}

getEvents();

document.addEventListener('DOMContentLoaded', async () => {
  const likeButtons = document.querySelectorAll('.like-button');
  likeButtons.forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const buttonElement = event.currentTarget;
      const eventId = buttonElement.getAttribute('data-event-id');
      //console.log('eventId ----->', eventId);

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

 const URL = `https://app.ticketmaster.com/discovery/v2/events.json?size=50&page=1&apikey=${process.env.KEY}`;
});

  