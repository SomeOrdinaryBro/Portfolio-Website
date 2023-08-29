window.addEventListener('DOMContentLoaded', function() {

    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
  

    document.addEventListener('mousedown', function(e) {
      e.preventDefault();
    });
  

    var scrollDownButton = document.querySelector('.scroll-down');
    scrollDownButton.addEventListener('click', function() {
      var nextSection = document.querySelector('.blog');
      nextSection.scrollIntoView({ behavior: 'smooth' });
    });
  });
  