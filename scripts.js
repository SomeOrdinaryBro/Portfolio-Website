function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
}

const jobTitles = ["Backend Developer", "Freelancer", "Part-time Gym Trainer"];
let currentTitleIndex = 0;
let currentCharIndex = 0;
let isDeleting = false;

function typeJobTitle() {
    const jobTitleElement = document.getElementById("job-title");
    const currentTitle = jobTitles[currentTitleIndex];
    
    const cursor = isDeleting ? "_" : "▮";

    if (isDeleting) {
        jobTitleElement.textContent = currentTitle.substring(0, currentCharIndex) + cursor;
        currentCharIndex--;
    } else {
        jobTitleElement.textContent = currentTitle.substring(0, currentCharIndex) + cursor;
        currentCharIndex++;
    }

    if (!isDeleting && currentCharIndex === currentTitle.length + 1) {
        isDeleting = true;
        setTimeout(typeJobTitle, 500); 
    } else if (isDeleting && currentCharIndex === -1) {
        isDeleting = false;
        currentTitleIndex = (currentTitleIndex + 1) % jobTitles.length;
        setTimeout(typeJobTitle, 300); 
    } else {
        setTimeout(typeJobTitle, isDeleting ? 50 : 150);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    typeJobTitle();
});
