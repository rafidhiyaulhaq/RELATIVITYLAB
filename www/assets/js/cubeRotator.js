let rotateX, rotateY;
function objectRotator(canvas, callback, viewDistance, rotY, rotX) {
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("touchstart", doTouchStart, false);
    canvas.addEventListener("wheel", doScroll, false);
    rotateX = (rotX === undefined)? 0 : rotX;
    rotateY = (rotY === undefined)? 0 : rotY;
    let xLimit = 85;
    let center;
    let degreesPerPixelX = 90 / canvas.height;
    let degreesPerPixelY = 180 / canvas.width; 
    this.getXLimit = function() {
        return xLimit;
    };
    this.setXLimit = function(limitInDegrees) {
        xLimit = Math.min(85,Math.max(0,limitInDegrees));
    };
    this.getRotationCenter = function() {
        return (center === undefined) ? [0,0,0] : center;
    };
    this.setRotationCenter = function(rotationCenter) {
        center = rotationCenter;
    };
    this.setAngles = function( rotY, rotX ) {
        rotateX = Math.max(-xLimit, Math.min(xLimit,rotX));
        rotateY = rotY;
        if (callback) {
            callback();
        }
    };
    this.getAngles = function() {
        return [rotateX,rotateY];
    };
    this.setViewDistance = function( dist ) {
        viewDistance = dist;
    };
    this.getViewDistance = function() {
        return (viewDistance === undefined)? 0 : viewDistance;
    };
    this.getViewMatrix = function() {
        let cosX = Math.cos(rotateX/180*Math.PI);
        let sinX = Math.sin(rotateX/180*Math.PI);
        let cosY = Math.cos(rotateY/180*Math.PI);
        let sinY = Math.sin(rotateY/180*Math.PI);
        let mat = [
            cosY, sinX*sinY, -cosX*sinY, 0,
            0, cosX, sinX, 0,
            sinY, -sinX*cosY, cosX*cosY, 0,
            0, 0, 0, 1
        ];
        if (center !== undefined) {
            let t0 = center[0] - mat[0]*center[0] - mat[4]*center[1] - mat[8]*center[2];
            let t1 = center[1] - mat[1]*center[0] - mat[5]*center[1] - mat[9]*center[2];
            let t2 = center[2] - mat[2]*center[0] - mat[6]*center[1] - mat[10]*center[2];
            mat[12] = t0;
            mat[13] = t1;
            mat[14] = t2;
        }
        if (viewDistance !== undefined) {
            mat[14] -= viewDistance;
        }
        return mat;
    };
    let prevX, prevY;
    let dragging = false;
    let touchStarted = false;
    function doMouseDown(evt) {
        if (isRotating) {
            isRotating = false;
            clearInterval(rotateInterval);
        }
        if (dragging) {
            return;
        }
        dragging = true;
        document.addEventListener("mousemove", doMouseDrag, false);
        document.addEventListener("mouseup", doMouseUp, false);
        let r = canvas.getBoundingClientRect();
        prevX = evt.clientX - r.left;
        prevY = evt.clientY - r.top;
    }
    function doMouseDrag(evt) {
        if (!dragging) {
            return; 
        }
        let r = canvas.getBoundingClientRect();
        let x = evt.clientX - r.left;
        let y = evt.clientY - r.top;
        let newRotX = rotateX + degreesPerPixelX * (y - prevY);
        let newRotY = rotateY + degreesPerPixelY * (x - prevX);
        newRotX = Math.max(-xLimit, Math.min(xLimit,newRotX));
        prevX = x;
        prevY = y;
        if (newRotX != rotateX || newRotY != rotateY) {
            rotateX = newRotX;
            rotateY = newRotY;
            if (callback) {
                callback();
            }
        }
    }
    function doMouseUp(evt) {
        if (!dragging) {
            return;
        }
        dragging = false;
        document.removeEventListener("mousemove", doMouseDrag, false);
        document.removeEventListener("mouseup", doMouseUp, false);
    }
    function doTouchStart(evt) {   
        if (isRotating) {
            isRotating = false;
            clearInterval(rotateInterval);
        }
        if (evt.touches.length != 1) {
           doTouchCancel();
           return;
        }
        evt.preventDefault();
        let r = canvas.getBoundingClientRect();
        prevX = evt.touches[0].clientX - r.left;
        prevY = evt.touches[0].clientY - r.top;
        canvas.addEventListener("touchmove", doTouchMove, false);
        canvas.addEventListener("touchend", doTouchEnd, false);
        canvas.addEventListener("touchcancel", doTouchCancel, false);
        touchStarted = true;
    }
    function doScroll(evt) {
        /*
        if (isRotating) {
            isRotating = false;
            clearInterval(rotateInterval);
        }
        */
        let resizeFactor = 0.05;
        if (evt.deltaY < 0) {
            if (objectSizeFactor < 2) {
                objectSizeFactor += resizeFactor;
            }
        } else {
            if (objectSizeFactor > 0.051) {
                objectSizeFactor -= resizeFactor;
            }
        }
        q("#resize-cube-input").value = objectSizeFactor;
        q("#resize-cube-slider").value = objectSizeFactor;
        cubeObject = createModel( cube(maxInitialLength * objectSizeFactor, xRatio, yRatio, zRatio) );
        draw();
    }
    function doTouchMove(evt) {
        if (evt.touches.length != 1 || !touchStarted) {
           doTouchCancel();
           return;
        }
        evt.preventDefault();
        let r = canvas.getBoundingClientRect();
        let x = evt.touches[0].clientX - r.left;
        let y = evt.touches[0].clientY - r.top;
        let newRotX = rotateX + degreesPerPixelX * (y - prevY);
        let newRotY = rotateY + degreesPerPixelY * (x - prevX);
        newRotX = Math.max(-xLimit, Math.min(xLimit,newRotX));
        prevX = x;
        prevY = y;
        if (newRotX != rotateX || newRotY != rotateY) {
            rotateX = newRotX;
            rotateY = newRotY;
            if (callback) {
                callback();
            }
        }
    }
    function doTouchEnd(evt) {
        doTouchCancel();
    }
    function doTouchCancel() {
        if (touchStarted) {
           touchStarted = false;
           canvas.removeEventListener("touchmove", doTouchMove, false);
           canvas.removeEventListener("touchend", doTouchEnd, false);
           canvas.removeEventListener("touchcancel", doTouchCancel, false);
        }
    }
}
