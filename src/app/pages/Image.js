import React, {useCallback, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";

const useStyle = makeStyles(theme => ({
    image: {
        position: 'relative',
        backgroundImage: props => props.image ? `url("${props.image}")` : "linear-gradient(45deg, purple, aqua)",
        width: props => props.resolution.width,
        height: props => props.resolution.height,
        backgroundSize: props => `${props.width || props.resolution.width}px ${props.height || props.resolution.height}px`,
        backgroundColor: 'crimson',
        backgroundPosition: props => `${props.x || 0}px ${props.y || 0}px`
    },
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundImage: props => `url("overlays/${props.resolution.image}")`
    }
}));


const onMove = (event, props, setMouseDown, mouseDown, position) => {
    if(mouseDown.state) {
        event.preventDefault();
        const pageY = event.pageY | 0;
        const pageX = event.pageX | 0;
        if(mouseDown.pageX === pageX && mouseDown.pageY === pageY) {
            return;
        }
        setMouseDown({state: true, pageX: pageX, pageY: pageY});
        let dy = pageY-mouseDown.pageY;
        let dx = pageX-mouseDown.pageX;
        let imageWidth = props.image.width - 2*position.zoom;
        let imageHeight = props.image.height - 2*position.zoom;
        if(dx === 0 && dy === 0) {
            return;
        }
        let x = position.x + dx;
        let y = position.y + dy;
        if(x > 0) {
            x = 0;
        } else if(imageWidth + x < props.resolution.width) {
            x = props.resolution.width - imageWidth;
        }

        if(y > 0) {
            y = 0;
        } else if(imageHeight + y < props.resolution.height) {
            y = props.resolution.height - imageHeight;
        }

        if(x === position.x && y === position.y) {
            return;
        }

        props.setPosition({x: x, y: y, zoom: position.zoom});
    }
};

const onRelease = (event, props, setMouseDown) => {
    console.log("Release");
    setMouseDown({state:false, pageX: 0, pageY: 0});
};

const onPress = (event, props, setMouseDown) => {
    if(props.image && props.image.image) {
        setMouseDown({state: true, pageX: event.pageX | 0, pageY: event.pageY | 0})
    }
};

const wrapMouseEvent = (f, props, setMouseDown, mouseDown, position) => (event) => {
    f(event, props, setMouseDown, mouseDown, position);
}

const wrapTouchEvent = (f, props, setMouseDown, mouseDown, position) => (event) => {
    if(!event.pageX) {
        if(event.touches && event.touches[0]) {
            event.pageX = event.touches[0].pageX;
            event.pageY = event.touches[0].pageY;
        } else {
            event.pageX = 0;
            event.pageY = 0;
        }
    }
    f(event, props, setMouseDown, mouseDown, position);
}

export default function Image(props) {

    let position, width, height;
    if(props.image) {
        position = props.position;
        width = props.image.width - 2*(position.zoom || 0);
        height = props.image.height - 2*(position.zoom || 0);
    }

    let classes = useStyle(props.image ? {image: props.image.image, x: position.x, y:position.y, width: width, height: height, resolution: props.resolution} : props);


    let [mouseDown, setMouseDown] = useState({state: false, pageX: 0, pageY: 0});

    const setPosition = props.setPosition;

    useEffect(() => {

        console.log("useEffect")

        let listeners = [
            {"type":"mousemove","listener": wrapMouseEvent(onMove, setPosition, setMouseDown, mouseDown, position), "options": {passive: false, capture: true}},
            {"type":"mouseup","listener": event => onRelease(event, setPosition, setMouseDown, mouseDown, position)},
            
            {"type":"touchmove","listener": wrapTouchEvent(onMove, setPosition, setMouseDown, mouseDown, position), "options": {passive: false, capture: true}},
            {"type":"touchend","listener": event => onRelease(event, setPosition, setMouseDown, mouseDown, position)}
        ]

        for(let listener of listeners) {
            document.addEventListener(listener.type, listener.listener, listener.options);
        }
        return () => {
            for(let listener of listeners) {
                document.removeEventListener(listener.type, listener.listener, listener.options);
            }
        }
    }, []);

    return (
        <div id={"resolution-" + props.resolution.i} onMouseDown={wrapMouseEvent(onPress)} onTouchStart={wrapTouchEvent(onPress)} className={classes.image}>
            <div className={classes.overlay}/>
        </div>
    )
}