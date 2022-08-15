precision highp float;

float random3_1(vec3 point) 
{
    return fract(sin(dot(point, vec3(12.9898,78.233,45.5432)))*43758.5453123);
}

float thunder(vec2 uv, float time, float seed, float segments, float amplitude)
{
    float h = uv.y;
    float s = uv.x*segments;
    float t = time*20.0;
    
    vec2 fst = floor(vec2(s,t));
    vec2 cst = ceil(vec2(s,t));
    
    float h11 = h + (random3_1(vec3(fst.x, fst.y, seed)) - 0.5) * amplitude;
    float h12 = h + (random3_1(vec3(cst.x, fst.y, seed)) - 0.5) * amplitude;
    float h21 = h + (random3_1(vec3(fst.x, cst.y, seed)) - 0.5) * amplitude;
    float h22 = h + (random3_1(vec3(cst.x, cst.y, seed)) - 0.5) * amplitude;
    
    float h1 = mix(h11, h12, fract(s));
    float h2 = mix(h21, h22, fract(s));
    float alpha = mix(h1, h2, fract(t));
    
    return 1.0 - abs(alpha - 0.5) / 0.5;
}

void mainImage(out vec4 fragColor, vec2 uv) 
{
    // uv /= iResolution.y;

    float alpha = 0.0;
    for(int i = 0; i < 4; ++i)
    {
        float f = float(i) + 0.0;
        float a = thunder(uv, time, f, 10.0 * pow(1.25, f), 0.125 * pow(1.25, f));
        a = pow(a, f + 2.0); 
        alpha = max(alpha, a);
    }
    alpha = max((alpha-0.9)/0.1, 0.0);
    
    fragColor = vec4(0.0, alpha, 0.0, 1.0);
}