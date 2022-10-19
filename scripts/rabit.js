const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

let h = canvas.height = 600
let w = canvas.width = 1200

let textColor = 'wheat'

let soundHit = {}
let images = {}

// Game objects
let rabbit = {}
let tunnel = {}
let tunnelEntrance = {}
let tunnelExit = {}
let openTunnel = {}
let trap = {}
let line = {}

let showRabbit = false

// preIntro intro running gameover
let gameStatus = "preIntro"
let gameOverText = "You "

window.addEventListener("keyup", (e) => {
    if (String(e.keyCode)==='32'){
        switch (gameStatus) {
            case "inTunnel":
                if (rabbit.angle/Math.PI%2 > openTunnel.startAngle/Math.PI+0.5 && rabbit.angle/Math.PI%2 < openTunnel.endAngle/Math.PI+0.5)
                    gameOverText += "Win"
                else
                    gameOverText += "Lose"

                if (rabbit.angle/Math.PI%2 > trap.startAngle/Math.PI+0.5 && rabbit.angle/Math.PI%2 < trap.endAngle/Math.PI+0.5)
                    soundHit.play();

                gameStatus = "gameOver"
                break
            case "preIntro":
                gameStatus = "intro"
                break
            case "gameOver":
                document.location.reload()
                break

        }
    }
    else if (String(e.keyCode)==='72') {
        showRabbit = showRabbit ? false : true
    }
    else if (String(e.keyCode)==='82') {
        document.location.reload()
    }
    else if (String(e.keyCode)==='189') {
        if (gameStatus === "preIntro") {
            if (rabbit.speed > 1) {
                rabbit.speed -= 1
                rabbit.x -= rabbit.speed + rabbit.x % rabbit.speed - tunnel.x % rabbit.speed
            }
        }
    }
    else if (String(e.keyCode)==='187') {
        if (gameStatus === "preIntro") {
            if (rabbit.speed < 5) {
                rabbit.speed += 1
                rabbit.x += rabbit.speed - rabbit.x % rabbit.speed + tunnel.x % rabbit.speed
            }
        }
    }
})

class Line{
    constructor(startX=20, endX=555, startY=182, endY=182, color='black', lineWidth=5) {
        this.startX = startX
        this.endX = endX
        this.startY = startY
        this.endY = endY
        this.color = color
        this.lineWidth = lineWidth
    }

    update(ctx) {
        if (this.startX===this.endX)
            return

        if (gameStatus === "inTunnel")
            if (this.startX<this.endX) {
                this.startX += 35
                this.draw(ctx)
            }
            else
                this.startX=this.endX
        else
            this.draw(ctx)
    }

    draw(ctx) {
        // set line stroke and line width
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;

        // draw a line
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();
    }
}

class Obj {
    constructor(x, y, color, lineWidth=1) {
        this.x = x
        this.y = y
        this.color = color
        this.lineWidth = lineWidth
    }
}

class Circle extends Obj{
    constructor(x, y, color, radius=20, lineWidth=1) {
        super(x, y, color, lineWidth)
        this.radius = radius
    }
}


class Tunnel extends Circle {
    constructor(x, y, startAngle, endAngle, color, radius = 20, lineWidth = 1, strokeWidth = 0, strokeColor="black") {
        super(x, y, color, radius, lineWidth)
        this.startAngle = startAngle
        this.endAngle = endAngle
        this.strokeWidth = strokeWidth
        this.strokeColor = strokeColor
    }

    draw(ctx) {
        let pattern = 0
        if (this.color==='tunnel')
            pattern = ctx.createPattern(images['brick'], "repeat");
        else if (this.color==='tunnelEntrance')
            pattern = ctx.createPattern(images['tunnelEntrance'], "repeat");


        // Strocke
        ctx.beginPath();
        if (this.color !== "openTunnel") {
            ctx.arc(this.x, this.y, this.radius, this.startAngle - this.strokeWidth / 100 / 4, this.endAngle + this.strokeWidth / 100 / 4);
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.lineWidth + this.strokeWidth
            ctx.stroke()
        }

        // Tunnel
        ctx.beginPath();
        if (this.color === 'tunnel' || this.color === 'tunnelEntrance')
            ctx.strokeStyle = pattern;
        else if (this.color === 'openTunnel')
            ctx.strokeStyle = 'limegreen'
        ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle);
        ctx.lineWidth = this.lineWidth
        ctx.stroke()
    }
}

