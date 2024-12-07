let q = (s) => {
    return document.querySelector(s);
};

let a = (s) => {
    return document.querySelectorAll(s);
}

Array.prototype.max = function() {
    return Math.max.apply(null, this);
};