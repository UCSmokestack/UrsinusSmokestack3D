let progressBar = new ProgressBar();

let filename = 'models/Final/medres.obj';
let matname = 'models/Final/medres.mtl';
let canvas = new ArtCanvas(3, [0, -0.2, -0.1]);
canvas.loadMesh(filename, matname);
function toggleTexture() {
    canvas.toggleTexture();
}
function toggleX() {
    canvas.toggleX();
}
function toggleY() {
    canvas.toggleY();
}
function toggleZ() {
    canvas.toggleZ();
}
