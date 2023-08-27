// disabling right click
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});

// disabling text high light
document.addEventListener("selectstart", function (e) {
    e.preventDefault();
});
