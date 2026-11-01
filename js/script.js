

//Add a click event
const accordionButton = document.querySelectorAll('.accordion-button');


accordionButton.forEach( function (button ) {
    button.addEventListener("click" , function(){

        const details = button.nextElementSibling;

        const detailsAreHidden = details.hidden;

        details.hidden = !detailsAreHidden;

        button.setAttribute("aria-expanded", String(detailsAreHidden));




        if(detailsAreHidden){
            button.textContent = "Hide Service details";
        }else{
            button.textContent = "Show Service details";
        }
    })
})


// Find the search input and the message area.
const productSearch = document.querySelector("#product-search");
const searchMessage = document.querySelector("#search-message");

// Find every product section. All three need the "sevices-card" class.
const productCards = document.querySelectorAll(".mission-card");

// Only set up the search if the search field and product cards exist.
if (productSearch && searchMessage && productCards.length > 0) {

    // The "input" event runs whenever the visitor types or edits the search.
    productSearch.addEventListener("input", function () {

        // Read the search text, remove extra spaces, and make it lowercase.
        // Lowercase text means "Cake" and "cake" will both find matches.
        const searchText = productSearch.value.toLowerCase().trim();

        // Keep count of the product cards that match.
        let numberOfMatches = 0;

        // Check each product card one at a time.
        productCards.forEach(function (card) {

            // Get all the text inside this product card.
            const cardText = card.textContent.toLowerCase();

            // Check whether the card's text contains what the visitor typed.
            const cardMatches = cardText.includes(searchText);

            // Hide the card if it does not match; otherwise show it.
            card.hidden = !cardMatches;

            // Increase the match count when this card matches.
            if (cardMatches) {
                numberOfMatches = numberOfMatches + 1;
            }
        });

        // Show a message if no product cards match the search.
        if (numberOfMatches === 0) {
            searchMessage.textContent = "No products match your search.";
        } else {
            searchMessage.textContent = "";
        }
    });
}

// FEATURE 3: PRODUCT DETAILS ACCORDION
// ------------------------------------------------------

// Find all the accordion buttons on the page.
const accordionButtons = document.querySelectorAll(".accordion-button");

// Add a click event to every accordion button.
accordionButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        // In this HTML example, the details paragraph comes immediately
        // after its button, so nextElementSibling finds that paragraph.
        const details = button.nextElementSibling;

        // Check whether the details are currently hidden.
        const detailsAreHidden = details.hidden;

        // Reverse the hidden state: show hidden details or hide visible ones.
        details.hidden = !detailsAreHidden;

        // Update this accessibility attribute to match the new state.
        button.setAttribute("aria-expanded", String(detailsAreHidden));

        // Change the button label to explain what clicking will do next.
        if (detailsAreHidden) {
            button.textContent = "Hide cake details";
        } else {
            button.textContent = "Show cake details";
        }
    });
});


// FEATURE 2: IMAGE LIGHTBOX
// ------------------------------------------------------

// Find the dialog and the image that will be shown inside it.
const imageLightbox = document.querySelector("#image-lightbox");
const enlargedImage = document.querySelector("#lightbox-image");
const closeLightboxButton = document.querySelector("#close-lightbox");

// Find all product images that should open in the lightbox.
const productImages = document.querySelectorAll(".lightbox-image");

// Set up the lightbox only if its HTML elements exist.
if (imageLightbox && enlargedImage && closeLightboxButton) {

    // Give every product image a click event.
    productImages.forEach(function (productImage) {

        productImage.addEventListener("click", function () {

            // Copy the clicked image's file path into the larger image.
            enlargedImage.src = productImage.src;

            // Copy its description so the enlarged image has useful alt text.
            enlargedImage.alt = productImage.alt;

            // Open the dialog as a modal window.
            imageLightbox.showModal();
        });
    });

    // Close the dialog when the visitor clicks the close button.
    closeLightboxButton.addEventListener("click", function () {
        imageLightbox.close();
    });

    // Remove the image source after closing the dialog.
    imageLightbox.addEventListener("close", function () {
        enlargedImage.src = "";
    });
}