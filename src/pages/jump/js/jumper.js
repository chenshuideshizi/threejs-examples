import EventBus from './EventBus'
export class Jumper extends EventBus {
    constructor ({color = 0x232323, width = 1, height = 2, depth = 1 } = {}) {
        super()

        this.width = width
        this.height = height
        this.depth = depth

        const material = new THREE.MeshLambertMaterial({ color })
        const geometry = new THREE.CubeGeometry(width, height, depth)
        geometry.translate(0, 1, 0)
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.y = 1
        this.mesh = mesh
        this._status = 0 // 1, 按下鼠标 2, 松开鼠标

        this.xSpeed = 0 // xSpeed根据鼠标按的时间进行赋值
        this.ySpeed = 0 // ySpeed根据鼠标按的时间进行赋值

        this.scale = {x: 1, y: 1}
        this.rafId = null
        this.nextDir = null
    }
    get position () {
        return this.mesh.position
    }
    set status (value) {
        this._status = value
        switch (value) {
            case 1:
                this.readyAction()
                break
            case 2:
                cancelAnimationFrame(this.rafId)
                this.moveAction()
                break
        }
    }
    readyAction () {
        if (this.mesh.scale.y < 0.02) {
            return
        }
        this.scale.y -= 0.01
        this.xSpeed += 0.004
        this.ySpeed += 0.008
        this.mesh.scale.y -= 0.01
        this.rafId = requestAnimationFrame(this.readyAction.bind(this))
    }
    moveAction () {
        // 判断jumper是在方块水平面之上，是的话说明需要继续运动
        if (this.position.y >= 1) {
            // jumper根据下一个方块的位置来确定水平运动方向
            if (this.nextDir === 'left') {
                this.position.x -= this.xSpeed
            } else {
                this.position.z -= this.xSpeed
            }
            // jumper在垂直方向上运动
            this.position.y += this.ySpeed
            // 运动伴随着缩放
            if (this.mesh.scale.y < 1) {
                this.mesh.scale.y += 0.02
            }
            // jumper在垂直方向上先上升后下降
            this.ySpeed -= 0.01
            // 每一次的变化，渲染器都要重新渲染，才能看到渲染效果
            this.rafId = requestAnimationFrame(this.moveAction.bind(this))
        } else {
            // jumper掉落到方块水平位置，开始充值状态，并开始判断掉落是否成功
            this.status = 0
            this.xSpeed = 0
            this.ySpeed = 0
            this.position.y = 1

            this.$emit('moveEnd', this)
        }
    }
}
