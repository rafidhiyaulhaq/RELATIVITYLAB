"use strict";

const shaderSource = {
    vertex: `
     uniform mat4 projection;
     uniform mat4 modelview;
     attribute vec3 coords;
     attribute vec3 normal;
     varying vec3 v_eyeCoords;
     varying vec3 v_normal;
     void main() {
        vec4 eyeCoords = modelview * vec4(coords,1.0);
        gl_Position = projection * eyeCoords;
        v_eyeCoords = eyeCoords.xyz;
        v_normal = normalize(normal);
     }`,
    fragment: `
     precision mediump float;
     varying vec3 vCoords;
     varying vec3 v_normal;
     varying vec3 v_eyeCoords;
     uniform samplerCube skybox;
     uniform mat3 normalMatrix;
     uniform mat3 inverseViewTransform;
     void main() {
          vec3 N = normalize(normalMatrix * v_normal);
          vec3 V = -v_eyeCoords;
          vec3 R = 2.0 * dot(V,N) * N;
          vec3 T = inverseViewTransform * R;
          gl_FragColor = textureCube(skybox, T);
     }`
};

let gl;

let a_coords_loc;
let a_normal_loc;
let u_projection;    
let u_modelview;
let u_normalMatrix;
let u_inverseViewTransform;
let program;

const projection = mat4.create();
let modelview;
const normalMatrix = mat3.create();
const inverseViewTransform = mat3.create();

let texID;

let sphereObject;

let rotator;

let rotX = 0, rotY = 0;

let objectID = 0;

function draw() {
    gl.clearColor(0,0,0,0.1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    modelview = rotator.getViewMatrix();
    mat3.normalFromMat4(normalMatrix, modelview);
    
    mat3.fromMat4(inverseViewTransform, modelview);
    mat3.invert(inverseViewTransform,inverseViewTransform);

    mat4.rotateX(modelview,modelview,rotX);
    mat4.rotateY(modelview,modelview,rotY);
    
    mat3.normalFromMat4(normalMatrix, modelview);
    
    gl.useProgram(program);
    gl.depthMask(true);
    if (texID) {
        gl.enableVertexAttribArray(a_coords_loc);
        gl.enableVertexAttribArray(a_normal_loc);
        sphereObject.render();  
        gl.disableVertexAttribArray(a_coords_loc);
        gl.disableVertexAttribArray(a_normal_loc);
    }
}

function loadTextureCube() {
    let ct = 0;
    let img = new Array(6);
    let cubeMapTexture = "globe";
    let cubeMapFormat = "png";
    let urls = [
       `assets/img/skybox/${cubeMapTexture}/back.${cubeMapFormat}`, `assets/img/skybox/${cubeMapTexture}/front.${cubeMapFormat}`, 
       `assets/img/skybox/${cubeMapTexture}/top.${cubeMapFormat}`, `assets/img/skybox/${cubeMapTexture}/bottom.${cubeMapFormat}`, 
       `assets/img/skybox/${cubeMapTexture}/right.${cubeMapFormat}`, `assets/img/skybox/${cubeMapTexture}/left.${cubeMapFormat}`
    ];
    for (let i = 0; i < 6; i++) {
        img[i] = new Image();
        img[i].onload = function() {
            ct++;
            if (ct == 6) {
                texID = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texID);
                let targets = [
                   gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
                   gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
                   gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
                ];
                try {
                    for (let j = 0; j < 6; j++) {
                        gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    }
                } catch(e) {
                    document.getElementById("canvas-holder").innerHTML = "ERROR: CANNOT ACCESS CUBEMAP TEXTURE IMAGES";
                }
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                draw();
            }
        };
        img[i].onerror = function() {
             document.getElementById("canvas-holder").innerHTML = "ERROR WHILE TRYING TO LOAD CUBEMAP TEXTURE";
        };
        img[i].src = urls[i];
    }
}


