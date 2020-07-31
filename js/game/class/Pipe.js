class Pipe extends Rectangle {
	constructor(x, height) {
		super(x, 0, pipe_width, 0, '#00EE00');
		this.globalHeight = height;
		this.bottomPipe = new Rectangle(x, 0, pipe_width, height - space, '#008800');
		this.barrier = new Rectangle(x + pipe_width - 1, 0, 1, space, 'red');
		this.barrier.broke = false;
		this.renew();
		this.speedX = pipe_speed;
	}

	draw(ctx, fast_graphics) {
		super.draw(ctx);
		this.bottomPipe.draw(ctx);
		if (fast_graphics)
			if (!this.barrier.broke)
				this.barrier.draw(ctx);
	}

	move(delta) {
		const sx = calcSpeedFromDelta(delta, this.speedX);
		this.x -= sx;
		this.barrier.x -= sx;
		this.bottomPipe.x -= sx;
	}

	renew() {
		this.h = random(space, this.globalHeight - space * offset);
		this.barrier.y = this.h;
		this.bottomPipe.y = this.h + space;
	}

	reset(width) {
		this.x = width;
		this.barrier.x = width + this.w - 1;
		this.barrier.broke = false;
		this.bottomPipe.x = width;
	}
}