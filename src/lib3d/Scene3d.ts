import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

export interface Scene3dParams {
    canvasElement: HTMLCanvasElement
}

export class Scene3d {
    private canvasElement: HTMLCanvasElement;
    private _renderer: THREE.WebGLRenderer;
    private _scene: THREE.Scene;
    private _camera: THREE.PerspectiveCamera;
    private _orbitControls: OrbitControls;
    private _animationFrameId: number | null = null;

    constructor(params: Scene3dParams) {
        this.canvasElement = params.canvasElement;
        this._renderer = new THREE.WebGLRenderer({
            canvas: this.canvasElement,
            antialias: true,
        });
        this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this._renderer.setSize(window.innerWidth, window.innerHeight)

        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x111111);

        this._camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this._camera.up.set(0, 0, 1);
        this._camera.position.set(4, 4, 4);

        this._orbitControls = new OrbitControls(this._camera, this._renderer.domElement);
        this._orbitControls.enableDamping = true;
        this._orbitControls.dampingFactor = 0.05;
        this._orbitControls.target.set(0, 0, 0);
        this._orbitControls.update();

        window.addEventListener('resize', this.onResize);
    }

    add(...object: THREE.Object3D[]) {
        this._scene.add(...object);
    }

    private onResize() {
        const width = window.innerWidth
        const height = window.innerHeight
        this._camera.aspect = width / height
        this._camera.updateProjectionMatrix()
        this._renderer.setSize(width, height)
    }

    get camera() {
        return this._camera;
    }

    startAnimation(animator: () => void) {
        this.cancelAnimation();
        const callback = () => {
            animator();
            this._orbitControls.update()
            this._renderer.render(this._scene, this._camera)
            this._animationFrameId = requestAnimationFrame(callback)
        };
        this._animationFrameId = requestAnimationFrame(callback);
    }

    cancelAnimation() {
        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
        }
    }

    dispose() {
        this.cancelAnimation();
        window.removeEventListener('resize', this.onResize);
    }

}