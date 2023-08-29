// Disable text highlighting
document.addEventListener('DOMContentLoaded', function() {
  // Attach event listener when the DOM content is loaded
  document.addEventListener('mousedown', function(e) {
    // Prevent default behavior of selecting/highlighting text
    e.preventDefault();
  });
});

// Disable zooming
window.addEventListener('wheel', function(e) {
  // Check if the Control key is pressed
  if (e.ctrlKey) {
    // Prevent default behavior of zooming the webpage
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('keydown', function(e) {
  // Check if the Control key is pressed and specific keys are pressed
  if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) {
    // Prevent default behavior of zooming the webpage using keyboard shortcuts
    e.preventDefault();
  }
});

// Disable right-click
window.addEventListener('contextmenu', function(e) {
  // Prevent default behavior of showing the right-click context menu
  e.preventDefault();
});

// Disable scrolling
window.addEventListener('scroll', function(e) {
  // Scroll the window back to the top, preventing any scrolling
  window.scrollTo(0, 0);
});

// Disable page content scaling
function disablePageScaling() {
  // Find the <meta> tag with the name attribute "viewport"
  var metaViewport = document.querySelector('meta[name="viewport"]');
  if (metaViewport) {
    // Update the content attribute to disable scaling
    metaViewport.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0";
  }
}

// Call the disablePageScaling function on window load and resize events
window.addEventListener('load', disablePageScaling);
window.addEventListener('resize', disablePageScaling);


// these were added to make the site look clean, obvio the site isnt user friendly but.. looks nice to me idc bout u bro lol