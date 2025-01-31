#include ../includes/simplexNoise2d.glsl

// uniform float uPositionFrequency;


float getElevation( vec2 position){
    float uPositionFrequency = .2;    
    float uWarpFrequency = .5;
    float uStrength = 2.;

    float elevation = 0.;
    elevation += simplexNoise2d(position * uPositionFrequency) * .5;
    elevation += simplexNoise2d(position * uPositionFrequency * 2.) * .25 ;
    elevation += simplexNoise2d(position * uPositionFrequency * 4.) * .125;

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