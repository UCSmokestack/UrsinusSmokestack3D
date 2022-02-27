let progressBar = new ProgressBar();

let filename = 'models/Final/cut2_flat.obj';
let matname = 'models/Final/cut2.mtl';
let canvas = new ArtCanvas({zpos: -3, 
                            pickingNew: false});
canvas.loadMesh(filename, matname);
