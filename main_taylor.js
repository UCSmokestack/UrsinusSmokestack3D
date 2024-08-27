let progressBar = new ProgressBar();

let filename = 'models/Final/medres_inverted.obj';
let matname = 'models/Final/medres_inverted.mtl';
let canvas = new ArtCanvas({zpos: 3, 
                            pickingNew: false});
canvas.loadMesh(filename, matname);
annotationPromise.then(function() {
    canvas.loadAnnotations(allAnnotations);
});

