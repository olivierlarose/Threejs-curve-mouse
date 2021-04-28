import React, { Component } from 'react';
import * as THREE from 'three';
import { TweenLite, Power4, Power3 } from 'gsap/all';
import { Vector2 } from 'three';
import { Tween } from 'gsap/gsap-core';
 
export default class Curve extends Component {

    constructor(props){
        super(props);
        this.cube = null;
        this.mouse = new THREE.Vector3(0, 0, 0)
    }

    componentDidMount(){
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 1, 5);
        this.renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.mount.appendChild( this.renderer.domElement );

        const geometry = new THREE.PlaneGeometry(658/1000, 817/1000);
        const loader = new THREE.TextureLoader();
        loader.load(process.env.PUBLIC_URL + '/images/car.png', (texture) => {
            const material = new THREE.MeshBasicMaterial({
                map: texture
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
        const { x, y } = this.mouse;
        
        const offsetY = y - this.cube.position.y;
        const offsetX = x - this.cube.position.x

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