var plask = require('plask');

plask.simpleWindow({
    settings: {
        width: 800,
        height: 600,
        type: '3d',  // Create an OpenGL window.
        vsync: true,  // Prevent tearing.
        multisample: true  // Anti-alias.
    },
    init: function() {

    },
    draw: function() {
        var gl = this.gl;

        gl.clearColor(0.1, 0.2, 0.6, 1.0);

        gl.clear(gl.COLOR_BUFFER_BIT);
    }
});
