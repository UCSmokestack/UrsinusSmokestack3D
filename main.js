let progressBar = new ProgressBar();

let filename = 'models/Final/medres.obj';
let matname = 'models/Final/medres.mtl';
let canvas = new ArtCanvas({zpos: 3, 
                            pickingNew: false});
canvas.loadMesh(filename, matname);
annotationPromise.then(function() {
    canvas.loadAnnotations(allAnnotations);
});

