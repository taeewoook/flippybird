// Background scrolling speed
let move_speed = 9;

// Gravity constant value
let gravity = 0.5;

// Getting reference to the bird element
let bird = document.querySelector(".bird");

// Getting bird element properties
let bird_props = bird.getBoundingClientRect();
let background = document.querySelector(".background").getBoundingClientRect();

// Getting reference to the score element
let score_val = document.querySelector(".score_val");
let message = document.querySelector(".message");
let score_title = document.querySelector(".score_title");

// Setting initial game state to start
let game_state = "Start";

// Add an eventlistener for key presses
document.addEventListener("keydown", (e) => {
  // Start the game if enter key is pressed
  if (e.key === "Enter" && game_state !== "Play") {
    resetGame();
  } else if (e.key === " ") {
    shootBullet();
  }
});

// Reset game function
function resetGame() {
  document.querySelectorAll(".pipe_sprite").forEach((e) => {
    e.remove();
  });
  bird.style.top = "40vh";
  game_state = "Play";
  message.innerHTML = "";
  score_title.innerHTML = "Score: ";
  score_val.innerHTML = "0";
  play();
}

// Shoot bullet function
// Shoot bullet function
function shootBullet() {
  let bullet = document.createElement("div");
  bullet.className = "bullet";
  bullet.style.top = bird_props.top + bird_props.height / 2 + "px";
  document.body.appendChild(bullet);

  function moveBullet(bullet) {
    if (game_state !== "Play") return;

    let bullet_props = bullet.getBoundingClientRect();
    let arrows = document.querySelectorAll(".arrow");

    // Check collision with arrows
    arrows.forEach((arrow) => {
      let arrow_props = arrow.getBoundingClientRect();

      if (
        bullet_props.left < arrow_props.left + arrow_props.width &&
        bullet_props.left + bullet_props.width > arrow_props.left &&
        bullet_props.top < arrow_props.top + arrow_props.height &&
        bullet_props.top + bullet_props.height > arrow_props.top
      ) {
        // Collision detected, remove arrow and increase score
        arrow.remove();
        bullet.remove();
        score_val.innerHTML = +score_val.innerHTML + 1;
      }
    });

    // Move bullet
    bullet.style.left = bullet_props.left + move_speed + "px";

    // Remove bullet if it goes offscreen
    if (bullet_props.right > window.innerWidth) {
      bullet.remove();
    } else {
      requestAnimationFrame(() => moveBullet(bullet));
    }
  }

  moveBullet(bullet); // Call moveBullet() to start moving the bullet
}

