let progressBar = new ProgressBar();

let filename = 'models/Final/medres.obj';
let matname = 'models/Final/medres.mtl';
let canvas = new ArtCanvas(3, [0, -0.2, -0.1]);
canvas.loadMesh(filename, matname);