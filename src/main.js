import kaplay from "kaplay";
import "kaplay/global";
kaplay({
  scale: 1,
  background: [141, 183, 255],
});

// Define layers once
layers(["bg", "obj", "ui"], "obj");

// Load assets
loadSprite("background", "/sprites/sky.webp");
loadSprite("bean", "/sprites/dino.png");
loadSprite("bag", "/sprites/bag.png");
loadSprite("ghosty", "/sprites/ghosty.png");
loadSprite("spike", "/sprites/spike.png");
loadSprite("grass", "/sprites/grass.png");
loadSprite("steel", "/sprites/steel.png");
loadSprite("prize", "/sprites/jumpy.png");
loadSprite("apple", "/sprites/egg_crack.png");
loadSprite("portal", "/sprites/door.png");
loadSprite("coin", "/sprites/coin.png");
loadSound("coin", "/sounds/score.mp3");
loadSound("powerup", "/sounds/powerup.mp3");
loadSound("blip", "/sounds/blip.mp3");
loadSound("hit", "/sounds/hit.mp3");
loadSound("portal", "/sounds/portal.mp3");
loadSound("bgSound", "/sounds/backgroundMusic.mp3");
loadSprite("dino", "/sprites/dino.png", {
  // The image contains 9 frames layed out horizontally, slice it into individual frames
  sliceX: 9,
  // Define animations
  anims: {
    idle: {
      // Starts from frame 0, ends at frame 3
      from: 0,
      to: 3,
      // Frame per second
      speed: 5,
      loop: true,
    },
    run: {
      from: 4,
      to: 7,
      speed: 10,
      loop: true,
    },
    // This animation only has 1 frame
    jump: 8,
  },
});

setGravity(3200);

// Custom component controlling enemy patrol movement
function patrol(speed = 60, dir = 1) {
  return {
    id: "patrol",
    add() {
      this.onUpdate(() => {
        this.move(speed * dir, 0);
      });
      this.onCollide((obj, col) => {
        if (col.isLeft() || col.isRight()) {
          dir = -dir;
        }
      });
    },
  };
}

// Custom component that makes stuff grow big
function big() {
  let timer = 0;
  let isBig = false;
  let destScale = 2;
  return {
    id: "big",
    add() {
      this.onUpdate(() => {
        if (isBig) {
          timer -= dt();
          if (timer <= 0) {
            this.smallify();
          }
        }
        this.scale = this.scale.lerp(vec2(destScale), dt() * 6);
      });
    },
    isBig() {
      return isBig;
    },
    smallify() {
      destScale = 2;
      timer = 0;
      isBig = false;
    },
    biggify(time) {
      destScale = 2.5;
      timer = time;
      isBig = true;
    },
  };
}

// Define some constants
const JUMP_FORCE = 1320;
const MOVE_SPEED = 480;
const FALL_DEATH = 2400;

const LEVELS = [
  [
    "                  ",
    "     $      $     ",
    "   --        --   ",
    "       $$         ",
    " %     ===   ===  ",
    "   ^^  >      =   ",
    "=======   ======  ",
    "                  ",
    "      0           ",
    "   --    ^^    @  ",
    "==================",
  ],
  [
    "                          $",
    "                          $",
    "                          $",
    "        ^^                $",
    "           $$             $",
    "       ===          ===   $",
    "  %   ====     =       =  $",
    "       ^^         =    =  $",
    "                      =    ",
    "       ^^      = >    =   @",
    "===========================",
  ],
  [
    "     $    $    $    $     $",
    "          ^^               ",
    "   ========    =======     ",
    "       $$                 $",
    "  %    ===  ^^   ===    =  $",
    "       ===    ===  =   ^^ $",
    "   ^^^>^^^^>^^^^>^^^^>^^^^@",
    "===========================",
  ],
  [
    "               $           ",
    "              ---          ",
    "            $$             ",
    " %    ===   ===            ",
    "            ^^          >  ",
    "        ===  ===  ==  ^^   ",
    "      ^^          ===  === ",
    "====      ^^     =======   ",
    "      ===   >  ==    @     ",
    "===========================",
  ],
  [
    "     $    $    $    $    $ ",
    "  ^^     ^^^^       ^^^^   ",
    "======   ===   ========    ",
    "     $$                   $",
    "  %  ===   ===   ^^  ===  $",
    "       ^^    ==   ^^      $",
    "  ^^^^>^^^^^>^^^>^^^>^^^^>@",
    "===========================",
  ],
];

