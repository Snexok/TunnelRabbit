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
let targetPoint = {}

// Session control
let sessionRes = []
let res = "" // "Попался в ловушку", "Попал в цель", "Промахнулся"

// let showRabbit = false
let showTunnel = true

// preIntro intro running gameover
let gameStatus = "preIntro"
// let gameOverText = "You "
let gameOverText = "Game Over"


window.addEventListener("mousedown", (e) => {
    let duration = Math.sqrt((e.x-tunnel.x)**2+(e.y-tunnel.y)**2)
    if (duration >= tunnel.radius-tunnel.lineWidth/2 && duration <= tunnel.radius+tunnel.lineWidth/2) {
        duration = Math.sqrt((e.x-targetPoint.x)**2+(e.y-targetPoint.y)**2)
        if (duration <= targetPoint.radius) {
            targetPoint.x = 0
            targetPoint.y = 0
            targetPoint.seted = false
        }
        else{
            targetPoint.angle = Math.atan2(e.y - tunnel.y, e.x - tunnel.x)
            targetPoint.x = tunnel.radius * Math.cos(targetPoint.angle) + tunnel.x
            targetPoint.y = tunnel.radius * Math.sin(targetPoint.angle) + tunnel.y
            targetPoint.seted = true
        }
    }
})

window.addEventListener("keyup", (e) => {
    if (String(e.keyCode)==='32'){ // пробел|space
        switch (gameStatus) {
            case "inTunnel":
                // if (rabbit.angle/Math.PI%2 > openTunnel.startAngle/Math.PI+0.5 && rabbit.angle/Math.PI%2 < openTunnel.endAngle/Math.PI+0.5)
                //     gameOverText += "Win"
                // else
                //     gameOverText += "Lose"

                if (rabbit.angle/Math.PI%2 > trap.startAngle/Math.PI+0.5 && rabbit.angle/Math.PI%2 < trap.endAngle/Math.PI+0.5) {
                    res = "Попался в ловушку"
                    soundHit.volume = 0.2 * rabbit.speed
                    soundHit.play()
                }
                else
                    if (rabbit.angle/Math.PI%2 > targetPoint.angle/Math.PI+0.5-targetPoint.radius/1000 &&
                    rabbit.angle/Math.PI%2 < targetPoint.angle/Math.PI+0.5+targetPoint.radius/1000) {

                    res = "Попал в цель"
                }
                else {
                    res = "Промахнулся"
                }

                sessionRes.push(res)
                gameStatus = "gameOver"
                break
            case "preIntro":
                gameStatus = "intro"
                break
            case "gameOver":
                setUp(true)
                break

        }
    }
    else if (String(e.keyCode)==='69') { // e|у
        // showRabbit = !showRabbit
        showTunnel = !showTunnel
    }
    else if (String(e.keyCode)==='84') { // t|е
        trap.seted = !trap.seted
    }
    else if (String(e.keyCode)==='82') { // r|к
        setUp(true)
    }
    else if (String(e.keyCode)==='89') { // y|н
        saveSession()
    }
    else if (String(e.keyCode)==='189') { // -
        if (gameStatus === "preIntro") {
            if (rabbit.speed > 1) {
                rabbit.speed -= 1
                rabbit.x -= rabbit.speed + rabbit.x % rabbit.speed - tunnel.x % rabbit.speed
            }
        }
    }
    else if (String(e.keyCode)==='187') { // +
        if (gameStatus === "preIntro") {
            if (rabbit.speed < 5) {
                rabbit.speed += 1
                rabbit.x += rabbit.speed - rabbit.x % rabbit.speed + tunnel.x % rabbit.speed
            }
        }
    }
    else if (+String(e.keyCode)<=53 && +String(e.keyCode)>=49) { // 1-2-3-4-5
        if (gameStatus === "preIntro") {
            let newSpeed = +String(e.keyCode) - 48
            if (rabbit.speed > newSpeed)
                for (let i = rabbit.speed; i > newSpeed; i--) {
                    rabbit.speed -= 1
                    rabbit.x -= rabbit.speed + rabbit.x % rabbit.speed - tunnel.x % rabbit.speed
                }
            else if (rabbit.speed < newSpeed)
                for (let i = rabbit.speed; i < newSpeed; i++) {
                    rabbit.speed += 1
                    rabbit.x += rabbit.speed - rabbit.x % rabbit.speed + tunnel.x % rabbit.speed
                }
        }
    }
})

class Line{
    constructor(startX=20, endX=555, startY=178, endY=178, color='limegreen', lineWidth=5) {
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
        if (showTunnel) {
            ctx.beginPath();
            if (this.color !== "openTunnel") {
                ctx.arc(this.x, this.y, this.radius, this.startAngle - this.strokeWidth / 100 / 4, this.endAngle + this.strokeWidth / 100 / 4);
                ctx.strokeStyle = this.strokeColor;
                ctx.lineWidth = this.lineWidth + this.strokeWidth
                ctx.stroke()
            }
        }

        // Tunnel
        ctx.beginPath();
        if (showTunnel && (this.color === 'tunnel' || this.color === 'tunnelEntrance'))
            ctx.strokeStyle = pattern;
        else if (this.color === 'openTunnel')
            ctx.strokeStyle = 'limegreen'
        if (showTunnel || this.color === 'openTunnel') {
            ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle);
            ctx.lineWidth = this.lineWidth
            ctx.stroke()
        }
    }
}

class Trap extends Circle {
    constructor(x, y, startAngle, endAngle, color, radius = 20, lineWidth = 1, strokeWidth = 0, strokeColor="black") {
        super(x, y, color, radius, lineWidth)
        this.startAngle = startAngle
        this.endAngle = endAngle
        this.strokeWidth = strokeWidth
        this.strokeColor = strokeColor
        this.seted = true
    }

