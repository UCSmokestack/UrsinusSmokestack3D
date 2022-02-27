let progressBar = new ProgressBar();

let filename = 'models/Final/cut1_flat.obj';
let matname = 'models/Final/cut1.mtl';
let canvas = new ArtCanvas({zpos: 3, 
                            pickingNew: false});
canvas.loadMesh(filename, matname);
