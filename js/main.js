let resolutions = [
    {
        "image": "profile_template.png",
        "width": 600,
        "height": 600,
        "bevel": "20px"
    },
    {
        "image": "levelup_template.png",
        "width": 740,
        "height": 128,
        "bevel": "20px"
    },
    {
        "image": "rank_template.png",
        "width": 740,
        "height": 260,
        "bevel": "20px 20px 0 0"
    },
    {
        "image": "wallet_template.png",
        "width": 640,
        "height": 400,
        "bevel": "20px"
    }
];

document.body.onload = function () {
    let e = $("#files");

    for (let resolution of resolutions) {
        let cb = buildImageContainer(e, resolution);

        e.append(cb);

        // Moves the buttons to the right
        cb.updateButtonPosition();
    }
};

let seenExportMessage = false;
let currentDragElement = null;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;

function buildImageContainer(files, resolution) {
    let container = document.createElement("div");
    container.className = "container";

    container.style.width = resolution.width + "px";
    container.style.height = resolution.height + "px";

    let background = document.createElement("div");
    background.className = "background";
    background.style.borderRadius = resolution.bevel;

    let template = document.createElement("div");
    template.className = "template";
    template.style.backgroundImage = `url("assets/${resolution.image}")`;


    let exportBtn = document.createElement("button");
    exportBtn.innerText = "Export";
    exportBtn.addEventListener('click', function () {
        // The raw information about the elements size and position
        const elemData = container.getBoundingClientRect();

        const options = {
            scrollX: -window.scrollX, // Fixes cutoff bug
            scrollY: -window.scrollY, // Fixes cutoff bug
            allowTaint: true, // Related to images
            x: elemData.x + 9, // Removes the margin
            y: elemData.y, // Corrects the y alignment
            width: elemData.width, // Forces the width to that of the image
            height: elemData.height, // Forces the height to that of the image
            scale: 1, // Makes the scale 1:1
        };

        // Converts the html to a canvas
        html2canvas(container, options).then(canvas => {
            $("#outputs").append(canvas);

            // If the user clicks the result it will prompt them for a download
            canvas.addEventListener('click', () => downloadCheck(canvas))
        });

        // Just a heads up
        if (!seenExportMessage) {
            seenExportMessage = true;

            alert("If you would like to save the image then click it below.")
        }
    });

    // This updates the button position and must be called once the element is added to the page
    // Uses the computed width of the button and offsets it 5 pixels to the right of the picture.
    container.updateButtonPosition = function() {
        exportBtn.style.right = "-" + (exportBtn.getBoundingClientRect().width + 5) + "px";
    };

    container.appendChild(background);
    container.appendChild(template);
    container.appendChild(exportBtn);

    resolution.background = background;
    resolution.currentDY = 0;
    resolution.beforeDY = 0;

    let dragstart = (e) => {
        if (!e.pageY && e.touches && e.touches[0]) {
            e.pageX = e.touches[0].pageX;
            e.pageY = e.touches[0].pageY;
        }
        currentDragElement = resolution;
        startX = lastX = e.pageX;
        startY = lastY = e.pageY;
    };

    template.addEventListener("mousedown", dragstart);
    template.addEventListener("touchstart", dragstart);

    return container;
}

/**
 * Confirm if they would like to download the canvas
 *
 * @param canvas the canvas to download
 */
function downloadCheck(canvas) {
    let result = confirm("Would you like to download this image?");

    if (result) {
        saveAs(canvas.toDataURL("image/png", 1), "template.png");
    }
}

function dragStop(e) {
    if (currentDragElement) {
        if (!e.pageY) {
            e.pageX = lastX;
            e.pageY = lastY;
        }
        let dy = e.pageY - startY;
        currentDragElement.beforeDY += dy;
    }
    currentDragElement = null
}

function dragMove(e) {
    if (currentDragElement != null) {
        if (!e.pageY && e.touches && e.touches[0]) {
            e.pageX = e.touches[0].pageX;
            e.pageY = e.touches[0].pageY;
        }
        onDrag(currentDragElement, lastX = e.pageX - startX, lastY = e.pageY - startY);
        e.preventDefault();
    }
}

document.addEventListener("mouseup", dragStop);
document.addEventListener("touchend", dragStop);
document.addEventListener("mousemove", dragMove);
document.addEventListener("touchmove", dragMove, {passive: false});

function upload(file) {
    console.log(file);

    if (!file.files || !file.files[0]) {
        return;
    }

    let fr = new FileReader();

    fr.onloadend = (e) => {
        // I couldn't get jquery working with this shit so I just used
        // normal javascript
        let format = 'url("' + e.target.result + '")';
        let fileThings = document.getElementById('files');

        for (let i = 0; i < fileThings.childElementCount; i++) {
            let component = fileThings.children[i];

            if (component.childElementCount > 0) {
                component.firstChild.style.backgroundImage = format;
            }
        }
    };

    fr.readAsDataURL(file.files[0]);
}

function onDrag(resolution, dx, dy) {
    let now = resolution.beforeDY + dy;

    resolution.background.style.setProperty("--dy", now);
}

// Sourced from https://jsfiddle.net/7ymv11ag/
function saveAs(uri, filename) {
    let link = document.createElement('a');
    if (typeof link.download === 'string') {
        link.href = uri;
        link.download = filename;

        //Firefox requires the link to be in the body
        document.body.appendChild(link);

        //simulate click
        link.click();

        //remove the link when done
        document.body.removeChild(link);
    } else {
        window.open(uri);
    }
}
