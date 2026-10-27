export function init(container) {

    if (window.renderGameCards) {
        window.renderGameCards();
    }

    return () => {
        // Cleanup if needed
    };
}
