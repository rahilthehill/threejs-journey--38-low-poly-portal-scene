
// we already have access to the UV's in the shader
// we do need to send it back and thru to the fragment

varying vec2 vUv;

void main() {

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vUv = uv; 

}