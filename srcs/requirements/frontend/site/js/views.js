async function loadView(view) {
    const app = document.getElementById("app");

    try {
        const response = await fetch(`./views/${view}.html`);
        if (!response.ok) throw new Error("View not found");

        const html = await response.text();
        app.innerHTML = html;
    } catch (error) {
        console.error("Error loading view:", error);
        app.innerHTML = "<h1>Page Not Found</h1>";
    }
}

export default loadView;