"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const searchButton =
        document.querySelector(".rr-search-button");

    const subscribeButton =
        document.querySelector(".raj-subscribe-nav") ||
        document.querySelector(".rr-subscribe") ||
        document.querySelector('a[class*="subscribe"]');


    if (!searchButton || !subscribeButton) {
        return;
    }


    const navActions =
        subscribeButton.parentElement;


    if (!navActions) {
        return;
    }


    /*
     Move the EXISTING search button.
     Search functionality remains connected.
    */

    navActions.insertBefore(
        searchButton,
        subscribeButton
    );


    searchButton.classList.add(
        "rr-search-nav-mode"
    );


    searchButton.innerHTML = `
        <span class="rr-search-nav-icon">⌕</span>

        <span class="rr-search-nav-text">
            Search
        </span>

        <kbd class="rr-search-nav-kbd">
            Ctrl+K
        </kbd>
    `;


    /*
     Keep keyboard shortcut working.
     If existing global search JS already handles Ctrl+K,
     this simply avoids breaking it.
    */

    document.addEventListener(
        "keydown",
        (event) => {

            const isShortcut =
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === "k";


            if (!isShortcut) {
                return;
            }


            event.preventDefault();

            searchButton.click();

        }
    );

});