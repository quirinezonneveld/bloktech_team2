// dit bestandje moet later wordt toegevoegd met het algemene javascript bestand



//card
let scrollContainerCard = document.querySelector('.card-container');
let arrowLeftCard = document.querySelector('.card-buttons li:first-of-type');
let arrowRightCard = document.querySelector('.card-buttons li:last-of-type');

// Haal de breedte van een kaart op
let card = document.querySelector('.card-container article');
let cardStyle = getComputedStyle(card);
let cardWidth = parseFloat(cardStyle.width);

// Haal de gap op tussen de kaarten
let cardContainerStyle = getComputedStyle(scrollContainerCard);
let cardGap = parseFloat(cardContainerStyle.gap);

// Totale scrollafstand per klik
let scrollDistance = cardWidth + cardGap;

//scrollen
if (arrowLeftCard && arrowRightCard) {
    arrowLeftCard.addEventListener('click', function() {
        scrollContainerCard.scrollLeft -= scrollDistance;
    });
    arrowRightCard.addEventListener('click', function() {
        scrollContainerCard.scrollLeft += scrollDistance;
    });
}
