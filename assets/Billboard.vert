attribute vec2 aCorner;
attribute vec3 aPosition;
attribute vec4 aColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat3 uNormalMatrix;

varying vec4 fColor;

void main() {
    const float cornerFactor = 0.002;
    /* const float cornerFactor = 0.5; */
    vec3 cornerPos = vec3(aCorner.x * cornerFactor, aCorner.y * cornerFactor, 0.0);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition + cornerPos, 1.0);
    fColor = vec4(abs(aPosition), 1.0);
}
