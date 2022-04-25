function bunny(p1, p2, p3){
    let normal;

    let center = {"x":(p1.x+p2.x+p3.x)/3, "y":(p1.y+p2.y+p3.y)/3, "z":(p1.z+p2.z+p3.z)/3};

    // make two vectors
    let a = {"x":p2.x - p1.x, "y":p2.y - p1.y, "z":p2.z - p1.z};
    let b = {"x":p3.x - p1.x, "y":p3.y - p1.y, "z":p3.z - p1.z};

    // caclculate cross product
    let norm1 = {"x":(a.y*b.z - a.z*b.y), "y":(a.z*b.x - a.x*b.z), "z":(a.x*b.y - a.y*b.x)};
    let norm2 = {"x":-1 * norm1.x, "y":-1 * norm1.y, "z":-1 * norm1.z};

    // distances between the center and the two normal vectors
    let dist1 = ((center.x-norm1.x)**2 + (center.y-norm1.y)**2 + (center.z-norm1.z)**2)**0.5;
    let dist2 = ((center.x-norm2.x)**2 + (center.y-norm2.y)**2 + (center.z-norm2.z)**2)**0.5;

    // pick the normal that is closest to the center point
    if(dist1 < dist2){
        normal = norm1;
    }
    else{
        normal = norm2;
    }

    let magnitude = (normal.x**2 + normal.y**2 + normal.z**2)**0.5;
    normal.x /= magnitude;
    normal.y /= magnitude;
    normal.z /= magnitude;

    // return value
    return normal;
}


let allAnnotations = [];
let annoPromiseFulfilled = false;
let annotationPromise = new Promise((resolve, reject) => {
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

            let third = Math.floor(data[i].length / 3);
            let p1 = data[i][0];
            let p2 = data[i][third];
            let p3 = data[i][third * 2];
            let normal = bunny(p1, p2, p3);
            let power = 0.03125;
            let push = {"x":normal.x * power, "y":normal.y * power, "z":normal.z * power}

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

            let anno = allAnnotations[i];

            anno.x = x + push.x;
            anno.y = y + push.y;
            anno.z = z + push.z;
        }
        annoPromiseFulfilled = true;
        resolve();
    });
});