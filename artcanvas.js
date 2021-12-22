// https://threejsfundamentals.org/threejs/lessons/threejs-load-obj.html
// https://threejsfundamentals.org/threejs/lessons/threejs-picking.html
// https://threejs.org/docs/#api/en/core/BufferGeometry 
// https://discourse.threejs.org/t/solved-geometry-vertices-is-undefined/3133
// https://stackoverflow.com/questions/59949791/how-to-get-vertices-of-obj-model-object-in-three-js
// https://www.howtobuildsoftware.com/index.php/how-do/b2Qd/javascript-threejs-how-to-access-the-vertices-after-loading-object-with-objloader-in-threejs
// ray caster
// https://threejs.org/docs/index.html?q=ray#api/en/core/Raycaster 


const SPHERE_SIZE = 0.02;

// center the model
// fix github
class ArtCanvas {
    constructor(params) {
        const that = this;
        this.objoff = params.objoff;
        let canvas = document.getElementById("threecanvas");
        const gl = canvas.getContext('webgl');
        this.gl = gl;
        this.pixels = new Uint8Array(4);
        this.red = 0;
        this.green = 0;
        this.blue = 0;
        this.alpha = 0;
        this.spot = [0,0,0];

        // Setup annotations area
        this.annotations = [];
        this.pickingNew = false; // Whether we're able to pick new areas 
        this.pickedSphere = null;
        if ('pickingNew' in params) {
            this.pickingNew = params['pickingNew'];
        }
        this.annoTextBox = document.getElementById("annoTextBox");
        this.annoTextBox.addEventListener("input", this.handleTyping.bind(this));
        this.handleTyping();

        // Setup scene
        let scene = new THREE.Scene();
        scene.background = new THREE.Color('gray');
        this.canvas = canvas;
        this.scene = scene;
        this.displayTexture = true;

        // camera
        const fov = 75;
        const aspect = 2;
        const near = 0.01;
        const far = 100;
        let camera = new THREE.PerspectiveCamera(
            fov,
            aspect,
            near,
            far
        );
        camera.position.z = params.zpos;
        this.camera = camera;
        this.pickHelper = new PickHelper(scene, camera);

        // renderer
        let renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true}); 
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); 
        this.renderer = renderer;

        // lighting
        const ambient = new THREE.AmbientLight( 0xFFFFFF );
        scene.add(ambient);

        // orbit controls
        let controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.update();
        controls.enableDamping = true;
        controls.campingFactor = 0.25;
        controls.enableZoom = true;
        this.controls = controls;

        // Setup placeholders for two meshes and picking material
        // (TODO: The could all be promises to make code more robust)
        this.textureMesh = null;
        this.pickerMesh = null;
        this.pickMat = null; // Picking material

        // Click variables
        this.selectingSphere = false;
        this.eventLocation = null;
        this.toggleCount = 0;
        let cntrlIsPressed = false;

        // control key
        document.addEventListener("keydown", function(event) {
            if (event.code == "ControlLeft") {
                cntrlIsPressed = true;
            }
        });
        document.addEventListener("keyup", function(event) {
            if (event.code == "ControlLeft") {
                cntrlIsPressed = false;
            }
        });

        // left click
        canvas.addEventListener("click", function(event){
            that.eventLocation = getEventLocation(event);
            if(cntrlIsPressed == true && that.pickingNew){
                // Making new annotation
                scene.background = new THREE.Color('white');
                that.selectingSphere = true;
                that.toggleX();
            }
            else {
                // Pick ordinary sphere
                let pos = getRayPickPosition(canvas, event);
                that.handleAnnotationPick(pos);
            }
        });

        // right click
        canvas.addEventListener("contextmenu", function(event){
            if(cntrlIsPressed == true){
                let item = that.annotations.pop();
                if(typeof item !== 'undefined'){
                    that.scene.remove(item);
                    item.geometry.dispose();
                    item.material.dispose();
                    item = undefined;
                }
            }
        },false);

        this.resizeCanvas();
        window.addEventListener('resize', () => {this.resizeCanvas()}, false);

    }

    /**
     * Do picking of an annotation sphere
     * @param {object} pos Position of click, in canvas coordinates
     */
    handleAnnotationPick(pos) {
        let pickedSphere = this.pickHelper.pick(pos);
        if (!(pickedSphere === null)) {
            this.pickedSphere = pickedSphere;
            this.annoTextBox.value = pickedSphere.text;
        }
    }

    /**
     * React to typing in the textbox.  This is really only relevant for Katie when editing
     * is enabled; otherwise, we keep just putting back what the annotation was
     */
    handleTyping() {
        if (this.pickedSphere === null) {
            if (this.pickingNew) {
                this.annoTextBox.value = "CTRL+Click to pick a new location on the smokestack and then type information here.\n\nDo a regular click to re-select a previously selected location to edit it.\n\nDon't forget to save your progress!  (You can load it back later)";
            }
            else {
                this.annoTextBox.value = "Pick a location on the smokestack and information about that location will show up here";
            }
        }
        else {
            // Katie's edits are updating
            this.pickedSphere.text = this.annoTextBox.value;
        }
    }

    /**
     * Save the annotation progress as a JSON file
     */
    saveAnnotations() {
        let data = [];
        for (let i = 0; i < this.annotations.length; i++) {
            const pos = this.annotations[i].position;
            data.push({x:pos.x, y:pos.y, z:pos.z, text:this.annotations[i].text});
        }
        data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        const dlAnnoElem = document.getElementById('downloadAnnoElem');
        dlAnnoElem.setAttribute("href", data);
        dlAnnoElem.setAttribute("download", "annotations.json");
        dlAnnoElem.click();
    }

    /**
     * Load in a list of annotations
     * @param {list} data List of {x, y, z, text} annotations
     */
    loadAnnotations(data) {
        for (let i = 0; i < data.length; i++) {
            const geometry = new THREE.SphereGeometry(SPHERE_SIZE, 32, 32);
            const material = new THREE.MeshBasicMaterial( {color:UNSELECTED_COLOR, transparent:true, opacity:0.5} );
            const sphere = new THREE.Mesh(geometry, material);
            sphere.annotation = true;
            this.scene.add(sphere);
            this.annotations.push(sphere);
            sphere.position.x = data[i].x;
            sphere.position.y = data[i].y;
            sphere.position.z = data[i].z;
            sphere.text = data[i].text;
        }
    }


    /**
     * Load in a copy of the mesh that uses the picker shader
     * @param {string} filename Path to mesh file
     */
    loadMeshPickerTexture(filename) {
        let canvas = this;
        $.get("shaders/XYZ.vert", function(vertexSrc) {
            $.get("shaders/XYZ.frag", function(fragmentSrc) {
                // custom material
                let mat = new THREE.ShaderMaterial({
                    uniforms:{coord_choice:{value:2.0}},
                    vertexShader: vertexSrc,
                    fragmentShader: fragmentSrc
                });
                canvas.pickMat = mat;
                const objLoader = new OBJLoader();
                objLoader.load(filename, function(object) {      
                    object.traverse( function( child ) {
                        if (child.isMesh) {
                            child.material = mat;
                        }
                    });
                    canvas.pickerMesh = object;
                    canvas.scene.add(object);
                    canvas.updateVisibility();
                    requestAnimationFrame(canvas.render.bind(canvas));
                });
            });
        });
    }

    /**
     * Asynchronously load the mesh geometry and the material for the mesh
     * 
     * @param {string} filename Path to the mesh geometry
     * @param {string} matfilename Path to the material file
     */
    loadMesh(filename, matfilename) {
        const manager = new THREE.LoadingManager();
        progressBar.startLoading("Loading smokestack model");
        manager.onProgress = function(item, loaded, total) {
            let perc = Math.round(100*loaded/total);
            progressBar.changeMessage("Loading smokestack model, " + perc + "% completed");
            if (loaded == total) {
                progressBar.changeToReady("");
            }
        }
        const canvas = this;
        // Step 1: Asynchronously load material with texture
        const mtlLoader = new MTLLoader(manager);
        const objLoader = new OBJLoader(manager);
        
        mtlLoader.load(matfilename, (mtl) => {
            mtl.preload();
            objLoader.setMaterials(mtl);
            objLoader.load(filename, function(object) {       
                canvas.textureMesh = object;
                canvas.scene.add(object);
                canvas.loadMeshPickerTexture(filename);
                requestAnimationFrame(canvas.render.bind(canvas));
            });
        });
    }

    resizeCanvas(){
       let wide = window.innerWidth * 0.7;
       let high = window.innerHeight * 0.95;
       this.gl.canvas.width = wide;
       this.gl.canvas.height = high;
       this.renderer.setSize(wide, high, false);
       this.camera.aspect = wide / high;
       this.camera.updateProjectionMatrix();
    }

    getPixels(){
        const gl = this.gl;
        const pixels = this.pixels;
        let r = this.red;
        let g = this.green;
        let b = this.blue;
        let a = this.alpha;

        const x = this.eventLocation.x;
        const y = this.renderer.domElement.clientHeight - this.eventLocation.y;

        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        
        r = pixels[0];
        g = pixels[1];
        b = pixels[2];
        a = pixels[3];
        return [r,g,b,a];
    }

    // render animation
    render() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        if(this.selectingSphere){
            if(compareColors(this.getPixels(), [255,255,255])){
                this.scene.background = new THREE.Color('gray');
                this.toggleCount = -1;
                this.selectingSphere = false;
                this.toggleTexture();
            }
            switch(this.toggleCount){
                case 0:
                    this.spot[0] = this.backToCoords(this.getPixels());
                    this.toggleY();
                    this.toggleCount++;
                    break;
                case 1:
                    this.spot[1] = this.backToCoords(this.getPixels());
                    this.toggleZ();
                    this.toggleCount++;
                    break;
                case 2:
                    this.spot[2] = this.backToCoords(this.getPixels());
                    this.toggleTexture();
                    this.scene.background = new THREE.Color('gray');
                    this.addSphere(this.spot[0], this.spot[1], this.spot[2]);

                    this.toggleCount = 0;
                    this.selectingSphere = false;
                    break;
                default:
                    this.scene.background = new THREE.Color('gray');
                    this.toggleCount = 0;
                    this.selectingSphere = false;
                    break;
            }
        }
        requestAnimationFrame(this.render.bind(this)); // Keep the animation going
    }

    updateVisibility() {
        const canvas = this;
        this.textureMesh.traverse ( function (child) {
            if (child.isMesh) {
                child.visible = canvas.displayTexture;
            }
        });
        this.pickerMesh.traverse ( function (child) {
            if (child.isMesh) {
                child.visible = !canvas.displayTexture;
            }
        });
    }

    toggleTexture() {
        this.displayTexture = !this.displayTexture;
        this.updateVisibility();
    }

    toggleX() {
        this.displayTexture = false;
        this.pickMat.uniforms.coord_choice.value = 1;
        this.updateVisibility();
    }

    toggleY() {
        this.displayTexture = false;
        this.pickMat.uniforms.coord_choice.value = 2;
        this.updateVisibility();
    }

    toggleZ() {
        this.displayTexture = false;
        this.pickMat.uniforms.coord_choice.value = 3;
        this.updateVisibility();
    }

    backToCoords(rgba){ 
        let coord = (rgba[0] << 16) | (rgba[1] << 8) | (rgba[2]);
        coord /= ((256*256*256)-1);
        coord = (coord * 200) - 100;
        return coord;
    }

    addSphere(X, Y, Z){
        const geometry = new THREE.SphereGeometry(SPHERE_SIZE, 32, 32);
        const material = new THREE.MeshBasicMaterial( {transparent:true, opacity:0.5} );
        const sphere = new THREE.Mesh(geometry, material);
        this.pickHelper.selectNew(sphere);
        sphere.annotation = true;
        this.scene.add(sphere);
        this.annotations.push(sphere);
        this.pickedSphere = sphere;
        sphere.position.x = X;
        sphere.position.y = Y;
        sphere.position.z = Z;
        sphere.text = "";
        this.annoTextBox.value = "Type new description here";
        this.handleTyping();
    }

    deleteSelected() {
        if (!(this.pickedSphere === null)) {
            const item = this.pickedSphere;
            this.pickedSphere = null;
            this.handleTyping();
            this.scene.remove(item);
            item.geometry.dispose();
            item.material.dispose();
        }
    }
}



// location of the canvas
function getElementPosition() {
    obj = document.getElementById("threecanvas");
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

// location of mouse click
function getEventLocation(event){
    // Relies on the getElementPosition function.
    var pos = this.getElementPosition();
    return {
        x: (event.pageX - pos.x),
        y: (event.pageY - pos.y)
    };
}

function getCanvasRelativePosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * canvas.width  / rect.width,
      y: (event.clientY - rect.top ) * canvas.height / rect.height,
    };
  }
   
function getRayPickPosition(canvas, event) {
    const pos = getCanvasRelativePosition(canvas, event);
    return {
        x: (pos.x / canvas.width ) *  2 - 1,
        y: (pos.y / canvas.height) * -2 + 1
    };
}

function compareColors(x, y) {
    equal = true;
    for (let i = 0; i < 3; i++) {
      equal = equal && (x[i] == y[i]);
    }
    return equal;
}