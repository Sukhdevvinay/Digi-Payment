class Punch {
  constructor({ ownerId, x, y, width, height, damage, direction }) {
    this.ownerId = ownerId;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.damage = damage;
    this.direction = direction;
    this.active = true;
    this.life = 0.12;
    this.hit = false;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    this.x += this.direction * 150 * dt;
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.fillStyle = '#ffc857';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
