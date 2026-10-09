class Boxer {
  constructor({ id, name, x, color, controls, width = 64, height = 110 }) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = 250;
    this.width = width;
    this.height = height;
    this.color = color;
    this.controls = controls;

    this.health = 100;
    this.energy = 100;
    this.speed = 5;
    this.direction = 1;
    this.isPunching = false;
    this.isDefending = false;
    this.punchTimer = 0;
    this.defendTimer = 0;
  }

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  move(direction) {
    this.direction = direction >= 0 ? 1 : -1;
    this.x = this.clamp(this.x + direction * this.speed, 40, 800 - this.width - 40);
  }

  punch() {
    if (this.energy < 10 || this.isPunching) {
      return null;
    }

    this.energy = Math.max(0, this.energy - 10);
    this.isPunching = true;
    this.punchTimer = 0.18;

    return new Punch({
      ownerId: this.id,
      x: this.x + (this.direction > 0 ? this.width : -30),
      y: this.y + 22,
      width: 32,
      height: 20,
      damage: 12,
      direction: this.direction,
    });
  }

  defend() {
    if (this.isDefending) {
      return;
    }

    this.isDefending = true;
    this.defendTimer = 0.45;
  }

  takeDamage(amount) {
    if (this.isDefending) {
      amount *= 0.45;
    }

    this.health = this.clamp(this.health - amount, 0, 100);
  }

  update(dt) {
    if (this.isPunching) {
      this.punchTimer -= dt;
      if (this.punchTimer <= 0) {
        this.isPunching = false;
      }
    }

    if (this.isDefending) {
      this.defendTimer -= dt;
      if (this.defendTimer <= 0) {
        this.isDefending = false;
      }
    }

    this.energy = this.clamp(this.energy + dt * 8, 0, 100);
  }

  draw(ctx) {
    const bodyColor = this.color;
    const bodyX = this.x;
    const bodyY = this.y;

    ctx.fillStyle = '#111';
    ctx.fillRect(bodyX - 6, bodyY + 20, this.width + 12, this.height - 20);

    ctx.fillStyle = bodyColor;
    ctx.fillRect(bodyX, bodyY, this.width, this.height);

    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(bodyX + 10, bodyY + 14, 16, 16);
    ctx.fillRect(bodyX + this.width - 26, bodyY + 14, 16, 16);

    ctx.fillStyle = '#000';
    ctx.fillRect(bodyX + 12, bodyY + 18, 10, 8);
    ctx.fillRect(bodyX + this.width - 22, bodyY + 18, 10, 8);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bodyX + this.width / 2, bodyY + this.height);
    ctx.lineTo(bodyX + this.width / 2 + this.direction * 18, bodyY + this.height + 26);
    ctx.stroke();

    if (this.isDefending) {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 4;
      ctx.strokeRect(bodyX - 6, bodyY - 6, this.width + 12, this.height + 12);
    }
  }
}
