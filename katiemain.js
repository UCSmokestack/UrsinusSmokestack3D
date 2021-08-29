let progressBar = new ProgressBar();

let filename = 'models/Final/medres.obj';
let matname = 'models/Final/medres.mtl';
let canvas = new ArtCanvas({zpos: 3, 
                            objoff: [0, -0.2, -0.1], 
                            pickingNew: true});
canvas.loadMesh(filename, matname);

function saveAnnotations() {
    canvas.saveAnnotations();
}

let annoInput = document.getElementById('annoInput');
annoInput.addEventListener('change', function(e) {
    let reader = new FileReader();
    reader.onload = function(e) {
        let data = e.target.result;
        try {
            data = JSON.parse(data);
        }
        catch(error) {
            progressBar.setLoadingFailed("Error parsing annotations file");
            throw(error);
        }
        canvas.loadAnnotations(data);
    }
    reader.readAsText(annoInput.files[0]);
});