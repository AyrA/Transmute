"use strict";

/**
 * Provides extra values from a transmutation chain to use on the front end
 */
class Result {
	/**	Transmutation chain */
	#source: TransmuteChain;

	/**	Gets a copy of the chain of this instance */
	get source(): TransmuteChain {
		return structuredClone(this.#source);
	}

	/**	Gets the input per minute needed to sustain the first item of the chain at 100% */
	get inputPerMinute(): number {
		return this.#source.chain[0].cost.input * 10;
	}

	/**	Gets the minimum number of items needed to kick off the first step in the chain */
	get minInput(): number {
		return this.#source.chain[0].cost.input;
	}

	/**	Gets the conversion ratio reduced into its simplest form */
	get ratio(): Relation {
		const factor = this.#source.factor;
		const gcd = this.#gcd(factor.input, factor.output);
		return { input: factor.input / gcd, output: factor.output / gcd };
	}

	/** Gets all items of the chain */
	get chainItems(): string[] {
		return this.#source.chain.map(v => v.from).concat([this.#source.end]);
	}

	/** Gets whether this chain has a loop or not */
	get hasLoop(): boolean {
		return this.chainItems.length != this.chainItems.filter((v, i, a) => a.indexOf(v) === i).length;
	}

	/**
	 * Creates a new instance from a chain
	 * @param source Transmutation chain
	 */
	constructor(source: TransmuteChain) {
		this.#source = source;
	}

	/**
	 * Calculates the output rate given an input rate
	 * @param inputPerMinute Items input per minute
	 * @returns Items produced per minute
	 */
	getOutputPerMinute(inputPerMinute: number): number {
		const ratio = this.ratio;
		return inputPerMinute * ratio.input / ratio.output;
	}

	/**
	 * Calculates the input items needed to produce a given number of output items per minute
	 * @param outputPerMinute Items output per minute
	 * @returns Items needed per minute
	 */
	getInputPerMinute(outputPerMinute: number): number {
		const ratio = this.ratio;
		return outputPerMinute / ratio.input * ratio.output;
	}

	/**
	 * Calculates the greatest common divider of two numbers
	 * @param a Number A
	 * @param b Number B
	 * @returns Greatest common divider
	 */
	#gcd(a: number, b: number): number {
		if (!b) {
			return a;
		}
		return this.#gcd(b, a % b);
	}
}