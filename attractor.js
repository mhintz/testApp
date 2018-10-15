const createContext = require('../pex-src/pex-context');
const createCamera = require('pex-cam/perspective');
const createOrbiter = require('pex-cam/orbiter');
const createCube = require('primitive-cube');
const glslify = require('glslify');
const mat4 = require('pex-math/mat4');
const mat3 = require('pex-math/mat3');
const vec3 = require('pex-math/vec3');

const { sin, cos, max, abs, PI } = Math;
const TWO_PI = 2 * PI;

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

const VERT = glslify(__dirname + '/assets/Billboard.vert', {});
const FRAG = glslify(__dirname + '/assets/Base.frag', {});
const NUM_ITER = 1e5;

const billboardMesh = (() => {
    return {
        positions: ctx.vertexBuffer(new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0])),
        // positions: ctx.vertexBuffer(new Float32Array([-1.0, -1.0])),
    }
})();

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

function assign3(typedArray, idx, vec, vecIdx=0) {
    typedArray[idx + 0] = vec[vecIdx + 0];
    typedArray[idx + 1] = vec[vecIdx + 1];
    typedArray[idx + 2] = vec[vecIdx + 2];
    return typedArray;
}

function assign4(typedArray, idx, vec, vecIdx=0) {
    typedArray[idx + 0] = vec[vecIdx + 0];
    typedArray[idx + 1] = vec[vecIdx + 1];
    typedArray[idx + 2] = vec[vecIdx + 2];
    typedArray[idx + 3] = vec[vecIdx + 4];
    return typedArray;
}

function multiplyBufferImpl(arrayBuffer, times=1, assignImpl) {
    const result = new Float32Array(arrayBuffer.length * times);
    for (let idx = 0; idx < arrayBuffer.length; idx++) {
        const newIdx = idx * times;
        for (let timesIdx = 0; timesIdx < times; timesIdx++) {
            assignImpl(result, newIdx, arrayBuffer, idx);
        }
    }
    return result;
}

function multiplyBuffer3(buf, times) {
    return multiplyBufferImpl(buf, times, assign3);
}

function multiplyBuffer4(buf, times) {
    return multiplyBufferImpl(buf, times, assign4);
}

const attractorMesh = (() => {
    const positions = new Float32Array(NUM_ITER * 3);
    const colors = new Float32Array(NUM_ITER * 4);
    const scratch = vec3.create();
    let x = 0;
    let y = 0;
    let z = 1;
    for (let idx = 0; idx < NUM_ITER; idx++) {
        x = 2.52 * sin(y) + 0.48 * cos(z);
        y = 5.75 * cos(x) + cos(z);
        z = 1.46 * sin(x) + sin(y);
        const posIdx = idx * 3;
        scratch[0] = x;
        scratch[1] = y;
        scratch[2] = z;
        vec3.normalize(scratch);
        positions[posIdx + 0] = scratch[0];
        positions[posIdx + 1] = scratch[1];
        positions[posIdx + 2] = scratch[2];

        const colorIdx = idx * 4;
        colors[colorIdx + 0] = 1.0;
        colors[colorIdx + 1] = 1.0;
        colors[colorIdx + 2] = 1.0;
        colors[colorIdx + 3] = 1.0;
    }
    return {
        positions: ctx.vertexBuffer(positions),
        colors: ctx.vertexBuffer(colors)
    };
})();

// function drawTex(texture, x, y, width, height) {
//     return {
//         pipeline: ctx.pipeline({
            
//         })
//     }
// }

const drawAttractorCmd = {
    pipeline: ctx.pipeline({
        vert: VERT,
        frag: FRAG,
        depthTest: true,
        primitive: ctx.Primitive.TriangleStrip
        // primitive: ctx.Primitive.Point
    }),
    attributes: {
        aCorner: { buffer: billboardMesh.positions, divisor: 0 },
        aPosition: { buffer: attractorMesh.positions, divisor: 1 },
        aColor: { buffer: attractorMesh.colors, divisor: 1 }
    },
    count: billboardMesh.positions.length / 2,
    // count: 1,
    instances: NUM_ITER,
    uniforms: {
        uProjectionMatrix: camera.projectionMatrix,
        uViewMatrix: camera.viewMatrix,
        uModelMatrix: mat4.create(),
        uNormalMatrix: mat3.fromMat4(mat3.create(), camera.invViewMatrix)
    }
}

const glowTexture = ctx.texture2D({
    width: screenWidth,
    height: screenHeight
});

ctx.frame(function() {
    ctx.submit(clearCmd);
    ctx.submit(drawAttractorCmd);
});
