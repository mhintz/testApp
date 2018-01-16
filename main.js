const createContext = require('pex-context');
const createCamera = require('pex-cam/perspective');
const createOrbiter = require('pex-cam/orbiter');
const createCube = require('primitive-cube');
const glslify = require('glslify');
const mat4 = require('pex-math/mat4');
const mat3 = require('pex-math/mat3');

const ctx = createContext();

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [0, 0, 6],
  target: [0, 0, 0]
})

createOrbiter({ camera: camera, distance: 10 })

const VERT = glslify(__dirname + '/assets/showNormals.vert', {});
const FRAG = glslify(__dirname + '/assets/showNormals.frag', {});

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1.0],
    clearDepth: 1
  })
};

function flatten(arr) {
    let out = [];
    arr.forEach((el) => {
        Array.prototype.push.apply(out, el);
    });
    return out;
}

const cube = createCube();

const drawCubeCmd = {
    pipeline: ctx.pipeline({
        vert: VERT,
        frag: FRAG,
        depthTest: true,
        primitive: ctx.Primitive.Triangles
    }),
    attributes: {
        aPosition: ctx.vertexBuffer(cube.positions),
        aNormal: ctx.vertexBuffer(cube.normals),
    },
    indices: ctx.indexBuffer(flatten(cube.cells)),
    uniforms: {
        uProjectionMatrix: camera.projectionMatrix,
        uViewMatrix: camera.viewMatrix,
        uModelMatrix: mat4.create(),
        uNormalMatrix: mat3.fromMat4(mat3.create(), camera.invViewMatrix),
        uColor: [1, 1, 1, 1]
    }
}

ctx.frame(function() {
    ctx.submit(clearCmd);
    ctx.submit(drawCubeCmd);
});
