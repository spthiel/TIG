export function setup(resolutions) {
    if (window.hasListeners) {
        return;
    }
    window.hasListeners = true;

    document.addEventListener('mousedown', wrapMouseEvent(onPress));
    document.addEventListener('mousemove', wrapMouseEvent(onMove), {capture: true});
    document.addEventListener('mouseup', wrapMouseEvent(onRelease));

    document.addEventListener('touchstart', wrapTouchEvent(onPress));
    document.addEventListener('touchmove', wrapTouchEvent(onMove), {passive: false, capture: true});
    document.addEventListener('touchend', wrapTouchEvent(onRelease));

    window.clickStart = {x: 0, y: 0};
    window.touchStarts = [];
    window.touchMeanStart = {x: 0, y: 0};
    window.zoomStart = 0;

}

function updateStyle() {

}

/**
 * @typedef {object} InnerEvent
 * @property {int} x
 * @property {int} y
 * @property {HTMLElement | undefined} target
 */

/**
 *
 * @param {InnerEvent} event
 */
function onPress(event) {
    console.log(event);
}

/**
 *
 * @param {InnerEvent} event
 */
function onMove(event) {

}

/**
 * @param {InnerEvent} event
 */
function onRelease(event) {

}

/**
 *
 * @param {number} distance
 */
function onZoom(distance) {

}

/**
 *
 * @param {function(InnerEvent)} f
 * @returns {function(TouchEvent)}
 */
const wrapTouchEvent = (f) => (event) => {
    if (!event.touches) {
        return;
    }
    if (event.touches.length !== 2) {
        return;
    }

    const angle = getTouchangle(event.touches);

    if(angle === -1) {
        return;
    }

    /**
     *
     * @type {InnerEvent}
     */
    const newEvent = getMeanPos(event.touches);
    newEvent.target = getTouchTarget(event.touches);

    if(angle >= 1.5 && angle <= 1.5) {
        onZoom(getTouchDistance(event.touches));
    }

    f(event);
}

/**
 *
 * @param {TouchList} touches
 * @return {HTMLElement}
 */
const getTouchTarget = (touches) => {
    let target;
    for(const touch of touches) {
        let currentElement = touch.target;
        while(currentElement !== document) {

            if (currentElement.hasAttribute && currentElement.hasAttribute("id")) {
                let id = currentElement.getAttribute("id");
                if (id.startsWith("resolution-")) {
                    if(target && target !== currentElement) {
                        return undefined;
                    }
                    target = currentElement;
                    break;
                }
            }

            currentElement = currentElement.parentElement
        }
        if(!target) {
            return undefined;
        }
    }
    return target;
}

/**
 * @param {TouchList} touches
 * @return {number} distance
 */
const getTouchDistance = (touches) => {
    const dx = touches[0].x - touches[1].x;
    const dy = touches[0].y - touches[1].y;
    return Squareroot(dx * dx + dy * dy);
}

/**
 *
 * @param {number} number
 * @return {int}
 */
const Squareroot = (number) => {
    let lo = 0, hi = number;
    while(lo <= hi) {
        let mid = Math.floor((lo + hi) / 2);
        if(mid * mid > number) hi = mid - 1;
        else lo = mid + 1;
    }
    return hi;
}

/**
 *
 * @param {TouchList} touches
 * @return {{x:int, y:int}}
 */
const getMeanPos = (touches) => {

    const out = {};
    out.x = (touches[0].x + (touches[1].x - touches[0].x)/2) | 0
    out.y = (touches[0].y + (touches[1].y - touches[0].y)/2) | 0
    return out;
}

/**
 * @param {function(InnerEvent)} f
 * @returns {function(MouseEvent)}
 */
const wrapMouseEvent = (f) => (event) => {
    /**
     * @type {InnerEvent}
     */
    let eventOut = {};
    eventOut.x = event.pageX | 0;
    eventOut.y = event.pageY | 0;

    for (let e of event.composedPath()) {
        if (e.hasAttribute && e.hasAttribute("id")) {
            let id = e.getAttribute("id");
            if (id.startsWith("resolution-")) {
                eventOut.target = e;
                break;
            }
        }
    }
    f(eventOut);
}

/**
 *
 * @param {TouchList} touchList
 * @return {number} angle
 */
const getTouchangle = (touchList) => {

    if(window.touchStarts.length === 0) {
        window.touchStarts.length = touchList;
        return -1;
    }

    const dx1 = touchList[0].x - window.touchStarts[0].x;
    const dy1 = touchList[0].y - window.touchStarts[0].y;
    const dx2 = touchList[1].x - window.touchStarts[1].x;
    const dy2 = touchList[1].y - window.touchStarts[1].y;

    return getDifference(dx1, dy1, dx2, dy2);

}

/**
 *
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @return {number}
 */
const getDifference = (x1, y1, x2, y2) => {

    const dist1 = x1 * x1 + y1 * y1;
    const dist2 = x2 * x2 + y2 * y2;

    const v1 = dist1 < 100 ? -1 : getDiamondAngle(x1, y1);
    const v2 = dist2 < 100 ? -1 : getDiamondAngle(x2, y2);

    if(v1 === -1 || v2 === -1) {
        return v1 === -1 && v2 === -1 ? -1 : 2;
    }

    const diff = v2 - v1;
    if (diff > 2) {
        return 4 - diff;
    } else {
        return diff;
    }

}

/**
 *
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
const getDiamondAngle = (x, y) => {
    if(x === 0 && y === 0) {
        return -1;
    }
    if (y >= 0) {
        return (x >= 0 ? y / (x + y) : 1 - x / (-x + y));
    } else {
        return (x < 0 ? 2 - y / (-x - y) : 3 + x / (x - y));
    }
}