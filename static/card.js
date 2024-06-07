//card

document.addEventListener('DOMContentLoaded', () => {
    // Haal alle card-containers op
    let scrollContainersCard = document.querySelectorAll('.card-container');
    
    // Itereer door elke card-container
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
        
        // Totale scrollafstand per klik
        let scrollDistance = cardWidth + cardGap;
        
        // Scrollen
        if (arrowLeftCard && arrowRightCard) {
            arrowLeftCard.addEventListener('click', function() {
                scrollContainerCard.scrollLeft -= scrollDistance;
                console.log('het werkt links');
            });
            arrowRightCard.addEventListener('click', function() {
                scrollContainerCard.scrollLeft += scrollDistance;
                console.log('het werkt rechts');
            });
        }
    });
    
    console.log('test hello world');

});

// like button
const likeButton = document.querySelector('.favorite-form');
const likeHeart = document.querySelector('.favorite-form i');

likeButton.addEventListener('click', () => {
    likeButton.classList.toggle('liked');
    likeHeart.classList.toggle('liked-heart');
});
