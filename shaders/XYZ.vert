varying vec4 pos;

void main(){
    vec4 modelViewPosition = modelViewMatrix * vec4( position , 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
    pos = modelMatrix * vec4(position, 1.0); // In world coordinates
}