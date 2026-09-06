import * as THREE from 'three'

export const BLOCH_SPHERE_RADIUS = 1.0;
export const AXIS_LENGTH = 2.0;
export const BLOCH_SPHERE_COLOR = 0xFFFFFF;

export interface cube3dParams {
    width: number,
    height: number,
    depth: number
}

export function createCube({ width, height, depth }: cube3dParams) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshNormalMaterial();
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, 0);
    return cube;
}

export const createTextSprite = (text: string, color: string): THREE.Sprite => {
    const canvasElement = document.createElement('canvas')
    canvasElement.width = 128
    canvasElement.height = 128
    const context = canvasElement.getContext('2d')

    if (context) {
        context.fillStyle = color
        context.font = 'bold 60px sans-serif'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(text, 64, 64)
    }

    const texture = new THREE.CanvasTexture(canvasElement)
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(0.4, 0.4, 0.4)
    return sprite
}

export function createAxesHelper() {
    const labelSprites: THREE.Sprite[] = []

    const axesGroup = new THREE.Group()

    const axesHelper = new THREE.AxesHelper(AXIS_LENGTH - 0.2)
    const axesMaterial = axesHelper.material as THREE.Material
    if (axesMaterial) {
        axesMaterial.depthTest = false
        axesHelper.renderOrder = 1
    }
    axesGroup.add(axesHelper)

    const xLabel = createTextSprite('X', '#ff4444')
    xLabel.position.set(AXIS_LENGTH, 0, 0)
    axesGroup.add(xLabel)
    labelSprites.push(xLabel)

    const yLabel = createTextSprite('Y', '#44ff44')
    yLabel.position.set(0, AXIS_LENGTH, 0)
    axesGroup.add(yLabel)
    labelSprites.push(yLabel)

    const zLabel = createTextSprite('Z', '#4444ff')
    zLabel.position.set(0, 0, AXIS_LENGTH)
    axesGroup.add(zLabel)
    labelSprites.push(zLabel);

    return axesGroup;
}

export function createBlochSphereGrid() {
    const group = new THREE.Group();

    const sphereGeometry = new THREE.SphereGeometry(BLOCH_SPHERE_RADIUS, 16, 16);
    sphereGeometry.rotateX(Math.PI / 2);
    const sphereWireframeGeometry = new THREE.WireframeGeometry(sphereGeometry);
    const material = new THREE.LineBasicMaterial({
        color: BLOCH_SPHERE_COLOR,
        transparent: true,
        opacity: 0.1
    });
    const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(sphereWireframeGeometry),
        material
    );
    group.add(edges);

    const circleGeometry = new THREE.CircleGeometry(BLOCH_SPHERE_RADIUS);
    const circleMesh = new THREE.Mesh(circleGeometry, material);

    group.add(circleMesh);

    return group;
}

export interface ArrowParams {
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    color: number;
    opacity: number;
}

export function createArrow({ origin, direction, length, color, opacity = 1.0 }: ArrowParams) {
    const arrow = new THREE.ArrowHelper(
        direction.normalize(),
        origin,
        length,
        color,
        0.2,
        0.2
    );

    const lineMaterial = arrow.line.material;
    if (!Array.isArray(lineMaterial)) {
        lineMaterial.transparent = true;
        lineMaterial.opacity = opacity;
    }

    const coneMaterial = arrow.cone.material;
    if (!Array.isArray(coneMaterial)) {
        coneMaterial.transparent = true;
        coneMaterial.opacity = opacity;
    }

    return arrow;
}