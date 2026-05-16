export class Particle {
  constructor(type, cw, ch) {
    this.type = type;
    this.cw = cw;
    this.ch = ch;
    this.reset(true);
  }

  reset(initial = false) {
    this.tick = Math.random() * 100;
    if (this.type === 'dust') {
      this.x = Math.random() * this.cw;
      this.y = initial ? Math.random() * this.ch : this.ch + 10;
      this.vx = 0.2 + Math.random() * 0.8;
      this.vy = -0.1 - Math.random() * 0.4;
      this.size = Math.random() * 2.5 + 0.5;
      this.alpha = Math.random() * 0.3 + 0.05;
    } else if (this.type === 'ember') {
      this.x = 1150 + Math.random() * 100;
      this.y = 650 + Math.random() * 50;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = -1 - Math.random() * 3;
      this.size = Math.random() * 3 + 1.5;
      this.alpha = 1;
      this.life = 1;
      this.decay = Math.random() * 0.015 + 0.01;
    } else if (this.type === 'kettleSteam') {
      this.x = 1200 + (Math.random() - 0.5) * 20;
      this.y = 620;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = -0.5 - Math.random() * 1.5;
      this.size = Math.random() * 15 + 10;
      this.alpha = 0.15;
      this.life = 1;
      this.decay = Math.random() * 0.01 + 0.005;
    } else if (this.type === 'poolSteam') {
      this.x = 1100 + Math.random() * 300;
      this.y = 750 + Math.random() * 50;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = -0.3 - Math.random() * 1;
      this.size = Math.random() * 25 + 15;
      this.alpha = 0.1;
      this.life = 1;
      this.decay = Math.random() * 0.008 + 0.004;
    } else if (this.type === 'water') {
      this.x = 1495 + Math.random() * 10;
      this.y = 615;
      this.vx = 0;
      this.vy = 6 + Math.random() * 4;
      this.size = Math.random() * 1.5 + 0.5;
      this.length = Math.random() * 15 + 5;
    }
  }

  update() {
    this.tick += 0.05;
    this.x += this.vx;
    if (this.type === 'dust') {
      this.y += this.vy + Math.sin(this.tick) * 0.3;
      if (this.x > this.cw || this.y < -10) this.reset();
    } else if (this.type === 'ember' || this.type === 'kettleSteam' || this.type === 'poolSteam') {
      this.y += this.vy;
      this.life -= this.decay;
      if (this.life <= 0) this.reset();
    } else if (this.type === 'water') {
      this.y += this.vy;
      if (this.y > 780 + (Math.random() * 20)) this.reset();
    }
  }

  draw(ctx) {
    if (this.type === 'dust') {
      ctx.fillStyle = `rgba(251, 191, 36, ${this.alpha})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    } else if (this.type === 'ember') {
      ctx.fillStyle = `rgba(249, 115, 22, ${this.alpha * this.life})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    } else if (this.type === 'kettleSteam' || this.type === 'poolSteam') {
      ctx.fillStyle = `rgba(224, 231, 255, ${this.alpha * this.life})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    } else if (this.type === 'water') {
      ctx.fillStyle = `rgba(165, 243, 252, 0.5)`;
      ctx.fillRect(this.x, this.y, this.size, this.length);
    }
  }
}
