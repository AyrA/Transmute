"use strict";
/** A single possible step in a transmutation chain */
type TransmuteChainItem = {
	/** Source item */
	from: string;
	/** Target item */
	to: string;
	/** Conversion cost */
	cost: Relation;
}

/** Represents a single complete transmutation chain from one item to another */
type TransmuteChain = {
	/** Start item */
	start: string;
	/** End item */
	end: string;
	/** Chain to convert "start" into "end" */
	chain: TransmuteChainItem[];
	/** Total conversion cost */
	factor: Relation;
}

/** Holds multiple chains for the same item combination */
type TransmuteChains = {
	/** Start item */
	start: string;
	/** End item */
	end: string;
	/** Conversion chains */
	chain: TransmuteChain[];
}

/** Represents a conversion ratio */
type Relation = {
	/** Number of items created in a single conversion step */
	output: number;
	/** Number of items consumed in a single conversion step */
	input: number;
}

/**
 * Provides means to calculate transmutation chains.
 * 
 * Graph theory: This can recursively find all possible paths from one node to another.
 * Unlike most algorithms it can work with unidirectional paths
*/
class Transmute {
	/** Holds all possible transmutation steps */
	#chain: TransmuteChainItem[];

	/**
	 * Gets the final conversion ratio from a chain
	 * @param chain Chain items
	 * @returns Total conversion factor
	 */
	#getFactor(chain: TransmuteChainItem[]): Relation {
		let output = 1;
		let input = 1;
		for (let item of chain) {
			output *= item.cost.output;
			input *= item.cost.input;
		}
		if (input <= 0 || output <= 0) {
			return { output: 1, input: 1 };
		}
		return { output, input };
	}

	/**
	 * Gets the divider factor for a relation
	 * @returns Divider factor
	 */
	#getDivider(rel: Relation): number {
		if (rel.input === 0) {
			throw new Error("Division by zero");
		}
		return rel.output / rel.input;
	}

	/**
	 * Finds all chains from "item" to "target"
	 * @param item Last processed chain item
	 * @param target Final target to reach
	 * @param forbidden Chain sources forbidden to be used
	 * @param found Chains that have already been found
	 */
	#findChain(item: TransmuteChainItem, target: string, forbidden: string[], found: string[][]): void {
		if (item.to === target) {
			found.push(forbidden.concat([target]));
			return;
		}
		const items = this.#chain.filter(v => v.from === item.to && !forbidden.includes(v.to));
		forbidden.push(item.to);
		for (let next of items) {
			this.#findChain(next, target, forbidden, found);
		}
		forbidden.pop();
	}

	/**
	 * Sorts two chain items. This function is for use in Array.prototype.sort()
	 * 
	 * It will sort a better factor above a worse factor.
	 * Identical factors are additionally sorted by chain length to prefer shorter chains
	 * @param a Chain A
	 * @param b Chain B
	 * @returns Sort result
	 */
	#sortResults(a: TransmuteChain, b: TransmuteChain): number {
		const f1 = this.#getDivider(a.factor);
		const f2 = this.#getDivider(b.factor);
		//If factors are identical, prefer the shorter chain
		if (f1 === f2) {
			return a.chain.length - b.chain.length;
		}
		return f1 > f2 ? -1 : 1;
	}

	/**	Get all possible input items */
	get possibleInputs(): string[] {
		return this.#chain.map(v => v.from).filter((v, i, a) => a.indexOf(v) === i).sort();
	}

	/**	Gets all possible output items */
	get possibleOutputs(): string[] {
		return this.#chain.map(v => v.to).filter((v, i, a) => a.indexOf(v) === i).sort();
	}

	/**
	 * Constructs a new instance for the given items
	 * @param chainItems Permitted chain items
	 */
	constructor(chainItems: ArrayLike<TransmuteChainItem>) {
		//Clone the items to prevent changes from the outside
		this.#chain = structuredClone(Array.from(chainItems));
	}

	/**
	 * Finds all possible transmutation chains from all possible inputs to all possible outputs
	 * 
	 * In theory, one can use this function and then never use another function,
	 * because it will contain all chains already
	 * @returns Transmutation chains
	 */
	findPossibleChains(): TransmuteChains[] {
		const ret = [] as TransmuteChains[];
		const i = this.possibleInputs;
		const o = this.possibleOutputs;
		for (let from of i) {
			for (let to of o) {
				const item = { start: from, end: to, chain: [] as TransmuteChain[] };
				try {
					item.chain = this.findAllChains(from, to);
				}
				catch (e) {
					//NOOP
				}
				ret.push(item);
			}
		}
		return ret;
	}

	/**
	 * Find all possible chains from the given source to the given destination sorted from best to worst.
	 * 
	 * This can find loops if "from" and "to" are the same value,
	 * otherwise loops are not permitted
	 * @param from Source item
	 * @param to Target item
	 * @returns Possible chains
	 */
	findAllChains(from: string, to: string): TransmuteChain[] {
		const starts = this.#chain.filter(v => v.from === from);
		if (!starts.length) {
			throw new Error(`Item '${from}' cannot be used as start item`);
		}
		if (this.#chain.findIndex(v => v.to === to) === -1) {
			throw new Error(`Item '${to}' cannot be used as destination item`);
		}
		const ret = [] as TransmuteChain[];
		const chains = [] as string[][];
		for (let item of starts) {
			this.#findChain(item, to, [], chains);
		}

		for (let chain of chains) {
			const items = [] as TransmuteChainItem[];
			chain.unshift(from); //Add initial item
			for (let i = 0; i < chain.length - 1; i++) {
				items.push(this.#chain.find(v => v.from === chain[i] && v.to === chain[i + 1])!);
			}
			ret.push({ start: from, end: to, chain: items, factor: this.#getFactor(items) });
		}

		return ret.sort((a, b) => this.#sortResults(a, b));
	}

	/**
	 * Finds the best chain in regards to conversion ratio from all possible chains
	 * @param from Source item
	 * @param to Target item
	 * @returns Best chain, or null if none found
	 */
	findBestChain(from: string, to: string): TransmuteChain | null {
		const items = this.findAllChains(from, to);
		if (!items.length) {
			return null;
		}
		return items[0];
	}
}