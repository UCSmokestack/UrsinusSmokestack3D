let progressBar = new ProgressBar();

let filename = 'models/Final/medres.obj';
let matname = 'models/Final/medres.mtl';
let canvas = new ArtCanvas({zpos: 3, 
                            pickingNew: false});
canvas.loadMesh(filename, matname);


let allAnnotations = [];
$.getJSON( "allAnnotations.json", function(data) {
    for (let i = 0; i < data.length; i++) {
        let x = 0;
        let y = 0;
        let z = 0;
        let N = 0;
        for (let j = 0; j < data[i].length; j++) {
            if (!(data[i][j].x > 10 || data[i][j].y > 10 || data[i][j].z > 10)) {
                x += data[i][j].x;
                y += data[i][j].y;
                z += data[i][j].z;
                N++;
            }
        }
        x /= N;
        y /= N;
        z /= N;
        let anno = {};
        anno.x = x;
        anno.y = y;
        anno.z = z;
        anno.text = data[i][data[i].length-1].text;
        allAnnotations.push(anno);
    }
    canvas.loadAnnotations(allAnnotations);
});