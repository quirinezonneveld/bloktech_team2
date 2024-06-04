
// Add info from .env file to process.env
require('dotenv').config();
async function getEvents() {
  try {
    const response = await fetch(URL);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('error loading data', error);
  }
}

getEvents();

document.addEventListener('DOMContentLoaded', async () => {

  const likeButtons = document.querySelectorAll('.like-button');
  likeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const buttonElement = event.currentTarget;
      const eventId = buttonElement.getAttribute('data-event-id');
      console.log('eventId ----->', eventId);
    });
  });

 const URL = `https://app.ticketmaster.com/discovery/v2/events.json?size=50&page=1&apikey=${process.env.KEY}`;

})
