import { Jumper } from './jumper'
import { createCube } from './cube'
import EventBus from './EventBus'

class Game extends EventBus {
    constructor(options = {}) {
        super()
        // 默认配置
        const DEFAULT_OPTIONS = {
            background: 0x282828, // 背景颜色
            ground: -1, // 地面y坐标
            fallingSpeed: 0.2, // 游戏失败掉落速度

            cubeWidth: 4,
            cubeHeight: 2,
            cubeDepth: 4,

            jumperWidth: 1,
            jumperHeight: 2,
            jumperDepth: 1
        }

        this.canvas = document.querySelector('canvas'),

        this.canvasWidth = window.innerWidth
        this.canvasHeight = window.innerHeight

        this.config = Object.assign({}, DEFAULT_OPTIONS, options)

        this.scene = null
        this.camera = null
        this.renderer = null

        this.jumper = null

        // 游戏状态
        this.score = 0

        // 相机位置
        this.cameraCurrentPosition = new THREE.Vector3(0, 0, 0)
        this.cameraNextPosition = new THREE.Vector3()

        this.cubes = [] // 方块数组
        this.cubeStat = {
            nextDir: '' // 下一个方块相对于当前方块的方向: 'left' 或 'right'
        }

        this.falledStat = {
            location: -1, // jumper所在的位置
            distance: 0 // jumper和最近方块的距离
        }
        this.fallingStat = {
            speed: 0.2, // 游戏失败后垂直方向上的掉落速度
            end: false // 掉到地面没有
        }
        this._initScene()
        this._initLight()
        this._initCamera()
        this._initRenderer()
        this._animate()

        this.init()
    }
    set nextCubeDir(val) {
        this._nextCubeDir = val
        this.jumper.nextDir = val
    }
    get nextCubeDir () {
        return this._nextCubeDir
    }
    _initScene() {
        this.scene = new THREE.Scene()
    }
    _initLight() {
        // 定向光线
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
        directionalLight.position.set(3, 10, 5)
        this.scene.add(directionalLight)

        // 环境光
        const light = new THREE.AmbientLight(0xffffff, 0.3)
        this.scene.add(light)
    }
    _initCamera() {
        // 相机
        this.camera = new THREE.OrthographicCamera(
            this.canvasWidth / -80,
            this.canvasWidth / 80,
            this.canvasHeight / 80,
            this.canvasHeight / -80,
            0,
            5000
        )
        this.camera.position.set(100, 100, 100)
        this.camera.lookAt(this.cameraCurrentPosition)
    }
    _initRenderer() {
        // 渲染器
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: this.canvas
        })

        this.renderer.setSize(this.canvasWidth, this.canvasHeight)
        this.renderer.setClearColor(this.config.background)
    }
    _initEvent() {
        const MOUSE_DOWN = 'ontouchstart' in document.documentElement ? 'touchstart' : 'mousedown'
        const MOUSE_UP = 'ontouchstart' in document.documentElement ? 'touchend' : 'mouseup'

        // 事件绑定到canvas中
        this.canvas.addEventListener(MOUSE_DOWN, () => {
            this.jumper.status = 1
        })
        // 监听鼠标松开的事件
        this.canvas.addEventListener(MOUSE_UP, () => {
            this.jumper.status = 2
        })

    }
    _animate() {
        requestAnimationFrame(this._animate.bind(this));
        this._render();
    }
    _render() {
        this.renderer.render(this.scene, this.camera);
    }
    _addCube() {
        const cube = createCube()
        this.nextCubeDir = Math.random() > 0.5 ? 'left' : 'right'

        const preCube = this.cubes[this.cubes.length - 1]
        cube.mesh.position.x = preCube.position.x
        cube.mesh.position.y = preCube.position.y
        cube.mesh.position.z = preCube.position.z
        if (this.nextCubeDir === 'left') {
            cube.mesh.position.x = preCube.position.x - 4 * Math.random() - 6
        } else {
            cube.mesh.position.z = preCube.position.z - 4 * Math.random() - 6
        }
        this.cubes.push(cube)
        this.scene.add(cube.mesh)

        // TODO:面机需要一点点移动
        this.camera.lookAt(new THREE.Vector3(cube.position.x, 0, cube.position.z))
    }
    _initCube() {
        const firstCube = createCube()
        this.cubes.push(firstCube)
        this.scene.add(firstCube.mesh)

        this._addCube()

        // 当方块数大于6时，删除前面的方块，因为不会出现在画布中
        if (this.cubes.length > 6) {
            this.scene.remove(this.cubes.shift().mesh)
        }
    }
    init() {
        this._createHelpers()
        const jumper = new Jumper() // 加入游戏者jumper
        this.jumper = jumper
        this.jumper.$on('moveEnd', (jumper) => {
            const currentCube = this.cubes[this.cubes.length - 2]
            const {isInCube: isInCurrentCube} = currentCube.checkInCube(jumper)

            const nextCube = this.cubes[this.cubes.length - 1]
            const {isInCube: isInNextCube} = nextCube.checkInCube(jumper)

            if (!isInCurrentCube && !isInNextCube) {
                // 游戏失败
                console.log('游戏失败')
                this.$emit('failed')
                return
            }

            if (isInNextCube) {
                console.log('显示新的方块')
                this.score += 1
                this.$emit('success')
                this._addCube()
                return
            }

            console.log('在当前方块')

            
        })
        this._initCube()


        this.scene.add(this.jumper.mesh)

        this._initEvent()
    }
    // 游戏失败重新开始的初始化配置
    restart() {

    }
    // THREE.js辅助工具
    _createHelpers() {
        const axesHelper = new THREE.AxesHelper(10)
        this.scene.add(axesHelper)
    }
}

export default Game
