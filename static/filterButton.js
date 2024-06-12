// async function handleSubmitFilter(event) {

//   event.preventDefault(); // Voorkom standaard form submit gedrag

//   const submitFilterButton = document.getElementById('on');
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

// In filterButton.js

// In filterButton.js

async function handleSubmitFilter(event) {
  console.log('i set filter');
  const classificationName = document.getElementById('classificationName').value;
  const countryCode = document.getElementById('countryCode').value;

  let queryParams = '';

  if (classificationName && countryCode) { queryParams = `?classificationName=${encodeURIComponent(classificationName)}&countryCode=${encodeURIComponent(countryCode)}`; } else if (classificationName) { queryParams = `?classificationName=${encodeURIComponent(classificationName)}`; } else if (countryCode) { queryParams = `?countryCode=${encodeURIComponent(countryCode)}`; }

  console.log('Query Params:', queryParams);

  const loaderFilter = document.getElementById('loader-filter');
  const loaderImage = document.querySelector('.loader-image');
  const loaderImage2 = document.querySelector('.loader-image-2');

  loaderFilter.classList.add('loading'); // Voeg loading class toe aan loader
  loaderImage.classList.add('move');
  loaderImage2.classList.add('move-delay');

  try {
    const response = await fetch(`/all-events${queryParams}`);
    if (!response.ok) {
      throw new Error('Er is een fout opgetreden bij het ophalen van de data');
    }
    const data = await response.json();
    console.log('Formulier verzonden!', data);
    // Voer hier eventuele verdere verwerkingslogica uit met de ontvangen data

    // Doorsturen naar nieuwe pagina na succesvolle verwerking
    window.location.href = `/all-events${queryParams}`;
  } catch (error) {
    console.error('Er is een fout opgetreden bij het ophalen van de data:', error);
  } finally {
    loaderFilter.classList.remove('loading');
    loaderImage.classList.remove('move');
    loaderImage2.classList.remove('move-delay');
  }
}
