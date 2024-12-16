"use strict";

class Result {
	#source: TransmuteChain;

	get source() {
		return this.#source;
	}

	get inputPerMinute() {
		return this.#source.chain[0].cost.input * 10;
	}

	get minInput() {
		return this.#source.chain[0].cost.input;
	}

	get ratio(): Relation {
		const factor = this.#source.factor;
		const gcd = this.#gcd(factor.input, factor.output);
		return { input: factor.input / gcd, output: factor.output / gcd };
	}

	get chainItems(): string[] {
		return this.#source.chain.map(v => v.from).concat([this.#source.end]);
	}

	get hasLoop(): boolean {
		return this.chainItems.length != this.chainItems.filter((v, i, a) => a.indexOf(v) === i).length;
	}

	constructor(source: TransmuteChain) {
		this.#source = source;
	}

	getOutputPerMinute(inputPerMinute: number) {
		const ratio = this.ratio;
		return inputPerMinute * ratio.input / ratio.output;
	}

	getInputPerMinute(outputPerMinute: number) {
		const ratio = this.ratio;
		return outputPerMinute / ratio.input * ratio.output;
	}

	#gcd(a: number, b: number): number {
		if (!b) {
			return a;
		}
		return this.#gcd(b, a % b);
	}
}