function play() {
  let arrowCounter = 0;
  const maxArrows = 3; // 화면에 표시되는 최대 화살 수를 설정합니다.
  let arrowSpawnCounter = 0;
  const arrowSpawnThreshold = 5; // 5점마다 화살을 생성합니다.

  function create_arrow() {
    if (game_state !== "Play" || arrowCounter >= maxArrows) return;

    // 화살의 y축에서 랜덤한 위치 계산
    let arrow_pos = Math.floor(Math.random() * 60) + 20;
    let arrow = document.createElement("div");
    arrow.className = "arrow";
    arrow.style.top = arrow_pos + "vh";
    arrow.style.left = "100vw";

    // 생성된 화살 요소를 DOM에 추가합니다.
    document.body.appendChild(arrow);

    arrowCounter++; // 화살 카운터 증가

    requestAnimationFrame(move_arrow);
    requestAnimationFrame(create_arrow);
  }

  function move_arrow() {
    if (game_state !== "Play") return;

    let arrows = document.querySelectorAll(".arrow");
    arrows.forEach((arrow) => {
      let arrow_props = arrow.getBoundingClientRect();

      // 화살이 화면을 벗어났을 경우 제거합니다.
      if (arrow_props.right <= 0) {
        arrow.remove();
        arrowCounter--; // 화살 카운터 감소
      } else {
        // 새와 화살의 충돌 감지
        if (
          bird_props.left < arrow_props.left + arrow_props.width &&
          bird_props.left + bird_props.width > arrow_props.left &&
          bird_props.top < arrow_props.top + arrow_props.height &&
          bird_props.top + bird_props.height > arrow_props.top
        ) {
          // 충돌이 발생하면 게임 상태를 종료로 변경합니다.
          game_state = "End";
          message.innerHTML = "Enter 키를 눌러 재시작하세요";
          message.style.left = "28vw";
          return;
        }

        arrow.style.left = arrow_props.left - 3 + "px";
      }
    });

    requestAnimationFrame(move_arrow);
  }

  requestAnimationFrame(create_arrow);

  function move() {
    // Detect if game has ended
    if (game_state !== "Play") return;

    // Getting reference to all the pipe elements
    let pipe_sprite = document.querySelectorAll(".pipe_sprite");
    pipe_sprite.forEach((element) => {
      let pipe_sprite_props = element.getBoundingClientRect();
      bird_props = bird.getBoundingClientRect();

      // Delete the pipes if they have moved out
      // of the screen hence saving memory
      if (pipe_sprite_props.right <= 0) {
        element.remove();
      } else {
        // Collision detection with bird and pipes
        if (
          bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width &&
          bird_props.left + bird_props.width > pipe_sprite_props.left &&
          bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height &&
          bird_props.top + bird_props.height > pipe_sprite_props.top
        ) {
          // Change game state and end the game
          // if collision occurs
          game_state = "End";
          message.innerHTML = "Press Enter To Restart";
          message.style.left = "28vw";
          return;
        } else {
          // Increase the score if player
          // has successfully dodged the pipes
          if (
            pipe_sprite_props.right < bird_props.left &&
            pipe_sprite_props.right + move_speed >= bird_props.left &&
            element.increase_score === "1"
          ) {
            score_val.innerHTML = +score_val.innerHTML + 1;

            // Check if it's time to spawn an arrow
            arrowSpawnCounter++;
            if (arrowSpawnCounter >= arrowSpawnThreshold) {
              create_arrow();
              arrowSpawnCounter = 0;
            }
          }

          element.style.left = pipe_sprite_props.left - move_speed + "px";
        }
      }
    });

    requestAnimationFrame(move);
  }

  requestAnimationFrame(move);

  let bird_dy = 0;
  function apply_gravity() {
    if (game_state !== "Play") return;
    bird_dy = bird_dy + gravity;
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" || e.key === " ") {
        bird_dy = -6.6;
      }
    });

    // Collision detection with bird and
    // window top and bottom

    if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
      game_state = "End";
      message.innerHTML = "Press Enter To Restart";
      message.style.left = "28vw";
      return;
    }
    bird.style.top = bird_props.top + bird_dy + "px";
    bird_props = bird.getBoundingClientRect();
    requestAnimationFrame(apply_gravity);
  }

  requestAnimationFrame(apply_gravity);

  let pipe_seperation = 0;

  // Constant value for the gap between two pipes
  let pipe_gap = 50;
  function create_pipe() {
    if (game_state !== "Play") return;

    // Create another set of pipes
    // if distance between two pipe has exceeded
    // a predefined value
    if (pipe_seperation > 50) {
      pipe_seperation = 0;

      // Calculate random position of pipes on y axis
      let pipe_posi = Math.floor(Math.random() * 43) + 8;
      let pipe_sprite_inv = document.createElement("div");
      pipe_sprite_inv.className = "pipe_sprite";
      pipe_sprite_inv.style.top = pipe_posi - 70 + "vh";
      pipe_sprite_inv.style.left = "100vw";

      // Append the created pipe element in DOM
      document.body.appendChild(pipe_sprite_inv);
      let pipe_sprite = document.createElement("div");
      pipe_sprite.className = "pipe_sprite";
      pipe_sprite.style.top = pipe_posi + pipe_gap + "vh";
      pipe_sprite.style.left = "100vw";
      pipe_sprite.increase_score = "1";

      // Append the created pipe element in DOM
      document.body.appendChild(pipe_sprite);
    }
    pipe_seperation++;
    requestAnimationFrame(create_pipe);
  }

  requestAnimationFrame(create_pipe);
}

play();
