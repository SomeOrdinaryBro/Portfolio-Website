window.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });

  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey && e.key === '+') || (e.ctrlKey && e.key === '-')) {
      e.preventDefault();
    }
  });

  document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  });

  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  });

  var scrollDownButton = document.querySelector('.scroll-down');
  scrollDownButton.addEventListener('click', function() {
    var nextSection = document.querySelector('.blog');
    nextSection.scrollIntoView({ behavior: 'smooth' });
  });
});
