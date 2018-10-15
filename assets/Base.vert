attribute vec3 aPosition;
attribute vec4 aColor;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat3 uNormalMatrix;

varying vec4 fColor;

void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    fColor = vec4(abs(aPosition), 1.0);
}
