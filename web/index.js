// Load App
import { App } from "../build/main.js";

// Load Demos
import {
    demo01,
    demo02,
    demo03,
    demo04,
    demo05
} from "../build/examples/demos/demos.js";

// import mapping
const DEMOS = {
    demo01: demo01,
    demo02: demo02,
    demo03: demo03,
    demo04: demo04,
    demo05: demo05,
};

// DOM Elements
const body = document.body;
const navbar = document.querySelector(".navbar");
const content = document.querySelector(".content-wrapper");
const recipeLinks = document.querySelectorAll(".recipeLink");
const btnBack = document.getElementById("btnBack");

/// Register Events
btnBack.addEventListener("click", unloadScript);
recipeLinks.forEach(link => {
    link.addEventListener("click", loadScript);
});

function triggerLinkOnStart(linkIndex = null) {
    if (linkIndex === null)  return;
    if (!(linkIndex in recipeLinks)) return;
    recipeLinks[linkIndex].click();
}
triggerLinkOnStart(4);



/**
 * Remove ALL declare requestAnimationFrom from the current window
 * Used when unload a three.js script
 * @credit https://stackoverflow.com/a/55443952
 */
function cancelAllAnimationFrames(){
    var id = window.requestAnimationFrame(function(){});
    while(id--){
        window.cancelAnimationFrame(id);
    }
}

/**
 * Hides the main content and show the script helpers
 */
function hideContent() {
    body.classList.remove("margin");
    content.classList.add("hide");
    navbar.classList.remove("hide");
}

/**
 * shows the main content and Hides the script helpers
 */
function showContent() {
    body.classList.add("margin");
    content.classList.remove("hide");
    navbar.classList.add("hide");
}

/**
 * Loads a new recipe script
 * @param event
 */
function unloadScript(event) {
    document.title = "Home";
    showContent();

    // remove all timers
    cancelAllAnimationFrames();
    // destroy and canvas in DOC
    let canvas = document.querySelectorAll("canvas");
    canvas.forEach(c => c.remove());
    // destroy and clean up all dom elements required for the script
    let domElements = document.querySelectorAll(".clean-up-required");
    domElements.forEach(c => c.remove());

}

/**
 * UnLoads a new recipe script
 * @param event
 */
function loadScript(event) {
  let recipeLink = this.dataset.recipe;

  if (recipeLink in DEMOS) {
      document.title = recipeLink;
      hideContent();
      DEMOS[recipeLink](App);
  } else {
      alert(`Link ${recipeLink} not available!`);
  }

}








