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
  console.log('2 ------>');
  const likeButtons = document.querySelectorAll('.like-button');
  likeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const buttonElement = event.currentTarget;
      const eventId = buttonElement.getAttribute('data-event-id');
      console.log('eventId ----->', eventId);
    });
  });

  setTimeout(() => {
    const splineContainer = document.getElementById('spline');
    console.log('splineContainer ------>', splineContainer);
  }, 3000);

  const URL = `https://app.ticketmaster.com/discovery/v2/events.json?size=50&page=1&apikey=jxIe8vLUvEyo3k3lzYUPdyVeqYbdfYiv`;

  //   try {
  //     console.log("I work------>");
  //     const response = await fetch("/api-data");
  //     const data = await response.json();

  //     const eventsContainer = document.getElementById("card-container");
  //     const template = document.getElementById("event-template");

  //     data._embedded.events.forEach((event) => {
  //       const eventElement = template.cloneNode(true);
  //       eventElement.classList.remove("event-template");

  //       const img = eventElement.querySelector('[data-src="event-img"]');
  //       const name = eventElement.querySelector('[data-content="event-name"]');
  //       const date = eventElement.querySelector("a p:last-child");
  //       eventElement.

  //       img.src = event.images[0].url;
  //       name.textContent = event.name;
  //       date.textContent = new Date(
  //         event.dates.start.dateTime
  //       ).toLocaleDateString();

  //       eventsContainer.appendChild(eventElement);
  //     });

  //     template.remove();
  //     console.log(template);
  //   } catch (error) {
  //     console.error(
  //       "Er is een fout opgetreden bij het ophalen van de API-gegevens:",
  //       error
  //     );
  //   }
});

//FETCH FUNC

// async function getEvents() {
//   try {
//     const response = await fetch(URL);
//     const data = await response.json();
//     console.log(data);

//     const eventsContainer = document.getElementById("events-container");
//     const template = document.getElementById("event-template");

//     data._embedded.events.forEach((event) => {
//       const eventElement = template.cloneNode(true);
//       eventElement.classList.remove("event-template");

//       const img = eventElement.querySelector('[data-src="event-img"]');
//       const name = eventElement.querySelector('[data-content="event-name"]');

//       img.src = event.images[0].url;
//       name.textContent = event.name;

//       eventsContainer.appendChild(eventElement);
//     });

//     template.remove();
//     console.log(template);
//   } catch (error) {
//     console.error("error loading data", error);
//   }
// }
// getEvents();