function createModel(modelData) {
    let model = {};
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
    model.render = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(a_coords_loc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(u_modelview, false, modelview );
        gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);
        gl.uniformMatrix3fv(u_inverseViewTransform, false, inverseViewTransform);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    };
    return model;
}

/*
function createModelskyBox(modelData) {
    let model = {};
    model.coordsBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
    model.render = function() { 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(a_coords_loc_skyBox, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(u_modelview_skyBox, false, modelview );
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    };
    return model;
}
*/

function doKey(evt) {
    let rotationChanged = true;
    switch (evt.keyCode) {
        case 37: rotY -= 0.15; break;        // left arrow
        case 39: rotY +=  0.15; break;       // right arrow
        case 38: rotX -= 0.15; break;        // up arrow
        case 40: rotX += 0.15; break;        // down arrow
        case 13:                             // return
        case 36:                             // home
            rotX = rotY = 0;
            rotator.setAngles(0,0);
            break;
        default: rotationChanged = false;
    }
    if (rotationChanged) {
        evt.preventDefault();
        draw();
    }
}

function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource(vsh,vShader);
    gl.compileShader(vsh);
    if ( ! gl.getShaderParameter(vsh, gl.COMPILE_STATUS) ) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
     }
    let fsh = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if ( ! gl.getShaderParameter(fsh, gl.COMPILE_STATUS) ) {
       throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }
    let program = gl.createProgram();
    gl.attachShader(program, vsh);
    gl.attachShader(program, fsh);
    gl.linkProgram(program);
    if ( ! gl.getProgramParameter( program, gl.LINK_STATUS) ) {
       throw new Error("Link error in program:  " + gl.getProgramInfoLog(program));
    }
    return program;
}

let objectSize = 0.4;
function initGL() {
    program = createProgram(gl, shaderSource.vertex, shaderSource.fragment );
    a_coords_loc =  gl.getAttribLocation(program, "coords");
    a_normal_loc =  gl.getAttribLocation(program, "normal");
    u_modelview = gl.getUniformLocation(program, "modelview");
    u_projection = gl.getUniformLocation(program, "projection");
    u_normalMatrix = gl.getUniformLocation(program, "normalMatrix");
    u_inverseViewTransform = gl.getUniformLocation(program, "inverseViewTransform");
    gl.enable(gl.DEPTH_TEST);
    
    gl.useProgram(program);
    mat4.perspective(projection, Math.PI/4, 1, 1, 10);
    gl.uniformMatrix4fv(u_projection, false, projection);
    
    sphereObject = createModel( uvSphere(objectSize, 64, 32) );
}

let rotateInterval;
let isRotating = false;
let reAnimateTimeout;
let reAnimateInterval = 1000;
let rotateInterrupted = false;
let isExpanding = true;
let expandFactor = 0.0001;
function animateRotate() {
    if (!isRotating) {
        isRotating = true;
        rotateInterrupted = false;
        let counter = 0;
        let currentAngles = rotator.getAngles();
        rotateInterval = setInterval(()=>{
            rotator.setAngles(currentAngles[1] + counter/10, currentAngles[0]);
            counter++;

            if (isExpanding) {
                objectSize += expandFactor;
            } else {
                objectSize -= expandFactor;
            }
            draw();
            sphereObject = createModel( uvSphere(objectSize, 64, 32) );
            if (objectSize >= 0.7) {
                isExpanding = false;
            } else if (objectSize <= 0.2) {
                isExpanding = true;
            }
        }, 1);
    }
}
function init3D() {
    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if ( ! gl ) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e.message + "</p>";
        return;
    }
    document.addEventListener("keydown", doKey, false);
    /* 
    document.getElementById("reset").onclick = function() {
        rotX = rotY = 0;
        rotator.setAngles(0,0);
        draw();        
    };
    */
    rotator = new objectRotator(canvas, draw, 5, 0, 20);
    loadTextureCube();

    animateRotate();
}

