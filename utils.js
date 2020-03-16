const do_Times = n => f => {
	let iter = i => {
		if (i === n) return;
		f(i);
		iter(i + 1);
	};
	return iter(0);
};

class Vector2D {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	get length() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}
	get angle() {
		return Math.atan2(this.y, this.x);
	}
	get unit() {
		return this.times(1 / this.length);
	}
	set(x, y) {
		this.x = x;
		this.y = y;
	}
	set length(nv) {
		const tempV = this.unit.times(nv);
		this.set(tempV.x, tempV.y);
	}
	move(v) {
		return new Vector2D(this.x + v.x, this.y + v.y);
	}
	add(v) {
		return new Vector2D(this.x + v.x, this.y + v.y);
	}
	sub(v) {
		return new Vector2D(this.x - v.x, this.y - v.y);
	}
	times(s) {
		return new Vector2D(this.x * s, this.y * s);
	}
	clone() {
		return new Vector2D(this.x, this.y);
	}
	toString() {
		return `(${this.x},${this.y})`;
	}
	isEqual(v) {
		return this.x === v.x && this.y === v.y;
	}
}

/**
 * @param {Array} items
 * @param {Array} itemWeights
 * @return {item of Array} 依據各別權重，隨機選出陣列中的物件
 */
function weightedRandom(items, itemWeights) {
	const totalWeight = itemWeights.reduce((acc, currVal) => acc + currVal, 0);
	const randomArray = [];

	for (let i = 0; i < items.length; i++) {
		for (let j = 0; j < itemWeights[i]; j++) {
			randomArray.push(i);
		}
	}

	const randomNumber = Math.floor(Math.random() * totalWeight);
	return items[randomArray[randomNumber]];
}

/**
 * @param {Array} items
 * @return {Array} 洗牌過後的陣列
 */
function shuffleArray(arr){
	for(let i = arr.length - 1; i > 0; i--){
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export {
	do_Times,
	Vector2D,
	weightedRandom,
	shuffleArray
};