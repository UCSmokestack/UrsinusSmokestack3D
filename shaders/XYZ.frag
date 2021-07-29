varying vec4 pos;
uniform float coord_choice;

void main(){
    float coord = pos.x;
    if (coord_choice == 2.0) {
        coord = pos.y;
    }
    else if (coord_choice == 3.0) {
        coord = pos.z;
    }
    // Assume that every dimension of pos is in [-100, 100]
    coord = (coord + 100.0)/200.0; // Normalize to the range [0, 1]
    coord = coord*(256.0*256.0*256.0-1.0);

    float R = floor(coord/(256.0*256.0));
    float G = floor((coord - 256.0*256.0*R)/256.0);
    float B = coord - 256.0*256.0*R - 256.0*G;

    gl_FragColor = vec4(R/255.0, G/255.0, B/255.0, 1.0);
}
