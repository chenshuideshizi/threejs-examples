export class Cube {
    constructor({ width = 4, height = 2, depth = 4, color = 0xbebebe } = {}) {
        this.width = width
        this.height = height
        this.depth = depth

        const material = new THREE.MeshLambertMaterial({ color })
        const geometry = new THREE.CubeGeometry(width, height, depth)
        const mesh = new THREE.Mesh(geometry, material)
        this.mesh = mesh
    }
    get position () {
        return this.mesh.position
    }
    checkInCube(jumper) {
        let distance
        if (jumper.nextDir === 'left') {
            distance = Math.abs(jumper.position.x - this.position.x)
        } else {
            distance = Math.abs(jumper.position.z - this.position.z)
        }
        let shouldDistance = this.width / 2 + jumper.width / 2

        if (distance < shouldDistance) {
            return { isInCube: true}
        }
        return { isInCube: false }
    }
}

export function createCube(data) {
    return new Cube(data)
}