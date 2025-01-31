#include ../includes/simplexNoise2d.glsl

uniform float uPositionFrequency;
uniform float uWarpFrequency;
uniform float uStrength;
uniform float uWarpStrength;
uniform float uTime;
uniform float uTimeSpeed;

float getElevation( vec2 position){
    float elevation = 0.;
    vec2 wrapPositon = position;
    wrapPositon += uTime * uTimeSpeed;
    wrapPositon += simplexNoise2d(wrapPositon * uWarpFrequency * uPositionFrequency) * uWarpStrength;
    elevation += simplexNoise2d(wrapPositon * uPositionFrequency) * .5;
    elevation += simplexNoise2d(wrapPositon * uPositionFrequency * 2.) * .25 ;
    elevation += simplexNoise2d(wrapPositon * uPositionFrequency * 4.) * .125;

    float elevationSign = sign(elevation);
    elevation = pow(abs(elevation), 2.) * elevationSign;
    elevation *= uStrength;

    return elevation;
}

void main(){
    // theoretical neighbour position 
    float shift = 0.01;
    vec3 positionA = position + vec3(shift, 0., 0.);
    vec3 positionB = position + vec3(0., 0., -shift);

    //Elevation
    float elevation = getElevation(csm_Position.xz);
    csm_Position.y += elevation;
    positionA.y = getElevation(positionA.xz);
    positionB.y = getElevation(positionB.xz);

    //Compute normal
    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);

    csm_Normal = cross(toA, toB);


}