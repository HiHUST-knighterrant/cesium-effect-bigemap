precision highp float;
uniform sampler2D colorTexture;
varying vec2 v_textureCoordinates;
uniform float tiltAngle;
uniform float rainSize;
uniform float rainSpeed;

float iTime = czm_frameNumber / rainSpeed;
float random(in vec2 uv) {
    return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) *
        43758.5453123);
}

float noise(in vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    f = f * f * (3. - 2. * f);

    float lb = random(i + vec2(0., 0.));
    float rb = random(i + vec2(1., 0.));
    float lt = random(i + vec2(0., 1.));
    float rt = random(i + vec2(1., 1.));

    return mix(mix(lb, rb, f.x), mix(lt, rt, f.x), f.y);
}

float Circle(vec2 uv, vec2 p, float r, float blur) {
    float d = length(uv - p);
    float c = smoothstep(r + blur, r - blur, d);

    return c;
}

#define OCTAVES 8

float fbm(in vec2 uv) {
    float value = 0.;
    float amplitude = .5;

    for(int i = 0; i < OCTAVES; i++) {
        value += noise(uv) * amplitude;

        amplitude *= .5;

        uv *= 2.;
    }

    return value;
}

float rain(vec2 uv) {
    float si = sin(tiltAngle), co = cos(tiltAngle);
    uv *= mat2(co, -si, si, co);

    float travelTime = (iTime * 0.2) + 0.1;
    vec2 tiling = vec2(1., .044444);
    vec2 offset = vec2(travelTime * 0.5 + uv.x * 0.2, travelTime * 0.2);

    vec2 st = uv * tiling + offset;

    float rain = 1.;
    float f = noise(st * 200.5) * noise(st * 125.5);
    f = clamp(pow(abs(f), 15.0) * 1.5 * (rain * rain * 125.0), 0.0, 0.5);
    return f;
}

float moon(vec2 uv) {
    float moon = smoothstep(0.00, -0.01, length(uv - vec2(0.5, 0.75)) - 0.06);
    moon *= smoothstep(-0.025, 0.01, length(uv - vec2(0.5 + 0.035, 0.75 + 0.01)) - 0.065);
    moon = clamp(moon, 0., 1.);

    return moon;
}

void main() {
    vec2 iResolution = czm_viewport.zw;

    vec2 uv = (gl_FragCoord.xy * 2. - iResolution.xy) / min(iResolution.x, iResolution.y);

    float cloud = (1. - (fbm((uv + .2) * uv.y + .1 * iTime))) * uv.y;
    cloud = clamp(0., 1., cloud);

    // float moon = moon(uv);
    // float moon = Circle(uv, vec2(-1.5, .88), 0.25, .05);
    float rain = rain(uv);

    // vec3 col = vec3(0.84, 0.925, 0.941) * moon * (1. - cloud * 1.2);
    // col = mix(col, vec3(0.8, 0.9, 1.), cloud);

    // vec3 col = vec3(0.94, 0.0, 0.0) * moon;
    // col = mix(col, vec3(0.94, .3, .2), cloud);
    // col += vec3(1.0) * rain;

    // gl_FragColor = vec4(vec3(rain), 1.);
    gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(vec3(rain), 1.), .5);
}