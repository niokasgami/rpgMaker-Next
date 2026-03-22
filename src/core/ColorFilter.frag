#version 300 es
in vec2 vTextureCoord;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform float hue;
uniform vec4 colorTone;
uniform vec4 blendColor;
uniform float brightness;

vec3 rgbToHsl(vec3 rgb) {
    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;
    float cmin = min(r, min(g, b));
    float cmax = max(r, max(g, b));
    float h = 0.0;
    float s = 0.0;
    float l = (cmin + cmax) / 2.0;
    float delta = cmax - cmin;
    if (delta > 0.0) {
        if (r == cmax) {
            h = mod((g - b) / delta + 6.0, 6.0) / 6.0;
        } else if (g == cmax) {
            h = ((b - r) / delta + 2.0) / 6.0;
        } else {
            h = ((r - g) / delta + 4.0) / 6.0;
        }
        if (l < 1.0) {
            s = delta / (1.0 - abs(2.0 * l - 1.0));
        }
    }
    return vec3(h, s, l);
}

vec3 hslToRgb(vec3 hsl) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs((mod(h * 6.0, 2.0)) - 1.0));
    float m = l - c / 2.0;
    float cm = c + m;
    float xm = x + m;
    if (h < 1.0 / 6.0) {
        return vec3(cm, xm, m);
    } else if (h < 2.0 / 6.0) {
        return vec3(xm, cm, m);
    } else if (h < 3.0 / 6.0) {
        return vec3(m, cm, xm);
    } else if (h < 4.0 / 6.0) {
        return vec3(m, xm, cm);
    } else if (h < 5.0 / 6.0) {
        return vec3(xm, m, cm);
    } else {
        return vec3(cm, m, xm);
    }
}

void main() {
    vec4 color = texture(uTexture, vTextureCoord);
    float a = color.a;
    vec3 hsl = rgbToHsl(color.rgb);
    hsl.x = mod(hsl.x + hue / 360.0, 1.0);
    hsl.y = hsl.y * (1.0 - colorTone.a / 255.0);
    vec3 rgb = hslToRgb(hsl);
    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;
    float r2 = colorTone.r / 255.0;
    float g2 = colorTone.g / 255.0;
    float b2 = colorTone.b / 255.0;
    float r3 = blendColor.r / 255.0;
    float g3 = blendColor.g / 255.0;
    float b3 = blendColor.b / 255.0;
    float i3 = blendColor.a / 255.0;
    float i1 = 1.0 - i3;
    r = clamp((r / a + r2) * a, 0.0, 1.0);
    g = clamp((g / a + g2) * a, 0.0, 1.0);
    b = clamp((b / a + b2) * a, 0.0, 1.0);
    r = clamp(r * i1 + r3 * i3 * a, 0.0, 1.0);
    g = clamp(g * i1 + g3 * i3 * a, 0.0, 1.0);
    b = clamp(b * i1 + b3 * i3 * a, 0.0, 1.0);
    r = r * brightness / 255.0;
    g = g * brightness / 255.0;
    b = b * brightness / 255.0;
    fragColor = vec4(r, g, b, a);
}
