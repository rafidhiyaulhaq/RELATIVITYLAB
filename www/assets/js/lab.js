q("body").onload = init3D;
a(".collapsible").forEach(e => {
    e.onclick = () => {
        e.classList.toggle("active");
        let content = q("#" + e.dataset.target);
        content.style.maxHeight = (content.style.maxHeight == "0px") ? content.scrollHeight + "px" : "0px";
    };
});
q("#animate-rotation").onclick = animateRotate;
let gamma = (v) => {
    return 1 / Math.sqrt(1 - Math.pow(v, 2));
};
let finalLength = (l0, v) => {
    return l0 / gamma(v);
};
let resizeCube = (velocity, normal) => {
    let initialLength = [...a(".length-input")].map((x)=>{return parseFloat(x.value)});
    maxInitialLength = initialLength.max();
    switch(normal) {
        case "x":
            xRatio = finalLength(initialLength[0] / maxInitialLength, velocity);
            q("#length-output-x").value = finalLength(q("#length-input-x").value, velocity);
            cubeObject = createModel( cube(maxInitialLength * objectSizeFactor, xRatio, yRatio, zRatio) );
            draw();
            break;
        case "y":
            yRatio = finalLength(initialLength[1] / maxInitialLength, velocity);
            q("#length-output-y").value = finalLength(q("#length-input-y").value, velocity);
            cubeObject = createModel( cube(maxInitialLength * objectSizeFactor, xRatio, yRatio, zRatio) );
            draw();
            break;
        case "z":
            zRatio = finalLength(initialLength[2] / maxInitialLength, velocity);
            q("#length-output-z").value = finalLength(q("#length-input-z").value, velocity);
            cubeObject = createModel( cube(maxInitialLength * objectSizeFactor, xRatio, yRatio, zRatio) );
            draw();
            break;
        default:
            break;
    }
}
a(".length-input").forEach(e => {
    e.oninput = () => {
        let normal = e.id.replace("length-input-","");
        resizeCube(q("#velocity-input-" + normal).value, normal);

        let initialLength = [...a(".length-input")].map((x)=>{return parseFloat(x.value)});
        maxInitialLength = initialLength.max();

        xRatio = initialLength[0] / maxInitialLength;
        yRatio = initialLength[1] / maxInitialLength;
        zRatio = initialLength[2] / maxInitialLength;

        cubeObject = createModel( cube(maxInitialLength * objectSizeFactor, xRatio, yRatio, zRatio) );
        draw();
    };
});
a(".velocity-slider").forEach(e => {
    e.oninput = () => {
        let normal = e.id.replace("velocity-slider-","");
        q("#velocity-input-" + normal).value = e.value;
        resizeCube(e.value, normal);
    };
});
a(".velocity-input").forEach(e => {
    e.oninput = () => {
        if (e.value > 0.999 || e.value < 0) {
            if (e.value > 0.999) {
                e.value = 0.999;
            } else {
                e.value = 0;
            }
        } else {
            let normal = e.id.replace("velocity-input-","");
            q("#velocity-slider-" + normal).value = e.value;  
            resizeCube(e.value, normal);
        }
    };
});
q("#rotation-velocity-input").oninput = () => {
    let newRotateFactor = parseFloat(q("#rotation-velocity-input").value);
    rotateFactor = newRotateFactor;
    q("#rotation-velocity-slider").value = newRotateFactor;
};
q("#rotation-velocity-slider").oninput = () => {
    let newRotateFactor = parseFloat(q("#rotation-velocity-slider").value);
    rotateFactor = newRotateFactor;
    q("#rotation-velocity-input").value = newRotateFactor;
};
q("#resize-cube-input").oninput = () => {
    let newObjectSizeFactor = parseFloat(q("#resize-cube-input").value);
    objectSizeFactor = newObjectSizeFactor;
    q("#resize-cube-slider").value = newObjectSizeFactor;
    cubeObject = createModel( cube(maxInitialLength * objectSizeFactor, xRatio, yRatio, zRatio) );
    draw();
};
q("#resize-cube-slider").oninput = () => {
    let newObjectSizeFactor = parseFloat(q("#resize-cube-slider").value);
    objectSizeFactor = newObjectSizeFactor;
    q("#resize-cube-input").value = newObjectSizeFactor;
    cubeObject = createModel( cube(maxInitialLength * objectSizeFactor, xRatio, yRatio, zRatio) );
    draw();
};
q("#home").onclick = () => {
    window.location.href = "/";
};
q("#exercise").onclick = () => {
    window.location.href = "/exercise.html";
};