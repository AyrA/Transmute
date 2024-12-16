"use strict";
type TransmuteChainItem = {
	from: string;
	to: string;
	cost: Relation;
}

type TransmuteChain = {
	start: string;
	end: string;
	chain: TransmuteChainItem[];
	factor: Relation;
}

type TransmuteChains = {
	start: string;
	end: string;
	chain: TransmuteChain[];
}

type Relation = { output: number, input: number }

class Transmute {
	#chain: TransmuteChainItem[];

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

	#getDivider(rel: Relation) {
		return rel.output / rel.input;
	}

	#findChain(item: TransmuteChainItem, target: string, forbidden: string[], found: string[][]) {
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

	#sortResults(a: TransmuteChain, b: TransmuteChain): number {
		const f1 = this.#getDivider(a.factor);
		const f2 = this.#getDivider(b.factor);
		//If factors are identical, prefer the shorter chain
		if (f1 === f2) {
			return a.chain.length - b.chain.length;
		}
		return f1 > f2 ? -1 : 1;
	}

	get possibleInputs() {
		return this.#chain.map(v => v.from).filter((v, i, a) => a.indexOf(v) === i).sort();
	}

	get possibleOutputs() {
		return this.#chain.map(v => v.to).filter((v, i, a) => a.indexOf(v) === i).sort();
	}

	constructor(chainItems: ArrayLike<TransmuteChainItem>) {
		this.#chain = structuredClone(Array.from(chainItems));
	}

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

	findBestChain(from: string, to: string): TransmuteChain | null {
		const items = this.findAllChains(from, to);
		if (!items.length) {
			return null;
		}
		let best = items.shift()!;
		let bestFactor = this.#getDivider(this.#getFactor(best.chain));

		while (items.length) {
			const current = items.shift()!;
			const currentFactor = this.#getDivider(this.#getFactor(current.chain));
			if (currentFactor > bestFactor) {
				best = current;
				bestFactor = currentFactor;
			}
		}
		return best;
	}
}

/*

declare var process: NodeProc;
type NodeProc = { argv: string[] };

if (process.argv.length === 4) {
	const from = process.argv[2];
	const to = process.argv[3];
	const tm = new Transmute(Defaults.transmuteChains());
	const all = tm.findAllChains(process.argv[2], process.argv[3]);
	const best = tm.findBestChain(process.argv[2], process.argv[3]);

	console.log(`Possible inputs: ${tm.possibleInputs}`);
	console.log(`Possible outputs: ${tm.possibleOutputs}`);

	console.log("=== Best result ===");
	if (best) {
		const bestResult = new Result(best);
		console.log(best);
		console.log(`Turns ${bestResult.ratio.input} ${from} into ${bestResult.ratio.output} ${to} (Factor: ${Math.round(bestResult.ratio.output / bestResult.ratio.input * 1000) / 1000})`);
		console.log(`Input rate: ${bestResult.inputPerMinute}/min`);
	}
	else {
		console.log(`There is no path from ${from} to ${to}`);
	}
	console.log("=== All results (ordered best to worst) ===");
	if (all.length) {
		for (let result of all) {
			const bestResult = new Result(result);
			console.log(`Turns ${bestResult.ratio.input} ${from} into ${bestResult.ratio.output} ${to} (Factor: ${Math.round(bestResult.ratio.output / bestResult.ratio.input * 1000) / 1000})`);
		}
	}
	else {
		console.log(`There is no path from ${from} to ${to}`);
	}
}
else {
	console.log("node transmute.js <from> <to>");
}
//*/

/*
flowchart LR
	Limestone --[24:12]--> Iron
	Sulfur --[12:12]--> Copper
	Quartz --[12:10]--> Copper
	Sulfur --[2:12]--> Limestone
	Limestone --[36:12]--> Coal
	Iron --[18:12]--> Coal
	Iron --[30:12]--> Sulfur
	Coal --[20:12]--> Sulfur
	Copper --[15:12]--> Caterium
	Quartz --[12:12]--> Caterium
	Coal --[24:12]--> Quartz
	Bauxite --[10:12]--> Quartz
	Copper --[18:12]--> Bauxite
	Caterium --[15:12]--> Bauxite
	Caterium --[12:12]--> Nitrogen
	Bauxite --[10:12]--> Nitrogen
	Bauxite --[48:12]--> Uranium
*/