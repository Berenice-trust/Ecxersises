document.addEventListener('DOMContentLoaded', () => {
    const scrollToTopButton = document.getElementById('scroll-to-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopButton.classList.add('show');
        } else {
            scrollToTopButton.classList.remove('show');
        }
    });

    scrollToTopButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