const levelConf = {
  tileWidth: 64,
  tileHeight: 64,
  tiles: {
    "=": () => [
      sprite("grass"),
      area(),
      body({ isStatic: true }),
      anchor("bot"),
      offscreen({ hide: true }),
      "platform",
      scale(1, 1),
    ],
    "-": () => [
      sprite("steel"),
      area(),
      body({ isStatic: true }),
      offscreen({ hide: true }),
      anchor("bot"),
    ],
    0: () => [
      sprite("bag"),
      area(),
      body({ isStatic: true }),
      offscreen({ hide: true }),
      anchor("bot"),
    ],
    $: () => [
      sprite("coin"),
      area(),
      pos(0, -9),
      anchor("bot"),
      offscreen({ hide: true }),
      "coin",
    ],
    "%": () => [
      sprite("prize"),
      area(),
      body({ isStatic: true }),
      anchor("bot"),
      offscreen({ hide: true }),
      "prize",
    ],
    "^": () => [
      sprite("spike"),
      area(),
      body({ isStatic: true }),
      anchor("bot"),
      offscreen({ hide: true }),
      "danger",
    ],
    "#": () => [
      sprite("apple"),
      area(),
      anchor("bot"),
      body(),
      offscreen({ hide: true }),
      "apple",
    ],
    ">": () => [
      sprite("ghosty"),
      area(),
      anchor("bot"),
      body(),
      patrol(),
      offscreen({ hide: true }),
      "enemy",
    ],
    "@": () => [
      sprite("portal"),
      area({ scale: 0.5 }),
      anchor("bot"),
      pos(0, -12),
      offscreen({ hide: true }),
      "portal",
    ],
  },
};

const questions = [
  {
    question: "What has keys but can't open locks?",
    choices: ["Piano", "Map", "Clock"],
    correct: "Piano",
  },
  {
    question:
      "What comes once in a minute, twice in a moment, but never in a thousand years?",
    choices: ["The letter M", "Time", "Clock"],
    correct: "The letter M",
  },
  {
    question: "I speak without a mouth and hear without ears. What am I?",
    choices: ["Echo", "Radio", "Phone"],
    correct: "Echo",
  },
  {
    question: "What is always coming but never arrives?",
    choices: ["Tomorrow", "Today", "Yesterday"],
    correct: "Tomorrow",
  },
  {
    question: "What can travel around the world while staying in a corner?",
    choices: ["Stamp", "Airplane", "Sun"],
    correct: "Stamp",
  },
];

function makeButton(p, t, cb) {
  const button = add([
    pos(p),
    rect(150, 40, { radius: 5 }),
    anchor("center"),
    color(WHITE),
    area(),
    "button",
  ]);
  button.add([text(t), color(BLACK), anchor("center"), area()]);
  button.onClick(cb);
}

function askQuestion(levelId, coins) {
  const questionData = questions[levelId % questions.length];
  const question = questionData.question;
  const choices = questionData.choices;
  const correctAnswer = questionData.correct;

  const questionBox = add([
    pos(0, 0),
    rect(width(), 200), // Increased height for question and choices
    color(0, 0, 0),
    layer("ui"),
    fixed(),
  ]);

  const questionLabel = add([
    pos(center().x, 50),
    text(question, { size: 24 }),
    color(WHITE),
    anchor("center"),
    layer("ui"),
    fixed(),
  ]);

  choices.forEach((choice, index) => {
    makeButton(vec2(center().x, 150 + index * 50), choice, () => {
      if (choice === correctAnswer) {
        destroy(questionBox);
        destroy(questionLabel);
        if (levelId + 1 < LEVELS.length) {
          go("game", { levelId: levelId + 1, coins: coins });
        } else {
          go("win");
        }
      } else {
        destroy(questionBox);
        destroy(questionLabel);
        go("game", { levelId: levelId, coins: coins });
      }
    });
  });
}

