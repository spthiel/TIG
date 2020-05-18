export function buildImages(image, positions, resolutions) {

    console.log(positions, resolutions);
    let promises = [];

    for(let i = 0; i < resolutions.length; i++) {

        let resolution = resolutions[i];
        let position = positions[i];

        let canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

        // set its dimension to target size
        canvas.width = resolution.width;
        canvas.height = resolution.height;

        promises.push(new Promise((accept, reject) => {
            let img = new Image();
            img.onload = () => {
                ctx.drawImage(img, position.x, position.y, image.width - 2*position.zoom, image.height - 2*position.zoom);
                accept({uri:canvas.toDataURL(), resolution:resolution});
            }
            img.src = image.image;
        }))
        // draw source image into the off-screen canvas:
        // ctx.drawImage(image.image, position.x, position.y, image.width, image.height);
        //
        // out.push(canvas.toDataURL());

    }
    return Promise.all(promises);

}