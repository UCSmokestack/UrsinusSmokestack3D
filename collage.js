let canvas = null;
let imagesPerRow = 9;
let imres = 100;

// Fisher-Yates shuffle code from Mike Bostock
// https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
    var m = array.length, t, i;
    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

function unwrap(idx, imagesPerRow) {
    col = idx%imagesPerRow;
    row = (idx-col)/imagesPerRow;
    return {'col':col, 'row':row};
}

annotationPromise.then(function() {
    imres = window.innerWidth/(imagesPerRow*1.1); // TODO: Change based on size of screen
    let nrows = allAnnotations.length/imagesPerRow;

    canvas = d3.select("div#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + window.innerWidth + " " + window.innerWidth*nrows/imagesPerRow)
    .classed("svg-content", true);

    for (var i = 0; i < allAnnotations.length; i++) {
        var data = allAnnotations[i];
        data.path = "paperNotes/" + data.text;
        data.hashValue = 0;
        rowcol = unwrap(i, imagesPerRow);
        allAnnotations[i].elem = canvas.append("svg:image")
        .attr("width", imres)
        .attr("height", imres)
        .attr("xlink:href", data.path)
        .attr('x', imres*rowcol.col*1.1)
        .attr('y', imres*rowcol.row*1.1)
        .attr("idx", i)
        .on("click", function() {
            var idx = d3.select(this).attr("idx");
            console.log(idx);
        })
        .on("touchstart", function() {
            var idx = d3.select(this).attr("idx");
            console.log(idx);
        });;
    }
});

function shuffleImages() {
    if (!annoPromiseFulfilled) {
        annotationPromise.then(shuffleImages);
    }
    else {
        let arr = new Float32Array(allAnnotations.length);
        arr = arr.map((x, i) => i);
        arr = shuffle(arr);
        allAnnotations.map((anno, idx) => {
            let rowcol = unwrap(arr[idx], imagesPerRow);
            anno.elem.transition()
            .attr('x', imres*rowcol.col*1.1)
            .attr('y', imres*rowcol.row*1.1)
        });
    }

}
