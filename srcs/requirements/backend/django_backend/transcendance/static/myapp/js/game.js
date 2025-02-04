let ballX = 240;
let ballY = 160;
let dx = 1;
let dy = -1;
let ballRadius = 5;
let widthPaddle = 10;
let heightPaddle = 50;
let leftPaddleX = widthPaddle;
let leftPaddleY = 140;
let rightPaddleX = widthPaddle;
let rightPaddleY = 140;
let leftUp = false;
let leftDown = false;
let rightUp = false;
let rightDown = false;
let scoreRight = 100;
let scoreLeft = 0;
let paddleSpeed = 3;

const pong = document.getElementById("Pong");
pong.innerHTML =
`
      <div class="container text-center mt-4">
        <h1 class="text-light">Pong Game</h1>
        <p id="score" class="fs-3 fw-bold text-warning">${scoreLeft} : ${scoreRight}</p>
    
        <div id="game-area">
            <div id="ball"></div>
            <div id="leftPaddle"></div>
            <div id="rightPaddle"></div>
        </div>
    
        <button class="btn btn-primary mt-3" onclick="resetGame()">Restart</button>
    </div>
`;

let ball = document.getElementById("ball");
let leftPaddle = document.getElementById("leftPaddle");
let rightPaddle = document.getElementById("rightPaddle");


function updateGame()
{
    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";
    leftPaddle.style.top = leftPaddleY + "px";
    rightPaddle.style.top = rightPaddleY + "px";
}

function moveBall()
{
    ballX += dx;
    ballY += dy;

    if (ballY <= 0 || ballY >= 290)
        dy = -dy;
    if (ballX <= 15 && ballY >= leftPaddleY && ballY <= leftPaddleY + 50)
            dx = -dx;
    if (ballX >= 475 && ballY >= rightPaddleY && ballY <= rightPaddleY + 50)
            dx = -dx;
    if (ballX <= 0 || ballX >= 490)
    {
        dx = -dx;
        ballX = 245;
        ballY = 145;
    }
    updateGame();
}

function movePaddles()
{
    if (leftUp && leftPaddleY > 0)
        leftPaddleY -= paddleSpeed;
    if (leftDown && leftPaddleY < 250)
        leftPaddleY += paddleSpeed;
    if (rightUp && rightPaddleY > 0)
        rightPaddleY -= paddleSpeed;
    if (rightDown && rightPaddleY < 250)
        rightPaddleY += paddleSpeed;
}

function keyDownHandler(e)
{
    if (e.key == "ArrowDown")
        rightDown = true;
    else if (e.key == "ArrowUp")
        rightUp = true;
    if (e.key == "s" || e.key == "S")
        leftDown = true;
    else if (e.key == "w" || e.key == "W")
        leftUp = true;
}

function keyUpHandler(e)
{
    if (e.key == "ArrowDown")
        rightDown = false;
    else if (e.key == "ArrowUp")
        rightUp = false;
    if (e.key == "s" || e.key == "S")
        leftDown = false;
    else if (e.key == "w" || e.key == "W")
        leftUp = false;
}

function draw()
{
    moveBall();
    movePaddles();
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
let interval = setInterval(draw, 10);


// function send_RightPaddle()
// {
//     if (rightUp)
//     {
//         socket.send(JSON.stringify({side: "1", direction: "0"}));
//     }
//     if (rightDown)
//     {
//         socket.send(JSON.stringify({side: "1", direction: "1"}));
//     }
// }

// function send_LeftPaddle()
// {
//     if (leftUp)
//     {
//         socket.send(JSON.stringify({side: "0", direction: "0"}));
//     }
//     if (leftDown)
//     {
//         socket.send(JSON.stringify({side: "0", direction: "1"}));
//     }
// }

// socket.onopen = () =>
// {
//     console.log("Connected");    
// };
    
// socket.onmessage = (event) =>
// {
//     const data = JSON.parse(event);
    
//     game_over = data.game_over;
//     xBall = data.ball[0];
//     yBall = data.ball[1];
//     y_leftPaddle = data.paddle_left;
//     y_rightPaddle = data.paddle_right;
// }


