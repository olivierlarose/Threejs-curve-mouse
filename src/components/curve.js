import React, { Component } from 'react';
import * as THREE from 'three';
import { TweenLite, Power4, Power3 } from 'gsap/all';
import { Vector2 } from 'three';
import { Tween } from 'gsap/gsap-core';
 
export default class Curve extends Component {

    constructor(props){
        super(props);
        this.cube = null;
        this.mouse = new THREE.Vector3(0, 0, 0);
        this.curveStrength = 0.2;
        this.uniforms = {
            uTexture: {
              value: null
            },
            uOffset: {
              value: new THREE.Vector2(0.0, 0.0)
            },
            uAlpha: {
              value: 1
            }
        }
    }

    componentDidMount(){
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 1, 5);
        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.clock = new THREE.Clock();
        this.mount.appendChild( this.renderer.domElement );

        const geometry = new THREE.PlaneGeometry(658/1000, 817/1000, 10, 30);
        const loader = new THREE.TextureLoader();
        loader.load(process.env.PUBLIC_URL + '/images/car.png', (texture) => {
            this.uniforms.uTexture.value = texture;

            const material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: `
                  uniform vec2 uOffset;
                  varying vec2 vUv;
                  #define M_PI 3.1415926535897932384626433832795

                  vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
                    position.x = position.x + (sin(uv.y * M_PI) * offset.x);
                    position.y = position.y + (sin(uv.x * M_PI) * offset.y);
                    return position;
                  }

                  void main() {
                    vUv = uv;
                    vec3 newPosition = deformationCurve(position, uv, uOffset);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
                  }
                `,
                fragmentShader: `
                  uniform sampler2D uTexture;
                  uniform float uAlpha;
                  varying vec2 vUv;
            
                  void main() {
                    vec3 color = texture2D(uTexture,vUv).rgb;
                    gl_FragColor = vec4(color,1.0);
                  }
                `,
                transparent: true
              })

            
            this.cube = new THREE.Mesh(geometry, material);
            this.camera.position.z = 2;
            this.scene.add(this.cube);
            this.renderer.render(this.scene, this.camera);
        })
       this.animate();
    }

    mouseMove(e){
        if(!this.cube) return;
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = - (e.clientY / window.innerHeight) * 2 + 1;
        
        const mouse = new THREE.Vector3(x, y, 0).unproject(this.camera);
        mouse.sub( this.camera.position ).normalize();
        var distance = - this.camera.position.z / mouse.z;
        this.mouse.copy(this.camera.position).add( mouse.multiplyScalar(distance));
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        if(this.cube == null) return;

        this.uniforms.uOffset.value  = this.cube.position.clone().sub(this.mouse).multiplyScalar(-this.curveStrength);

        const { x, y } = this.mouse;
        TweenLite.to(this.cube.position, 1, {
            x: x,
            y: y,
            ease: Power4.easeOut
        })

        this.renderer.render( this.scene, this.camera);
    }

    render(){
        return (
            <div onMouseMove={e => this.mouseMove(e)} style={{height: "100vh", width: "100%"}} id="canvas" ref={ref => {this.mount = ref}}>
            </div>
        )
    }
}