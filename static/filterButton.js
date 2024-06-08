// async function handleSubmitFilter(event) {

//   event.preventDefault(); // Voorkom standaard form submit gedrag

//   const submitFilterButton = document.getElementById('submit-filter-button');
//   const loaderFilter = document.getElementById('loader-filter');
//   const classificationName =
//     document.getElementById('classificationName').value;

//   submitFilterButton.classList.add('loading');
//   loaderFilter.classList.add('loading'); // Voeg loading class toe aan loader
//   submitFilterButton.disabled = true;
//   submitFilterButton.innerText = 'Verzenden...'; // Verander de tekst van de knop

//   try {
//     const response = await fetch(
//       `/all-events?classificationName=${classificationName}`,
//       {
//         method: 'GET',
//       }
//     );
//     const data = await response.json();
//     console.log(data);

//     // Update de UI met de ontvangen data (optioneel)
//     updateEvents(data);
//   } catch (error) {
//     console.error('Error fetching events:', error);
//   } finally {
//     submitFilterButton.classList.remove('loading');
//     loaderFilter.style.display = 'none';
//     submitFilterButton.innerText = 'Search';
//     submitFilterButton.disabled = false;
//   }

// Voer hier je logica uit voor het verzenden van het formulier, bijvoorbeeld een fetch-aanroep
//   setTimeout(() => {
//     console.log('Formulier verzonden!');
//     // Hier zou je eventueel de submit van het formulier kunnen forceren:
//     // event.target.submit();

//     // Verwijder loading state nadat logica is uitgevoerd
//     submitFilterButton.classList.remove('loading');
//     loaderFilter.classList.remove('loading');
//     submitFilterButton.innerText = 'Verzenden'; // Herstel de tekst van de knop
//     submitFilterButton.disabled = false;

//     // Voer hier acties uit om naar een andere pagina te gaan of andere bewerkingen uit te voeren
//   }, 2000); // Voeg een vertraging van 2000 milliseconden (2 seconden) toe
// }

// async function handleLoadingAnimation(event) {
//   const submitFilterButton = document.getElementById('submit-filter-button');
//   const loaderFilter = document.getElementById('loader-filter');

//   submitFilterButton.classList.add('loading');
//   loaderFilter.classList.add('loading'); // Voeg loading class toe aan loader
//   submitFilterButton.disabled = true;
//   submitFilterButton.innerText = 'Verzenden...'; // Verander de tekst van de knop

//   setTimeout(() => {
//     console.log('Formulier verzonden!');
//     // Hier zou je eventueel de submit van het formulier kunnen forceren:
//     // event.target.submit();

//     // Verwijder loading state nadat logica is uitgevoerd
//     submitFilterButton.classList.remove('loading');
//     loaderFilter.classList.remove('loading');
//     submitFilterButton.innerText = 'Verzenden'; // Herstel de tekst van de knop
//     submitFilterButton.disabled = false;

//     // Voer hier acties uit om naar een andere pagina te gaan of andere bewerkingen uit te voeren
//   }, 2000); // Voeg een vertraging van 2000 milliseconden (2 seconden) toe
// }

// function handleSubmitFilter(event) {
//   event.preventDefault();
//   console.log('i set filter');
//   const classificationName =
//     document.getElementById('classificationName').value;
//   window.location.href = `/all-events?classificationName=${classificationName}`;

//   const submitFilterButton = document.getElementById('submit-filter-button');
//   const loaderFilter = document.getElementById('loader-filter');

//   submitFilterButton.classList.add('loading');
//   loaderFilter.classList.add('loading'); // Voeg loading class toe aan loader
//   submitFilterButton.disabled = true;
//   submitFilterButton.innerText = 'Verzenden...';
//   setTimeout(() => {
//     console.log('Formulier verzonden!');
//     // Hier zou je eventueel de submit van het formulier kunnen forceren:
//     // event.target.submit();

//     // Verwijder loading state nadat logica is uitgevoerd
//     submitFilterButton.classList.remove('loading');
//     loaderFilter.classList.remove('loading');
//     submitFilterButton.innerText = 'Verzenden'; // Herstel de tekst van de knop
//     submitFilterButton.disabled = false;

//     // Voer hier acties uit om naar een andere pagina te gaan of andere bewerkingen uit te voeren
//   }, 2000);
// }

function handleSubmitFilter(event) {
  event.preventDefault();
  console.log('i set filter');
  const classificationName =
    document.getElementById('classificationName').value;
  const countryCode = document.getElementById('countryCode').value;

  let queryParams = '';

  if (classificationName && countryCode) {
    queryParams = `?classificationName=${classificationName}&countryCode=${countryCode}`;
  } else if (classificationName) {
    queryParams = `?classificationName=${classificationName}`;
  } else if (countryCode) {
    queryParams = `?countryCode=${countryCode}`;
  }

  window.location.href = `/all-events${queryParams}`;

  const submitFilterButton = document.getElementById('submit-filter-button');
  const loaderFilter = document.getElementById('loader-filter');

  submitFilterButton.classList.add('loading');
  loaderFilter.classList.add('loading'); // Voeg loading class toe aan loader
  submitFilterButton.disabled = true;
  submitFilterButton.innerText = 'Verzenden...';
  setTimeout(() => {
    console.log('Formulier verzonden!');
    // Hier zou je eventueel de submit van het formulier kunnen forceren:
    // event.target.submit();

    // Verwijder loading state nadat logica is uitgevoerd
    submitFilterButton.classList.remove('loading');
    loaderFilter.classList.remove('loading');
    submitFilterButton.innerText = 'Verzenden'; // Herstel de tekst van de knop
    submitFilterButton.disabled = false;

    // Voer hier acties uit om naar een andere pagina te gaan of andere bewerkingen uit te voeren
  }, 2000);
}
