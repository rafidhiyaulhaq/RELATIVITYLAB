function objectRotator(canvas, callback, viewDistance, rotY, rotX) {
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("touchstart", doTouchStart, false);
    //canvas.addEventListener("wheel", doScroll, false);
    var rotateX = (rotX === undefined)? 0 : rotX;
    var rotateY = (rotY === undefined)? 0 : rotY;
    var xLimit = 85;
    var center;
    var degreesPerPixelX = 90 / canvas.height;
    var degreesPerPixelY = 180 / canvas.width; 
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
        var cosX = Math.cos(rotateX/180*Math.PI);
        var sinX = Math.sin(rotateX/180*Math.PI);
        var cosY = Math.cos(rotateY/180*Math.PI);
        var sinY = Math.sin(rotateY/180*Math.PI);
        var mat = [
            cosY, sinX*sinY, -cosX*sinY, 0,
            0, cosX, sinX, 0,
            sinY, -sinX*cosY, cosX*cosY, 0,
            0, 0, 0, 1
        ];
        if (center !== undefined) {
            var t0 = center[0] - mat[0]*center[0] - mat[4]*center[1] - mat[8]*center[2];
            var t1 = center[1] - mat[1]*center[0] - mat[5]*center[1] - mat[9]*center[2];
            var t2 = center[2] - mat[2]*center[0] - mat[6]*center[1] - mat[10]*center[2];
            mat[12] = t0;
            mat[13] = t1;
            mat[14] = t2;
        }
        if (viewDistance !== undefined) {
            mat[14] -= viewDistance;
        }
        return mat;
    };
    var prevX, prevY;
    var dragging = false;
    var touchStarted = false;
    function doMouseDown(evt) {
        if (isRotating) {
            isRotating = false;
            rotateInterrupted = true;
            clearInterval(rotateInterval);
            reAnimateTimeout = setTimeout(animateRotate, reAnimateInterval);
        } else {
            if (rotateInterrupted) {
                clearTimeout(reAnimateTimeout);
                reAnimateTimeout = setTimeout(animateRotate, reAnimateInterval);
            }
        }
        if (dragging) {
            return;
        }
        dragging = true;
        document.addEventListener("mousemove", doMouseDrag, false);
        document.addEventListener("mouseup", doMouseUp, false);
        var r = canvas.getBoundingClientRect();
        prevX = evt.clientX - r.left;
        prevY = evt.clientY - r.top;
    }
    function doMouseDrag(evt) {
        if (!dragging) {
            return; 
        }
        var r = canvas.getBoundingClientRect();
        var x = evt.clientX - r.left;
        var y = evt.clientY - r.top;
        var newRotX = rotateX + degreesPerPixelX * (y - prevY);
        var newRotY = rotateY + degreesPerPixelY * (x - prevX);
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
            rotateInterrupted = true;
            clearInterval(rotateInterval);
            reAnimateTimeout = setTimeout(animateRotate, reAnimateInterval);
        } else {
            if (rotateInterrupted) {
                clearTimeout(reAnimateTimeout);
                reAnimateTimeout = setTimeout(animateRotate, reAnimateInterval);
            }
        }
        if (evt.touches.length != 1) {
           doTouchCancel();
           return;
        }
        evt.preventDefault();
        var r = canvas.getBoundingClientRect();
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
            objectSize += resizeFactor;
        } else {
            objectSize -= resizeFactor;
        }
        sphereObject = createModel( uvSphere(objectSize, 64, 32) );
        draw();
    }
    function doTouchMove(evt) {
        if (evt.touches.length != 1 || !touchStarted) {
           doTouchCancel();
           return;
        }
        evt.preventDefault();
        var r = canvas.getBoundingClientRect();
        var x = evt.touches[0].clientX - r.left;
        var y = evt.touches[0].clientY - r.top;
        var newRotX = rotateX + degreesPerPixelX * (y - prevY);
        var newRotY = rotateY + degreesPerPixelY * (x - prevX);
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
