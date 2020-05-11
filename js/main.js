let resolutions = [
    {
        "image": "profile_template.png",
        "width": 600,
        "height": 600
    },
    {
        "image": "levelup_template.png",
        "width": 740,
        "height": 128
    },
    {
        "image": "rank_template.png",
        "width": 740,
        "height": 260
    },
    {
        "image": "wallet_template.png",
        "width": 640,
        "height": 400
    }
];

function onload() {
    let e = document.getElementById("files");
    for(let resolution of resolutions) {
        e.appendChild(buildImageContainer(resolution));
    }
}

let currentDragElement = null;
let startX = 0;
let startY = 0;

function buildImageContainer(resolution) {
    let container = document.createElement("div");
    container.className = "container";
    container.style.setProperty("--width",resolution.width);
    container.style.setProperty("--height",resolution.height);

    let background = document.createElement("div");
    background.className = "background";

    let template = document.createElement("div");
    template.className = "template";
    template.style.backgroundImage = `url("assets/${resolution.image}")`;

    container.appendChild(background);
    container.appendChild(template);

    resolution.background = background;
    resolution.currentDY = 0;
    resolution.beforeDY = 0;

    let dragstart = (e) => {
        currentDragElement = resolution
        startX = e.pageX;
        startY = e.pageY;
        e.preventDefault();
    }

    template.addEventListener("mousedown", dragstart);
    template.addEventListener("touchstart", dragstart);

    return container;
}

function dragStop(e) {
    if(currentDragElement) {
        let dy = e.pageY - startY;
        currentDragElement.beforeDY += dy;
    }
    currentDragElement = null
}

function dragMove(e) {
    if(currentDragElement != null) {
        onDrag(currentDragElement, e.pageX - startX, e.pageY - startY);
        e.preventDefault();
    }
}

document.addEventListener("mouseup", dragStop);
document.addEventListener("touchend", dragStop);
document.addEventListener("mousemove", dragMove);
document.addEventListener("touchmove", dragMove);

function upload(file) {
    console.log(file);
    if(!file.files || !file.files[0]) {
        return;
    }
    let fr = new FileReader();
    fr.onloadend = (e) => {
        document.body.style.setProperty("--background",`url("${e.target.result}")`);
    }
    fr.readAsDataURL(file.files[0]);
}

function onDrag(resolution, dx, dy) {
    let now = resolution.beforeDY + dy;
    resolution.background.style.setProperty("--dy", now);
}