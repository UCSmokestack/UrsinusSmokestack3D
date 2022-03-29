let progressBar = new ProgressBar();

let filename = 'models/Final/medres.obj';
let matname = 'models/Final/medres.mtl';
let canvas = new ArtCanvas({zpos: 3, 
                            pickingNew: false});
canvas.loadMesh(filename, matname);


let allAnnotations = [];
$.getJSON( "allAnnotations.json", function(data) {
    // Step 1: Filter out spurious annotations
    for (let i = 0; i < data.length; i++) {
        // First save text just in case the last one is filtered out
        let anno = {};
        anno.text = data[i][data[i].length-1].text;
        allAnnotations.push(anno);
        data[i] = data[i].filter(elem => 
            elem.x < 10 && elem.y < 10 && elem.z < 10
        );
    }
    // Step 2: Compute centroids and add all annotations to the model
    for (let i = 0; i < data.length; i++) {
        let x = 0;
        let y = 0;
        let z = 0;
        for (let j = 0; j < data[i].length; j++) {
            x += data[i][j].x;
            y += data[i][j].y;
            z += data[i][j].z;
        }
        x /= data[i].length;
        y /= data[i].length;
        z /= data[i].length;
        let anno = {};
        anno.x = x;
        anno.y = y;
        anno.z = z;
        anno.text = data[i][data[i].length-1].text;
        allAnnotations.push(anno);
    }
    canvas.loadAnnotations(allAnnotations);
});