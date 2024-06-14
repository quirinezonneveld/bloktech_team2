// In filterButton.js

async function handleSubmitFilter(event) {
  console.log('i set filter')
  const classificationName = document.getElementById('classificationName').value
  const countryCode = document.getElementById('countryCode').value

  let queryParams = ''

  if (classificationName && countryCode) { queryParams = `?classificationName=${encodeURIComponent(classificationName)}&countryCode=${encodeURIComponent(countryCode)}` } else if (classificationName) { queryParams = `?classificationName=${encodeURIComponent(classificationName)}` } else if (countryCode) { queryParams = `?countryCode=${encodeURIComponent(countryCode)}` }

  console.log('Query Params:', queryParams)

  const loaderFilter = document.getElementById('loader-filter')
  const loaderImage = document.querySelector('.loader-image')
  const loaderImage2 = document.querySelector('.loader-image-2')

  loaderFilter.classList.add('loading') // Voeg loading class toe aan loader
  loaderImage.classList.add('move')
  loaderImage2.classList.add('move-delay')

  try {
    const response = await fetch(`/all-events${queryParams}`)
    if (!response.ok) {
      throw new Error('Er is een fout opgetreden bij het ophalen van de data')
    }
    const data = await response.json()
    console.log('Formulier verzonden!', data)
    // Voer hier eventuele verdere verwerkingslogica uit met de ontvangen data

    // Doorsturen naar nieuwe pagina na succesvolle verwerking
    window.location.href = `/all-events${queryParams}`
  } catch (error) {
    console.error('Er is een fout opgetreden bij het ophalen van de data:', error)
  } finally {
    loaderFilter.classList.remove('loading')
    loaderImage.classList.remove('move')
    loaderImage2.classList.remove('move-delay')
  }
}
