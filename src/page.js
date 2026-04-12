const navbarContainer = document.getElementById("navbar");
const content = document.getElementById("content");

let currentPage = null;

fetch("components/navbar.html")
    .then(res => res.text())
    .then(data => {
        navbarContainer.innerHTML = data;

        const links = document.querySelectorAll(".navbar a");

        links.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const page = link.getAttribute("data-page");

                if (currentPage === page) return;

                links.forEach(l => l.classList.remove("active"));
                link.classList.add("active");

                loadPage(page);
            });
        });
    });

function loadPage(page) {
    currentPage = page;

    fetch(page)
        .then(res => res.text())
        .then(data => {
            content.innerHTML = data;

            const links = document.querySelectorAll(".navbar a");
            links.forEach(l => {
                if (l.getAttribute("data-page") === page) {
                    l.classList.add("active");
                } else {
                    l.classList.remove("active");
                }
            });

            if (page === "pages/home.html") {
                startCounter();
            }

            if (page === "pages/works.html") {
                initWorksPage();
            }
        });
}

// Single shared observer for all video placeholders
let videoObserver = null;

function initWorksPage() {
    const basePath = window.location.pathname.includes("/pages/") ? "../" : "";
    fetch(`${basePath}data/work.json`)
        .then(rep => rep.json())
        .then(works => {
            const container = document.getElementById("worksContainer");
            // Clear container if reloading
            container.innerHTML = "";
            const fragment = document.createDocumentFragment();

            // Create shared observer if not already created
            if (!videoObserver) {
                videoObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !entry.target.dataset.loaded) {
                            const iframe = document.createElement("iframe");
                            iframe.src = entry.target.dataset.videoUrl;
                            iframe.width = "100%";
                            iframe.height = "380";
                            iframe.style.border = "none";
                            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                            iframe.allowFullscreen = true;
                            entry.target.appendChild(iframe);
                            entry.target.dataset.loaded = "true";
                            videoObserver.unobserve(entry.target);
                        }
                    });
                }, { rootMargin: "50px" });
            }

            works.forEach(work => {
                const card = document.createElement("div");
                card.className = "work-card";

                const tagsDiv = document.createElement("div");
                tagsDiv.className = "tags";
                work.tags.forEach(tag => {
                    const tagSpan = document.createElement("span");
                    tagSpan.className = `tag ${tag}`;
                    tagSpan.textContent = `#${tag}`;
                    tagsDiv.appendChild(tagSpan);
                });
                card.appendChild(tagsDiv);

                const title = document.createElement("h3");
                title.textContent = work.WorkName;
                card.appendChild(title);

                const desc = document.createElement("p");
                desc.className = "Description";
                desc.textContent = work.description;
                card.appendChild(desc);

                const line = document.createElement("hr");
                line.className = "divider";
                card.appendChild(line);

                if (work.video) {
                    const videoPlaceholder = document.createElement("div");
                    videoPlaceholder.className = "video-placeholder";
                    videoPlaceholder.style.width = "100%";
                    videoPlaceholder.style.height = "380px";
                    videoPlaceholder.style.backgroundColor = "#1a1a1a";
                    videoPlaceholder.dataset.videoUrl = work.video;
                    videoObserver.observe(videoPlaceholder);
                    card.appendChild(videoPlaceholder);
                }

                fragment.appendChild(card);
            });

            container.appendChild(fragment);
        })
        .catch(err => console.error("Failed to load JSON: ", err));
}

loadPage("pages/home.html");

function startCounter() {
    const element = document.getElementById("visitCount");
    if (!element) return;

    const target = 407000000;
    let current = 0;

    const duration = 2000;
    const increment = target / (duration / 16);

    function update() {
        current += increment;

        if (current >= target) current = target;

        element.textContent = Math.floor(current / 1000000) + "M+";

        if (current < target) {
            requestAnimationFrame(update);
        }
    }

    update();
}