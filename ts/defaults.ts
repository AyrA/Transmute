"use strict";
/** Holds transmute chains */
namespace Defaults {
	/** Returns a new copy of the default satisfactory transmutation chain items */
	export function transmuteChains(): TransmuteChainItem[] {
		return [
			{ from: "Limestone", to: "Iron", cost: { output: 12, input: 24 } },
			{ from: "Limestone", to: "Coal", cost: { output: 12, input: 36 } },
			{ from: "Iron", to: "Coal", cost: { output: 12, input: 18 } },
			{ from: "Iron", to: "Sulfur", cost: { output: 12, input: 30 } },
			{ from: "Copper", to: "Caterium", cost: { output: 12, input: 15 } },
			{ from: "Copper", to: "Bauxite", cost: { output: 12, input: 18 } },
			{ from: "Sulfur", to: "Copper", cost: { output: 12, input: 12 } },
			{ from: "Sulfur", to: "Limestone", cost: { output: 12, input: 2 } },
			{ from: "Coal", to: "Sulfur", cost: { output: 12, input: 20 } },
			{ from: "Coal", to: "Quartz", cost: { output: 12, input: 24 } },
			{ from: "Quartz", to: "Copper", cost: { output: 10, input: 12 } },
			{ from: "Quartz", to: "Caterium", cost: { output: 12, input: 12 } },
			{ from: "Caterium", to: "Bauxite", cost: { output: 12, input: 15 } },
			{ from: "Caterium", to: "Nitrogen", cost: { output: 12, input: 12 } },
			{ from: "Bauxite", to: "Quartz", cost: { output: 12, input: 10 } },
			{ from: "Bauxite", to: "Nitrogen", cost: { output: 12, input: 10 } },
			{ from: "Bauxite", to: "Uranium", cost: { output: 12, input: 48 } }
		];
	}
}