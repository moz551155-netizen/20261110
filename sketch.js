const FRAME_COUNT = 12;
const FRAME_GAP = 5;
const REFERENCE_SIZE = 280;

let sceneBackground;
let characterOne;
let characterTwo;
let characterOneWalk;
let characterTwoWalk;
let characterOneJump;
let characterTwoJump;
let characterOneAttack;
let characterTwoAttack;
let characterOneMotion;
let characterTwoMotion;

function preload() {
  sceneBackground = loadImage('background/Backgrounds.png');
  characterOne = loadImage('1/stand/51x106.png');
  characterTwo = loadImage('2/stand/36x102.png');
  characterOneWalk = loadImage('1/walk/61x104.png');
  characterTwoWalk = loadImage('2/walk/59x102.png');
  characterOneJump = loadImage('1/jump/84x88.png');
  characterTwoJump = loadImage('2/jump/96x119.png');
  characterOneAttack = loadImage('1/attack/88x105.png');
  characterTwoAttack = loadImage('2/attack1/93x102.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CORNER);
  frameRate(12);
  characterOneMotion = createCharacterMotion((width * 2) / 3);
  characterTwoMotion = createCharacterMotion(width / 3);
}

function draw() {
  drawBackground();

  const scaleFactor = min(width, height) / REFERENCE_SIZE;
  const frameIndex = frameCount % FRAME_COUNT;

  updateCharacterMotion(
    characterOneMotion,
    keyIsDown(LEFT_ARROW),
    keyIsDown(RIGHT_ARROW),
    61,
    scaleFactor
  );
  updateCharacterJump(characterOneMotion, scaleFactor);
  updateCharacterJump(characterTwoMotion, scaleFactor);
  updateCharacterAttack(characterOneMotion);
  updateCharacterAttack(characterTwoMotion);
  updateCharacterMotion(
    characterTwoMotion,
    keyIsDown(65),
    keyIsDown(68),
    59,
    scaleFactor
  );

  const characterOneFrameWidth = characterOneMotion.walking ? 61 : 51;
  const characterOneFrameHeight = characterOneMotion.walking ? 104 : 106;
  const characterTwoFrameWidth = characterTwoMotion.walking ? 59 : 36;
  const characterTwoFrameHeight = 102;
  const characterOneAttacking = characterOneMotion.attacking;
  const characterTwoAttacking = characterTwoMotion.attacking;
  const characterOneJumping = characterOneMotion.jumping;
  const characterTwoJumping = characterTwoMotion.jumping;

  drawCharacter(
    characterTwoAttacking
      ? characterTwoAttack
      : characterTwoJumping
        ? characterTwoJump
        : characterTwoMotion.walking
          ? characterTwoWalk
          : characterTwo,
    characterTwoAttacking ? 93 : characterTwoJumping ? 96 : characterTwoFrameWidth,
    characterTwoAttacking ? 102 : characterTwoJumping ? 119 : characterTwoFrameHeight,
    characterTwoMotion.x,
    scaleFactor,
    characterTwoAttacking
      ? characterTwoMotion.attackFrameIndex
      : characterTwoJumping
        ? characterTwoMotion.jumpFrameIndex
        : frameIndex,
    characterTwoMotion.facing,
    characterTwoJumping && !characterTwoAttacking ? characterTwoMotion.jumpOffset : 0
  );
  drawCharacter(
    characterOneAttacking
      ? characterOneAttack
      : characterOneJumping
        ? characterOneJump
        : characterOneMotion.walking
          ? characterOneWalk
          : characterOne,
    characterOneAttacking ? 88 : characterOneJumping ? 84 : characterOneFrameWidth,
    characterOneAttacking ? 105 : characterOneJumping ? 88 : characterOneFrameHeight,
    characterOneMotion.x,
    scaleFactor,
    characterOneAttacking
      ? characterOneMotion.attackFrameIndex
      : characterOneJumping
        ? characterOneMotion.jumpFrameIndex
        : frameIndex,
    characterOneMotion.facing,
    characterOneJumping && !characterOneAttacking ? characterOneMotion.jumpOffset : 0
  );
}

function keyPressed() {
  if (keyCode === 32) {
    startCharacterAttack(characterTwoMotion, 16);
    return false;
  }

  if (keyCode === UP_ARROW && !characterOneMotion.jumping) {
    startCharacterJump(characterOneMotion, 19, 19, 1.2);
    return false;
  }

  if ((key === 'w' || key === 'W') && !characterTwoMotion.jumping) {
    startCharacterJump(characterTwoMotion, 19, 29, 1.2);
    return false;
  }

  if (
    keyCode === LEFT_ARROW ||
    keyCode === RIGHT_ARROW ||
    key === 'a' ||
    key === 'A' ||
    key === 'd' ||
    key === 'D'
  ) {
    return false;
  }
}

function mousePressed() {
  if (mouseButton === LEFT) {
    startCharacterAttack(characterOneMotion, 19);
    return false;
  }
}

function startCharacterAttack(motion, spriteFrameCount) {
  if (motion.attacking) {
    return;
  }

  motion.attacking = true;
  motion.attackFrame = 0;
  motion.attackFrameIndex = 0;
  motion.attackFrameCount = spriteFrameCount;
}

function updateCharacterAttack(motion) {
  if (!motion.attacking) {
    return;
  }

  if (motion.attackFrame >= motion.attackFrameCount) {
    motion.attacking = false;
    return;
  }

  motion.attackFrameIndex = motion.attackFrame;
  motion.attackFrame += 1;
}

function createCharacterMotion(x) {
  return {
    x,
    facing: 1,
    walking: false,
    jumping: false,
    jumpFrame: 0,
    jumpFrameIndex: 0,
    jumpFrameCount: 0,
    jumpSpriteFrameCount: 0,
    jumpHeight: 0,
    jumpOffset: 0,
    attacking: false,
    attackFrame: 0,
    attackFrameIndex: 0,
    attackFrameCount: 0
  };
}

function startCharacterJump(motion, frameCount, spriteFrameCount, heightMultiplier) {
  motion.jumping = true;
  motion.jumpFrame = 0;
  motion.jumpFrameCount = frameCount;
  motion.jumpSpriteFrameCount = spriteFrameCount;
  motion.jumpHeight = 88 * heightMultiplier;
}

function updateCharacterJump(motion, scaleFactor) {
  if (!motion.jumping) {
    motion.jumpOffset = 0;
    return;
  }

  if (motion.jumpFrame >= motion.jumpFrameCount) {
    motion.jumping = false;
    motion.jumpOffset = 0;
    return;
  }

  const progress = motion.jumpFrame / (motion.jumpFrameCount - 1);
  motion.jumpFrameIndex = round(
    progress * (motion.jumpSpriteFrameCount - 1)
  );
  motion.jumpOffset = sin(progress * PI) * motion.jumpHeight * scaleFactor;
  motion.jumpFrame += 1;
}

function updateCharacterMotion(motion, leftPressed, rightPressed, frameWidth, scaleFactor) {
  const direction = leftPressed === rightPressed ? 0 : rightPressed ? 1 : -1;

  if (direction !== 0) {
    motion.facing = direction;
  }

  const halfWidth = (frameWidth * scaleFactor) / 2;
  const nextX = constrain(
    motion.x + direction * 5 * scaleFactor,
    halfWidth,
    width - halfWidth
  );
  motion.walking = direction !== 0 && nextX !== motion.x;
  motion.x = nextX;
}

function drawBackground() {
  const scaleFactor = max(
    width / sceneBackground.width,
    height / sceneBackground.height
  );
  const backgroundWidth = sceneBackground.width * scaleFactor;
  const backgroundHeight = sceneBackground.height * scaleFactor;

  image(
    sceneBackground,
    (width - backgroundWidth) / 2,
    (height - backgroundHeight) / 2,
    backgroundWidth,
    backgroundHeight
  );
}

function drawCharacter(spriteSheet, frameWidth, frameHeight, centerX, scaleFactor, frameIndex, facing, verticalOffset) {
  const displayWidth = frameWidth * scaleFactor;
  const displayHeight = frameHeight * scaleFactor;
  const sourceX = frameIndex * (frameWidth + FRAME_GAP);

  push();
  translate(centerX, height - displayHeight - verticalOffset);
  scale(facing, 1);
  image(
    spriteSheet,
    -displayWidth / 2,
    0,
    displayWidth,
    displayHeight,
    sourceX,
    0,
    frameWidth,
    frameHeight
  );
  pop();
}

function windowResized() {
  if (characterOneMotion && characterTwoMotion && width > 0) {
    const widthRatio = windowWidth / width;
    characterOneMotion.x *= widthRatio;
    characterTwoMotion.x *= widthRatio;
  }
  resizeCanvas(windowWidth, windowHeight);
}