scene("game", ({ levelId, coins } = { levelId: 0, coins: 0 }) => {
  play("bgSound", {
    loop: true,
    volume: 0.5,
  });
  // add([
  //   sprite("background", { width: 500, height: 500 }),
  //   pos(0, 0),
  //   layer("bg"),
  // ]);
  // Add level to scene
  const level = addLevel(LEVELS[levelId ?? 0], levelConf);

  // Define player object
  // const player = add([
  //   sprite("dino"),
  //   pos(10, 10),
  //   area(),
  //   scale(10),
  //   body(),
  //   big(),
  //   anchor("bot"),
  // ]);
  const player = add([
    sprite("dino"),
    pos(10, 10),
    area(),
    body(),
    scale(2.5),
    big(),
    anchor("bot"),
  ]);

  // Switch to "idle" or "run" animation when player hits ground
  player.onGround(() => {
    if (!isKeyDown("left") && !isKeyDown("right")) {
      player.play("idle");
    } else {
      player.play("run");
    }
  });

  player.onAnimEnd((anim) => {
    if (anim === "idle") {
      // You can also register an event that runs when certain anim ends
    }
  });

  // Action() runs every frame
  player.onUpdate(() => {
    // Center camera to player
    camPos(player.pos);
    // Check fall death
    if (player.pos.y >= FALL_DEATH) {
      go("lose");
    }
  });

  player.onBeforePhysicsResolve((collision) => {
    if (collision.target.is(["platform", "soft"]) && player.isJumping()) {
      collision.preventResolution();
    }
  });

  player.onPhysicsResolve(() => {
    // Set the viewport center to player.pos
    camPos(player.pos);
  });

  // If player onCollide with any obj with "danger" tag, lose
  player.onCollide("danger", () => {
    go("lose");
    play("hit");
  });

  player.onCollide("portal", () => {
    play("portal");
    askQuestion(levelId, coins);
  });

  player.onGround((l) => {
    if (l.is("enemy")) {
      player.jump(JUMP_FORCE * 1.5);
      destroy(l);
      addKaboom(player.pos);
      play("powerup");
    }
  });

  player.onCollide("enemy", (e, col) => {
    // if it's not from the top, die
    if (!col.isBottom()) {
      go("lose");
      play("hit");
    }
  });

  let hasApple = false;

  // Grow an apple if player's head bumps into an obj with "prize" tag
  player.onHeadbutt((obj) => {
    if (obj.is("prize") && !hasApple) {
      const apple = level.spawn("#", obj.tilePos.sub(0, 1));
      apple.jump();
      hasApple = true;
      play("blip");
    }
  });

  // Player grows big onCollide with an "apple" obj
  player.onCollide("apple", (a) => {
    destroy(a);
    // as we defined in the big() component
    player.biggify(3);
    hasApple = false;
    play("powerup");
  });

  let coinPitch = 0;

  onUpdate(() => {
    if (coinPitch > 0) {
      coinPitch = Math.max(0, coinPitch - dt() * 100);
    }
  });

  player.onCollide("coin", (c) => {
    destroy(c);
    play("coin", {
      detune: coinPitch,
    });
    coinPitch += 100;
    coins += 1;
    coinsLabel.text = coins;
  });

  const coinsLabel = add([text(coins), pos(24, 24), fixed()]);

  function jump() {
    // These 2 functions are provided by body() component
    if (player.isGrounded()) {
      player.jump(JUMP_FORCE);
    }
  }

  // Jump with space
  // onKeyPress("space", jump);
  onKeyPress("space", () => {
    if (player.isGrounded()) {
      jump();
      player.play("jump");
    }
  });

  // onKeyDown("left", () => {
  //   player.move(-MOVE_SPEED, 0);
  // });
  onKeyDown("left", () => {
    player.move(-MOVE_SPEED, 0);
    player.flipX = true;
    // .play() will reset to the first frame of the anim, so we want to make sure it only runs when the current animation is not "run"
    if (player.isGrounded() && player.curAnim() !== "run") {
      player.play("run");
    }
  });

  onKeyDown("right", () => {
    player.move(MOVE_SPEED, 0);
    player.flipX = false;
    if (player.isGrounded() && player.curAnim() !== "run") {
      player.play("run");
    }
  });
  ["left", "right"].forEach((key) => {
    onKeyRelease(key, () => {
      // Only reset to "idle" if player is not holding any of these keys
      if (player.isGrounded() && !isKeyDown("left") && !isKeyDown("right")) {
        player.play("idle");
      }
    });
  });
  `
  Anim: ${player.curAnim()}
  Frame: ${player.frame}
  `.trim();

  // onKeyDown("right", () => {
  //   player.move(MOVE_SPEED, 0);
  // });

  onKeyPress("down", () => {
    player.weight = 3;
  });

  onKeyRelease("down", () => {
    player.weight = 1;
  });

  onGamepadButtonPress("south", jump);

  onGamepadStick("left", (v) => {
    player.move(v.x * MOVE_SPEED, 0);
  });

  onKeyPress("f", () => {
    setFullscreen(!isFullscreen());
  });
});

scene("lose", () => {
  add([text("You Lose"), pos(center()), anchor("center")]);
  onKeyPress(() => go("game"));
});

scene("win", () => {
  add([text("You Win"), pos(center()), anchor("center")]);
  onKeyPress(() => go("game"));
});

go("game");
// });
