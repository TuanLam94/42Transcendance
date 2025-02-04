export function renderTest1()
{
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
        
        const app = document.getElementById('app');
        app.innerHTML  =
        `
            <span id="openBtn">&#9776;</span>
                <div id="sidebar">
                        <!-- Navbar Bootstrap -->
                        <nav class="navbar navbar-dark bg-dark flex-column">
                            <ul>
                                <li><a href="#">Accueil</a></li>
                                <li><a href="#">A propos</a></li>
                                <li><a href="#">Services</a></li>
                                <li><a href="#">Contact</a></li>
                            </ul>
                        </nav>
                </div>
                <div class="container text-center mt-4">
                    <h1 class="text-light">Pong Game</h1>
                    // <p id="score" class="fs-3 fw-bold text-warning">${scoreLeft} : ${scoreRight}</p>
                
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
        document.getElementById("openBtn").addEventListener("click", function() {
            document.getElementById("sidebar").classList.toggle("open");
        });
}
