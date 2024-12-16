"use strict";

/**
 * Provides diagram functionality
 */
namespace Diagram {
	let counter = 0;
	/**
	 * Converts the supplied items into a mermaid flowchart code
	 * 
	 * **Names must be compatible with unquoted mermaid syntax. No escaping will be performed**
	 * @param items Transmute chain items
	 * @returns Flowchart code without header
	 */
	function getFlowchart(items: ArrayLike<TransmuteChainItem>): string {
		return Array.from(items).map(v => `${v.from} --[${v.cost.input}:${v.cost.output}]--> ${v.to}`).join("\r\n");
	}

	/**
	 * Creates a mermaid flowchart from the given transmuter chain items
	 * @param orientation Diagram orientation, either top down or left to right
	 * @param items Diagram items
	 * @returns Diagram SVG string
	 */
	export async function getDiagram(orientation: "TD" | "LR", items: ArrayLike<TransmuteChainItem>): Promise<string> {
		const result = await mermaid.render(`diag${++counter}`, `flowchart ${orientation}\r\n${getFlowchart(items)}`);
		return result.svg;
	}
}