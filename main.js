let progressBar = new ProgressBar();

let filename = 'models/Final/medres.obj';
let matname = 'models/Final/medres.mtl';
let canvas = new ArtCanvas({zpos: 3, 
                            objoff: [0, -0.2, -0.1], 
                            pickingNew: false});
canvas.loadMesh(filename, matname);
