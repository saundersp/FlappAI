class Bird extends Rectangle {
	constructor(img) {
		super(100, 300, 40, 30, 'rgba(0, 100, 100, 0.5)');
		this.vY = 0;
		this.dead = false;
		this.score = 0;
		if (img)
			this.img = img;
	}

	move(delta, pipes) {
		this.vY += calcSpeedFromDelta(delta, gravity);
		this.vY = constrain(this.vY, -10, 50);
		this.y += this.vY;

		if (collisionBird(this))
			this.dead = true;
		else {
			pipes.some(p => {
				if (!p.barrier.broke)
					if (collision(this, p.barrier)) {
						p.barrier.broke = true;
						this.score++;
						return true;
					}
				return false;
			});
		}
	}

	flap(delta) {
		this.vY = -calcSpeedFromDelta(delta, speedY);
	}

	draw(ctx) {
		ctx.save();
		ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
		ctx.rotate(constrain(this.vY, -45 * Math.PI / 180, 30 * Math.PI / 180));
		ctx.translate(-this.w / 2, -this.h / 2);
		if (this.img)
			ctx.drawImage(this.img, 0, 0, this.w, this.h);
		else {
			ctx.fillStyle = this.c;
			ctx.fillRect(0, 0, this.w, this.h);
		}
		ctx.restore();
	}
}