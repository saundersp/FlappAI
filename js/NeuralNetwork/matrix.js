class Matrix {
	constructor(rows, cols) {
		this.rows = rows;
		this.cols = cols;
		this.data = generateArray(this.rows, this.cols);
	}

	copy() {
		const m = new Matrix(this.rows, this.cols);
		for (let i = 0; i < this.rows; i++)
			for (let j = 0; j < this.cols; j++)
				m.data[i][j] = this.data[i][j];
		return m;
	}

	static fromArray(arr) {
		return new Matrix(arr.length, 1).map((_, i) => arr[i]);
	}

	static subtract(a, b) {
		if (a.rows !== b.rows ||
			a.cols !== b.cols)
			throw 'Columns and Rows of A must match Columns and Rows of B.';

		// Return a new Matrix a-b
		return new Matrix(a.rows, a.cols).map((_, i, j) => a.data[i][j] - b.data[i][j]);
	}

	toArray() {
		return Array(this.rows).fill(0)
			.map((_, i) => Array(this.cols).fill(0)
				.map((_, j) => this.data[i][j]));
	}

	randomize() {
		return this.map(_ => Math.random() * 2 - 1);
	}

	add(n) {
		if (n instanceof Matrix) {
			if (this.rows !== n.rows ||
				this.cols !== n.cols)
				throw 'Columns and Rows of A must match Columns and Rows of B.';

			return this.map((e, i, j) => e + n.data[i][j]);
		} else
			return this.map(e => e + n);
	}

	static transpose(matrix) {
		return new Matrix(matrix.cols, matrix.rows)
			.map((_, i, j) => matrix.data[j][i]);
	}

	static multiply(a, b) {
		// Matrix product
		if (a.cols !== b.rows)
			throw 'Columns of A must match rows of B.';

		return new Matrix(a.rows, b.cols)
			.map((_, i, j) => {
				// Dot product of values in col
				let sum = 0;
				for (let k = 0; k < a.cols; k++)
					sum += a.data[i][k] * b.data[k][j];
				return sum;
			});
	}

	multiply(n) {
		if (n instanceof Matrix) {
			if (this.rows !== n.rows ||
				this.cols !== n.cols)
				throw ('Columns and Rows of A must match Columns and Rows of B.');

			// hadamard product
			return this.map((e, i, j) => e * n.data[i][j]);
		} else
			// Scalar product
			return this.map(e => e * n);
	}

	map(func) {
		// Apply a function to every element of matrix
		this.data = this.data.map((y, i) =>
			y.map((val, j) =>
				func(val, i, j)));
		return this;
	}

	static map(matrix, func) {
		// Apply a function to every element of matrix
		return new Matrix(matrix.rows, matrix.cols)
			.map((_, i, j) => func(matrix.data[i][j], i, j));
	}

	print() {
		console.table(this.data);
		return this;
	}

	serialize() {
		return JSON.stringify(this);
	}

	static deserialize(data) {
		if (typeof data === 'string')
			data = JSON.parse(data);

		const matrix = new Matrix(data.rows, data.cols);
		matrix.data = data.data;
		return matrix;
	}
}