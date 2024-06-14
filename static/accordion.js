var acc = document.getElementsByClassName('accordion');
        var i;

        for (i = 0; i < acc.length; i++) {
            acc[i].addEventListener('click', function () {
                this.classList.toggle('active');
                var panel = this.nextElementSibling;
                if (panel.style.display === 'block') {
                    panel.style.display = 'none';
                } else {
                    panel.style.display = 'block';
                }
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            const loaderDiv = document.getElementById('loaderDiv');
            const loadButton = document.getElementById('loadButton');
            const dataDiv = document.getElementById('data');

            async function fetchData(url) {
                loaderDiv.classList.add('loading');
                try {
                    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simuleer een vertraging

                    // Maak een fetch-aanroep
                    const response = await fetch(url);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    dataDiv.innerHTML = `<p>${data.message}</p>`;
                } catch (error) {
                    dataDiv.innerHTML = `<p>Error: ${error.message}</p>`;
                    console.error('Error:', error);
                } finally {
                    loaderDiv.classList.remove('loading');
                }
            }

            loadButton.addEventListener('click', () => {
                fetchData('/home'); // Pas de URL aan naar jouw endpoint
            });
        });