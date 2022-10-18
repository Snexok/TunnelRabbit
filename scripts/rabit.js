const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

let h = canvas.height = 600
let w = canvas.width = 1200

let textColor = 'wheat'

let rabbit = 0
let tunnel = 0
let tunnelStrocke = 0
let tunnelEntrance = 0
let tunnelEntranceStrocke = 0
let tunnelExit = 0
let tunnelExitStrocke = 0
let openTunnel = 0
let line = 0

let images = {}

let showRabbit = false

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

class Line {
    constructor(startX=0, endX=555, startY=182, endY=182, color) {
        this.startX = startX
        this.endX = endX
        this.startY = startY
        this.endY = endY
        this.color = color
        this.angle = 0
    }
    draw(ctx) {
        // set line stroke and line width
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;

        if (rabbit.status==="inTunnel")
            if (this.startX<=this.endX)
                this.startX+=35

        // draw a red line
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();
    }
}

class Tunnel extends Circle {
    constructor(x, y, startAngle, endAngel, color, radius = 20, lineWidth = 1, speed = 0) {
        super(x, y, color, radius, lineWidth, speed)
        this.startAngle = startAngle
        this.endAngel = endAngel
    }

    draw(ctx) {
        let pattern = 0
        console.log(this.color)
        if (this.color==='tunnel')
            pattern = ctx.createPattern(images['brick'], "repeat");
        else if (this.color==='tunnelEntrance')
            pattern = ctx.createPattern(images['tunnelEntrance'], "repeat");
        ctx.beginPath();
        if (this.color==='tunnel' || this.color==='tunnelEntrance')
            ctx.strokeStyle = pattern;
        else
            ctx.strokeStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngel);
        ctx.lineWidth = this.lineWidth
        ctx.stroke()
    }
}

class Rabbit extends Circle {
    constructor(x, y, color, radius=20, lineWidth=1, speed=0) {
        // we join the entrance to the tunnel and the speed of the movement of the rabbit
        x += speed - x % speed + tunnel.x % speed

        super(x, y, color, radius, lineWidth, speed)
        this.status = "intro"
        this.time = 0
        this.timeFrime = 0
    }

    move() {
        this.check(tunnel)
        switch (this.status) {
            case "intro":
                this.x += Math.cos(this.angle) * this.speed
                this.y += Math.sin(this.angle) * this.speed
                break
            case "inTunnel":
                for (let i=0; i < this.speed; i++){
                    this.angle += 0.01 / 2
                    this.x += Math.cos(this.angle) * tunnel.radius / 100 / 2
                    this.y += Math.sin(this.angle) * tunnel.radius / 100 / 2
                }
                break
        }
    }

    check(tunnel) {
        if(this.x + this.radius > w || this.x - this.radius < 0) this.angle += Math.PI
        if(this.y + this.radius > h || this.y - this.radius < 0) this.angle += Math.PI

        if (this.x===tunnel.x)
            this.status = "inTunnel"
    }

    draw(ctx, currentFrame) {
        if (this.status==="inTunnel") {
            if (Math.cos(this.angle) < 0.74 || this.x > tunnel.x) {
                if(!showRabbit)
                    return
            }
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle)
        ctx.translate(-this.x,-this.y);

        ctx.drawImage(images["rabbit"],
            currentFrame.x, currentFrame.y,
            22, 60,
            this.x-11, this.y-30,
            22, 60)
        ctx.restore();
    }

    update(ctx) {
        let now = performance.now()
        let deltaTime = now - (this.time || now)
        this.time = now
        this.timeFrime += deltaTime
        this.move()

        let currentFrame = {x:0, y:0}
        if (this.timeFrime>100) {
            currentFrame.x += 22
        }
        if (this.timeFrime>200) {
            currentFrame.x += 22
        }
        if (this.timeFrime>300) {
            currentFrame.x += 22
        }
        if (this.timeFrime>400) {
            currentFrame.x += 22
        }
        if (this.timeFrime>500) {
            currentFrame.x += 22
        }
        if (this.timeFrime>600) {
            this.timeFrime = 0
        }
        this.draw(ctx, currentFrame)

    }
}


loadImages = function() {
    let imageSources = [{
        name: 'rabbit',
        id: 'rabbit'
    },{
        name: 'brick',
        id: 'brick'
    },{
        name: 'tunnelEntrance',
        id: 'tunnelEntrance'
    }]
    let numImages = imageSources.length;
    for (let i = numImages - 1; i >= 0; i--) {
        let imgSource = imageSources[i];
        images[imgSource.name] = document.getElementById(imgSource.id);
    }
}

function setUp() {
    gameStatus = "running"
    score = 0
    loadImages()
    tunnel = new Tunnel(550, 350,29.85, Math.PI * 3+0.8, "tunnel",  200, 60)
    tunnelStrocke = new Tunnel(550, 350,29.83, Math.PI * 3+0.80, "black",  200, 68)
    tunnelExit = new Tunnel(550, 350,Math.PI+0.7, Math.PI+0.8, "tunnelEntrance",  200, 80)
    tunnelExitStrocke = new Tunnel(550, 350,Math.PI+0.68, Math.PI+0.82, "black",  200, 90)
    tunnelEntrance = new Tunnel(550, 350,4.68, 4.78, "tunnelEntrance",  200, 80)
    tunnelEntranceStrocke = new Tunnel(550, 350,4.66, 4.8, "black",  200, 90)
    openTunnel = new Tunnel(550, 350,Math.PI+0.8, 4.74, "limegreen",  182, 26)
    rabbit = new Rabbit(20, 150, "blue",  20, 1, 2)
    line = new Line()
}

function gameLoop() {
    ctx.clearRect(0, 0, w, h)
    if(gameStatus === "gameOver") {
        ctx.font = "30px Comic"
        ctx.fillText("Game Over", w/2 - 150, h/2 - 100)
        ctx.fillText("you have scored : " + score, w/2 - 150, h/2)
        return
    }


    ctx.font = "14px Comic"
    ctx.fillStyle = textColor
    ctx.fillText("Press SPACE when the circle came out from tunnel" , 20, 250)
    ctx.fillText("to score points" , 20, 264)
    ctx.fillText("Press H to hide a circle" , 20, 284)
    ctx.fillText("Press R to restart the game" , 20, 304)

    openTunnel.draw(ctx)
    tunnelStrocke.draw(ctx)
    tunnel.draw(ctx)
    line.draw(ctx)

    rabbit.update(ctx)

    tunnelEntranceStrocke.draw(ctx)
    tunnelEntrance.draw(ctx)
    tunnelExitStrocke.draw(ctx)
    tunnelExit.draw(ctx)

    requestAnimationFrame(gameLoop)
}

function random(to, from = 0) {
    return Math.floor(Math.random() * (to - from) + from)
}


setUp()
gameLoop()