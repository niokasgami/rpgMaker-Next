#version 300 es
precision mediump float;

in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

void main() {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    gl_Position = vec4((position / uOutputTexture.xy) * 2.0 - 1.0, 0.0, 1.0);
    gl_Position.y = -gl_Position.y;
    vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
}