class Trap extends Circle {
    constructor(x, y, startAngle, endAngle, color, radius = 20, lineWidth = 1, strokeWidth = 0, strokeColor="black") {
        super(x, y, color, radius, lineWidth)
        this.startAngle = startAngle
        this.endAngle = endAngle
        this.strokeWidth = strokeWidth
        this.strokeColor = strokeColor
    }

    draw(ctx) {
        if (showRabbit || gameStatus==="gameOver") {
            ctx.beginPath();
            let pattern = ctx.createPattern(images['jail'], "repeat");
            ctx.strokeStyle = pattern
            ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle);
            ctx.lineWidth = this.lineWidth
            ctx.stroke()
        }
    }
}


class Rabbit extends Obj {
    constructor(x, y, color, radius=20, lineWidth=1, speed=0) {
        // we join the entrance to the tunnel and the speed of the movement of the rabbit
        x += speed - x % speed + tunnel.x % speed

        super(x, y, color, radius, lineWidth, speed)
        this.speed = speed
        this.time = 0
        this.timeFrime = 0
        this.angle = 0
    }

    move() {
        this.check(tunnel)
        switch (gameStatus) {
            case "preIntro":
                break
            case "gameOver":
                break
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
            gameStatus = "inTunnel"
    }

    draw(ctx, currentFrame) {
        if (gameStatus === "inTunnel") {
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
    },{
        name: 'jail',
        id: 'jail'
    }]
    let numImages = imageSources.length;
    for (let i = numImages - 1; i >= 0; i--) {
        let imgSource = imageSources[i];
        images[imgSource.name] = document.getElementById(imgSource.id);
    }
}


function decodeBase64ToArrayBuffer(base64String) {
    let len = (base64String.length / 4) * 3;
    let str = atob(base64String);
    let arrayBuffer = new ArrayBuffer(len);
    let bytes = new Uint8Array(arrayBuffer);

    for (let i = 0; i < len; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes.buffer;
}

loadSounds = function() {
    soundHit = new Audio('assets/offline-sound-hit.mp3');
    soundHit.volume = 1
}


function setUp() {
    loadImages()
    loadSounds()
    trap = new Trap(550, 350,Math.PI-1, Math.PI - 0.1, "jail",  200, 60, 8, "black")
    tunnel = new Tunnel(550, 350,Math.PI * 2 - 1.57, Math.PI + 0.8, "tunnel",  200, 60, 8, "black")
    tunnelExit = new Tunnel(550, 350,Math.PI + 0.7, Math.PI + 0.8, "tunnelEntrance",  200, 80, 8, "black")
    tunnelEntrance = new Tunnel(550, 350,Math.PI + 1.53, Math.PI + 1.63, "tunnelEntrance",  200, 80, 8, "black")
    openTunnel = new Tunnel(550, 350,Math.PI + 0.8, Math.PI + 1.63, "openTunnel",  182, 26)
    rabbit = new Rabbit(30, 150, "blue",  20, 1, 2)
    line = new Line()
}

function gameLoop() {
    ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = textColor

    ctx.font = "24px Comic"
    ctx.fillText("Rabbit speed: " + rabbit.speed , 20, 24)

    ctx.font = "14px Comic"
    ctx.fillText("Press SPACE to perform the main action" , 20, 250+20*0)
    ctx.fillText("Press - to down the rabbit's speed" , 20, 250+20*1)
    ctx.fillText("Press + to up the rabbit's speed" , 20, 250+20*2)
    ctx.fillText("Press H to hide a rabbit" , 20, 250+20*3)
    ctx.fillText("Press R to restart the game" , 20, 250+20*4)

    openTunnel.draw(ctx)
    tunnel.draw(ctx)

    line.update(ctx)

    rabbit.update(ctx)


    trap.draw(ctx)
    tunnelEntrance.draw(ctx)
    tunnelExit.draw(ctx)

    if(gameStatus === "gameOver") {
        ctx.font = "30px Comic"
        ctx.fillText(gameOverText, w/2 -110, h/2 + 60)
    }
    requestAnimationFrame(gameLoop)
}


setUp()
gameLoop()