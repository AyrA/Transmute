"use strict";

declare var mermaid: Mermaid;

type Mermaid = {
	initialize: (initParam?: any) => Promise<void>;
	render: (id: string, text: string) => Promise<{ svg: string, bindFunctions: unknown }>;
};

document.addEventListener("DOMContentLoaded", async function () {
	/** Arrow between array items when joined */
	const arrow = " \u21A3 ";
	/** Checkmark */
	const yes = "\u2705";
	/** Cross */
	const no = "\u274C";

	const transmuter = new Transmute(Defaults.transmuteChains());
	const allChains = transmuter.findPossibleChains();

	/**
	 * Shows which target values are possible for a given input
	 * @param sourceBox Source item select box
	 * @param filterBox Target item select box
	 */
	function filterValues(sourceBox: HTMLSelectElement, filterBox: HTMLSelectElement) {
		const chains = allChains.filter(v => v.start === sourceBox.value && v.chain.length > 0);
		const optFilter = filterBox.querySelectorAll("option");
		const optSource = sourceBox.querySelectorAll("option");

		for (let item of optFilter) {
			const has = chains.find(v => v.end === item.value);
			console.log(has);
			item.textContent = `${has ? yes : no} ${item.value}`;
		}

		//Clear source box info
		for (let item of optSource) {
			item.textContent = item.value;
		}
	}

	/**
	 * Renders the selected transmutation chain
	 */
	function renderConversion() {
		const selFrom = document.querySelector("#selInput") as HTMLSelectElement;
		const selTo = document.querySelector("#selOutput") as HTMLSelectElement;
		const tblChains = document.querySelector("#tblChains tbody") as HTMLTableSectionElement;
		const permitLoops = selFrom.value === selTo.value;
		tblChains.innerHTML = "";
		try {
			const chains = transmuter.findAllChains(selFrom.value, selTo.value);
			if (chains.length === 0) {
				throw new Error(`${selFrom.value} can't be turned into ${selTo.value}`);
			}
			for (let chain of chains) {
				const result = new Result(chain);
				if (permitLoops || !result.hasLoop) {
					const row = tblChains.appendChild(document.createElement("tr"));
					row.appendChild(document.createElement("td")).textContent = result.chainItems.join(arrow);
					row.appendChild(document.createElement("td")).textContent = `${result.ratio.input}:${result.ratio.output}`;
				}
			}
		}
		catch (e) {
			if (e instanceof Error) {
				e = e.message;
			}
			const row = tblChains.appendChild(document.createElement("tr"));
			const cell = row.appendChild(document.createElement("td"));
			cell.textContent = String(e);
			cell.colSpan = 2;
			cell.classList.add("text-danger");
		}
	}

	//Single conversion
	const selFrom = document.querySelector("#selInput") as HTMLSelectElement;
	const selTo = document.querySelector("#selOutput") as HTMLSelectElement;
	for (let input of transmuter.possibleInputs) {
		const opt = selFrom.appendChild(document.createElement("option"));
		opt.value = opt.textContent = input;
	}
	for (let output of transmuter.possibleOutputs) {
		const opt = selTo.appendChild(document.createElement("option"));
		opt.value = opt.textContent = output;
	}
	selFrom.value = "Iron";
	selTo.value = "Copper";

	selFrom.addEventListener("change", () => { filterValues(selFrom, selTo); renderConversion(); });
	selTo.addEventListener("change", () => { filterValues(selFrom, selTo); renderConversion(); });
	filterValues(selFrom, selTo);
	renderConversion();


	//Feedback loops
	const tblBody = document.querySelector("#posFeedback tbody") as HTMLTableSectionElement;
	const loopChains = allChains.filter(v => v.start === v.end);
	for (let loop of loopChains) {
		if (loop.chain.length) {
			const chain = loop.chain[0];
			const r = new Result(chain);
			const row = tblBody.appendChild(document.createElement("tr"));
			row.appendChild(document.createElement("td")).textContent = loop.start;
			row.appendChild(document.createElement("td")).textContent = r.chainItems.join(arrow);
			row.appendChild(document.createElement("td")).textContent = `${r.ratio.input}:${r.ratio.output}`;
			if (r.ratio.input < r.ratio.output) {
				for (let cell of row.querySelectorAll("td")) {
					cell.classList.add("text-success");
				}
			}
			else {
				for (let cell of row.querySelectorAll("td")) {
					cell.classList.add("text-danger");
				}
			}
		}
	}

	//mermaid
	await mermaid.initialize({ startOnLoad: false });
	document.getElementById("diagH")!.innerHTML = await Diagram.getDiagram("LR", Defaults.transmuteChains());
	document.getElementById("diagV")!.innerHTML = await Diagram.getDiagram("TD", Defaults.transmuteChains());
});