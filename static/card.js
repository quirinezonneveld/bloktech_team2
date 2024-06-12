//card
document.addEventListener('DOMContentLoaded', () => {
    let scrollContainersCard = document.querySelectorAll('.card-container');

    scrollContainersCard.forEach((scrollContainerCard) => {
        let arrowLeftCard = scrollContainerCard.nextElementSibling.querySelector('li:first-of-type');
        let arrowRightCard = scrollContainerCard.nextElementSibling.querySelector('li:last-of-type');

        // Haal de breedte van een kaart op binnen de huidige container
        let card = scrollContainerCard.querySelector('article');
        if (!card) return; // Ga naar de volgende container als er geen kaarten zijn
        
        let cardStyle = getComputedStyle(card);
        let cardWidth = parseFloat(cardStyle.width);
        
        // Haal de gap op tussen de kaarten binnen de huidige container
        let cardContainerStyle = getComputedStyle(scrollContainerCard);
        let cardGap = parseFloat(cardContainerStyle.gap);
        
        let scrollDistance = cardWidth + cardGap;
        
        if (arrowLeftCard && arrowRightCard) {
            arrowLeftCard.addEventListener('click', function() {
                scrollContainerCard.scrollLeft -= scrollDistance;
            });
            arrowRightCard.addEventListener('click', function() {
                scrollContainerCard.scrollLeft += scrollDistance;
            });
        }
    });
});



// like buttons & like pop-up
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const likeButtons = document.querySelectorAll('.favorite-form');
const likePopup = document.querySelector('.liked-popup');

likeButtons.forEach(likeButton => {
    const likeHeart = likeButton.querySelector('i');

    likeButton.addEventListener('submit', async (event) => {
    
        likeButton.classList.toggle('liked');
        likeHeart.classList.toggle('liked-heart');

        if (likeButton.classList.contains('liked')) {
            await sleep(2500); 
            likePopup.classList.remove('hiddenVisibility');
            await sleep(3000); 
            likePopup.classList.add('hiddenVisibility');
        }
   
    });
});



// review slider
let navigatieMelding = document.querySelector('.info-nav p');
let navigatieMeldingCheck = document.querySelector('.info-nav img');
let navigatieMeldingText = ["Every moment was magic! Counting down the days until the next one!", "A masterpiece of an event! Pure brilliance in every detail!", "What an incredible event! Truly unforgettable!"];
let index = 0;


async function updateAndRemove() {
    navigatieMelding.classList.add('navigatieVerschijn');
    navigatieMeldingCheck.classList.add('navigatieVerschijn');

    navigatieMelding.textContent = navigatieMeldingText[index];
    index = (index + 1) % navigatieMeldingText.length;

    await sleep(3600);
    navigatieMelding.classList.remove('navigatieVerschijn');
    navigatieMeldingCheck.classList.remove('navigatieVerschijn');
        
}

if (navigatieMelding) {
    updateAndRemove();
    setInterval(updateAndRemove, 4000);
}



// scroll animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    });
});


const elementsToObserve = document.querySelectorAll('.hiddenAnimation, .slideAnimation');

elementsToObserve.forEach((element) => {
    observer.observe(element);
});


// faq

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const loaderDiv = document.getElementById('loaderDiv');
    const loadButton = document.getElementById('loadButton');
    const dataDiv = document.getElementById('data');

    async function fetchData(url) {
        loaderDiv.classList.add("loading");
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
            loaderDiv.classList.remove("loading");
        }
    }

    loadButton.addEventListener('click', () => {
        fetchData('/home'); // Pas de URL aan naar jouw endpoint
    });
});