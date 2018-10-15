const createContext = require('pex-context');
const createCamera = require('pex-cam/perspective');
const createOrbiter = require('pex-cam/orbiter');
const createCube = require('primitive-cube');
const glslify = require('glslify');
const mat4 = require('pex-math/mat4');
const mat3 = require('pex-math/mat3');

const ctx = createContext();

const screenWidth = ctx.gl.canvas.width;
const screenHeight = ctx.gl.canvas.height;

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

const cubeMesh = (() => {
    const cubeGeom = createCube();
    return {
        positions: ctx.vertexBuffer(cubeGeom.positions),
        normals: ctx.vertexBuffer(cubeGeom.normals),
        indices: ctx.indexBuffer(flatten(cubeGeom.cells))
    };
})();

const drawCubeCmd = {
    pipeline: ctx.pipeline({
        vert: VERT,
        frag: FRAG,
        depthTest: true,
        primitive: ctx.Primitive.Triangles
    }),
    attributes: {
        aPosition: cubeMesh.positions,
        aNormal: cubeMesh.normals
    },
    indices: cubeMesh.indices,
    uniforms: {
        uProjectionMatrix: camera.projectionMatrix,
        uViewMatrix: camera.viewMatrix,
        uModelMatrix: mat4.create(),
        uNormalMatrix: mat3.fromMat4(mat3.create(), camera.invViewMatrix),
        uColor: [1, 1, 1, 1]
    }
}

const drawCubeLines = {
    pipeline: ctx.pipeline({
        vert: VERT,
        frag: FRAG,
        depthTest: true,
        primitive: ctx.Primitive.Lines
    }),
    attributes: {
        aPosition: cubeMesh.positions,
        aNormal: cubeMesh.normals
    },
    indices: cubeMesh.indices,
    uniforms: {
        uProjectionMatrix: camera.projectionMatrix,
        uViewMatrix: camera.viewMatrix,
        uModelMatrix: mat4.create(),
        uNormalMatrix: mat3.fromMat4(mat3.create(), camera.invViewMatrix),
        uColor: [1, 1, 1, 1]
    }
}

const glowTexture = ctx.texture2D({
    width: screenWidth,
    height: screenHeight
});

ctx.frame(function() {
    ctx.submit(clearCmd);
    // ctx.submit(drawCubeCmd);
    ctx.submit(drawCubeLines);
});
