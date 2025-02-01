#include ../includes/simplexNoise2d.glsl

uniform vec3 uWaterDeepColor;
uniform vec3 uWaterSurfaceColor;
uniform vec3 uSandColor;
uniform vec3 uGrassColor;
uniform vec3 uSnowColor;
uniform vec3 uRockColor;

varying vec3 vPosition;

void main(){

    // Base color
    vec3 color = vec3(1.);

    // water
    float surfaceWaterMix = smoothstep( -1., -.1, vPosition.y);
    color = mix(uWaterDeepColor, uWaterSurfaceColor, surfaceWaterMix);
    
    //sand 
    float sandMix = step( -.1, vPosition.y);
    color = mix(color, uSandColor, sandMix);

    //grass
    float grassMix = step(-.06, vPosition.y);
    color = mix(color, uGrassColor, grassMix);

    //snow
    float snowThreshold = .45;
    snowThreshold += simplexNoise2d(vPosition.xz * 15.) * .1;
    float snowMix = step(snowThreshold, vPosition.y);
    color = mix(color, uSnowColor, snowMix);

    csm_DiffuseColor= vec4(color ,1.0);
}