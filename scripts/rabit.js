const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

let h = canvas.height = 600
let w = canvas.width = 1200
let rabbit = 0
let tunnel = 0

let showRabbit = true

// running gameover
let gameStatus = "running"
let score = 0
window.addEventListener("keyup", (e) => {
    if (String(e.keyCode)==='32'){
        if(gameStatus === "gameOver") {
            document.location.reload()
        }
        else {
            if (rabbit.status==="inTunnel")
                if (Math.cos(rabbit.angle) > 0.68 && rabbit.x<tunnel.x)
                    score+=1
        }
    }
    else if (String(e.keyCode)==='72') {
        showRabbit = showRabbit ? false : true
    }
    else if (String(e.keyCode)==='82') {
        document.location.reload()
    }
})

class Circle {
    constructor(x, y, color, radius=20, lineWidth=1, speed=0) {
        this.speed = speed
        this.x = x
        this.y = y
        this.color = color
        this.radius = radius
        this.angle = 0
        this.lineWidth = lineWidth
    }
}

class Tunnel extends Circle {
    constructor(x, y, color, radius = 20, lineWidth = 1, speed = 0) {
        super(x, y, color, radius, lineWidth, speed)
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 29.85, Math.PI * 3+0.8);
        ctx.lineWidth = this.lineWidth
        ctx.stroke()
    }
}

class Rabbit extends Circle {
    constructor(x, y, color, radius=20, lineWidth=1, speed=0) {
        x += speed-x%speed+tunnel.x%speed
        super(x, y, color, radius, lineWidth, speed)
        this.status = "intro"
    }

    move(tunnel) {
        this.check(tunnel)
        switch (this.status) {
            case "intro":
                this.x += Math.cos(this.angle) * this.speed
                this.y += Math.sin(this.angle) * this.speed
                break
            case "inTunnel":
                for (let i=0; i < this.speed; i++){
                    this.angle += 0.01 /2
                    this.x += Math.cos(this.angle) * tunnel.radius / 100 /2
                    this.y += Math.sin(this.angle) * tunnel.radius / 100 /2
                }
                break
        }
    }

    check(tunnel) {
        if(this.x + this.radius > w || this.x - this.radius < 0) this.angle += Math.PI
        if(this.y + this.radius > h || this.y - this.radius < 0) this.angle += Math.PI

        if(distance(this, tunnel) <= this.radius + tunnel.radius) {
            if (this.x===tunnel.x)
                this.status = "inTunnel"
        }
    }

    draw(ctx) {
        if (this.status==="inTunnel") {
            if (Math.cos(this.angle) < 0.68 || this.x > tunnel.x) {
                if(!showRabbit)
                    return
            }
        }
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.lineWidth = this.lineWidth
        ctx.fill()
    }
}

setUp()
gameLoop()


function gameLoop() {
    ctx.clearRect(0,0,w,h)
    if(gameStatus === "gameOver") {
        ctx.font = "30px Comic"
        ctx.fillText("Game Over", w/2 - 150, h/2 - 100)
        ctx.fillText("you have scored : " + score, w/2 - 150, h/2)
        return;
    }
    ctx.font = "30px Comic"
    ctx.fillText("score : " + score, 20, 30)

    ctx.font = "14px Comic"
    ctx.fillStyle = "grey"
    ctx.fillText("Press SPACE when the circle came out from tunnel" , 20, 250)
    ctx.fillText("to score points" , 20, 264)
    ctx.fillText("Press H to hide a circle" , 20, 284)
    ctx.fillText("Press R to restart the game" , 20, 304)
    rabbit.move(tunnel)
    tunnel.draw(ctx)
    rabbit.draw(ctx)
    requestAnimationFrame(gameLoop)
}

function random(to, from = 0) {
    return Math.floor(Math.random() * (to - from) + from)
}

function setUp() {
    gameStatus = "running"
    score = 0
    const randomAngle = 1 * Math.PI / 180
    tunnel = new Tunnel(550, 350, "blue",  200, 12)
    rabbit = new Rabbit(20, 150, "blue",  20, 1, 5)
}


function distance(obj1, obj2) {
    const xDiff = obj1.x - obj2.x
    const yDiff = obj1.y - obj2.y

    return Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2))
}