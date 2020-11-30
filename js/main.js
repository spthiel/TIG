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
        "bevel": "20px 20px"
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
    template.style.borderRadius = resolution.bevel;


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

        // Mobiles break shit
        if (window.mobileCheck()) {
            options["x"] = elemData.x;
        }

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

window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br([ev])w|bumb|bw-([nu])|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do([cp])o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly([-_])|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-([mpt])|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c([- _agpst])|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac([ \-\/])|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja([tv])a|jbro|jemu|jigs|kddi|keji|kgt([ \/])|klon|kpt |kwc-|kyo([ck])|le(no|xi)|lg( g|\/([klu])|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t([- ov])|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30([02])|n50([025])|n7(0([01])|10)|ne(([cm])-|on|tf|wf|wg|wt)|nok([6i])|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan([adt])|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c([-01])|47|mc|nd|ri)|sgh-|shar|sie([-m])|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel([im])|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c([- ])|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};
