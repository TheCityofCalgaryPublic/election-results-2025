document.addEventListener("DOMContentLoaded", function() {
    const timerElement = document.getElementById('refresh-timer');
    const initialSeconds = 5 * 60; // 5 minutes
    let totalSeconds = initialSeconds;

    const countdown = setInterval(() => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const paddedSeconds = seconds.toString().padStart(2, '0');
        timerElement.textContent = `${minutes} min ${paddedSeconds} secs.`;

        if (totalSeconds <= 0) {
            // Refresh the page when timer reaches 0
            location.reload();
            return;
        }

        totalSeconds--;
    }, 1000);
});