    draw(ctx) {
        ctx.beginPath();
        let pattern = ctx.createPattern(images['jail'], "repeat");
        ctx.strokeStyle = pattern
        ctx.lineWidth = showTunnel ? tunnel.lineWidth : rabbit.height
        this.radius = showTunnel ? tunnel.radius : openTunnel.radius
        ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle);
        ctx.stroke()
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
        this.height = 60
        this.width = 22
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
        // if (gameStatus === "inTunnel") {
        //     if (Math.cos(this.angle) < 0.74 || this.x > tunnel.x) {
        //         if(!showRabbit)
        //             return
        //     }
        // }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle)
        ctx.translate(-this.x,-this.y);

        ctx.drawImage(images["rabbit"],
            currentFrame.x, currentFrame.y,
            this.width, this.height,
            this.x-this.width/2, this.y-this.height/2,
            this.width, this.height)
        ctx.restore();
    }

    update(ctx) {
        let now = performance.now()
        let deltaTime = now - (this.time || now)
        this.time = now
        this.timeFrime += deltaTime
        this.move()

        let currentFrame = {x:0, y:0}

     if (gameStatus !== "preIntro" && gameStatus !== "gameOver") {
         if (this.timeFrime > 100) {
             currentFrame.x += 22
         }
         if (this.timeFrime > 200) {
             currentFrame.x += 22
         }
         if (this.timeFrime > 300) {
             currentFrame.x += 22
         }
         if (this.timeFrime > 400) {
             currentFrame.x += 22
         }
         if (this.timeFrime > 500) {
             currentFrame.x += 22
         }
         if (this.timeFrime > 600) {
             this.timeFrime = 0
         }
     }
    this.draw(ctx, currentFrame)

    }
}


class TargetPoint extends Obj {
    constructor(x=0, y=0, color="green", radius = 30, lineWidth = 1) {
        super(x, y, color, radius, lineWidth)
        this.angle = 0
        this.radius = radius
        this.seted = false
    }

    draw(ctx) {
        if (this.seted) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.arc(this.x, this.y, this.radius/2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function download(data, filename, type) {
    let file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        let a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function saveSession() {
    console.log(sessionRes)
    let resText = ""

    for (let i=0; i < sessionRes.length; i++) {
        console.log(sessionRes[i])
        resText += "Попытка номер " + (i+1) + ": " + sessionRes[i] + "\n"
    }
    download(resText, "Результат сессии "+(Math.random() + 1).toString(36).substring(7), 'text/plain')
    sessionRes = []
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


loadSounds = function() {
    soundHit = new Audio('assets/alarm-106151.mp3');
    soundHit.volume = 1
}


function setUp(restart=false) {
    if (!restart) {
        loadImages()
        loadSounds()
        targetPoint = new TargetPoint()
    }
    showTunnel = true
    gameStatus = "preIntro"

    sessionRes = []

    trap = new Trap(550, 350,Math.PI-1, Math.PI - 0.1, "jail",  200, 60, 8, "black")
    tunnel = new Tunnel(550, 350,Math.PI * 2 - 1.57, Math.PI + 0.8, "tunnel",  200, 60, 8, "black")
    tunnelExit = new Tunnel(550, 350,Math.PI + 0.7, Math.PI + 0.8, "tunnelEntrance",  200, 80, 8, "black")
    tunnelEntrance = new Tunnel(550, 350,Math.PI + 1.53, Math.PI + 1.63, "tunnelEntrance",  200, 80, 8, "black")
    openTunnel = new Tunnel(550, 350,0, Math.PI *2, "openTunnel",  182, 26)
    rabbit = new Rabbit(30, 150, "blue",  20, 1, 2)
    line = new Line()
}


function gameLoop() {
    ctx.clearRect(0, 0, w, h)

    ctx.fillStyle = textColor
    ctx.font = "24px Helvetica"
    ctx.fillText("Скорость: " + rabbit.speed , 20, 24)

    ctx.fillStyle = trap.seted ? "#c00" : "limegreen"
    ctx.font = "24px Helvetica"
    ctx.fillText("Ловушка " + (trap.seted ? "активирована" : "отсутствует") , 180, 24)

    ctx.fillStyle = textColor
    ctx.font = "16px Helvetica"
    ctx.fillText(`Пробел -> ${gameStatus === "preIntro" ? "начать испытание" : "остановить зайца"}`, 20, 450+20*0)
    ctx.fillText("1-2-3-4-5 -> скорость бега", 20, 450+20*1)
    ctx.fillText("У -> убрать туннель", 20, 450+20*2)
    ctx.fillText("К -> начать испытание заново", 20, 450+20*3)
    ctx.fillText(`Е -> ${trap.seted ? "убрать" : "активировать"} ловушку`, 20, 450+20*4)
    ctx.fillText("Н -> сохранить сессию и начать новую", 20, 450+20*5)

    openTunnel.draw(ctx)

    line.update(ctx)

    if(gameStatus === "gameOver")
        targetPoint.draw(ctx)

    rabbit.update(ctx)

    tunnel.draw(ctx)

    tunnelEntrance.draw(ctx)
    tunnelExit.draw(ctx)

    if(gameStatus !== "gameOver")
        targetPoint.draw(ctx)

    if(gameStatus === "gameOver" && showTunnel)
        targetPoint.draw(ctx)

    if(gameStatus === "gameOver") {
        trap.draw(ctx)
        ctx.fillStyle = textColor
        ctx.font = "30px Comic"
        ctx.fillText(gameOverText, w/2 -110, h/2 + 60)
    }
    requestAnimationFrame(gameLoop)
}


setUp()
gameLoop()