import {
	arrayRemove,
	arrayUnion,
	collection,
	deleteField,
	doc,
	writeBatch
} from "firebase/firestore";
import { getMetadata, ref } from "firebase/storage";
import { produce } from "immer";
import { firestore, storage } from "../App";
import { ANONYMOUS, SHARED } from "../utils/checklist-types";
import { foundersItems, SCHEMA_VERSION } from "../utils/items";
import {
	intrinsicsToXP,
	junctionsToXP,
	totalRailjackIntrinsics,
	totalDrifterIntrinsics,
	xpFromItem,
	xpToMR
} from "../utils/mastery-rank";
import { flattenedNodes, planetsWithJunctions } from "../utils/nodes";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

export const useStore = createWithEqualityFn(
	(set, get) => ({
		type: undefined,
		setType: type => set({ type }),
		id: undefined,
		setId: id => set({ id }),
		reset: () => set({ unsavedChanges: [] }),

		unsavedChanges: [],
		saveImmediate: () => {
			const { type, id, unsavedChanges } = get();
			if (type !== SHARED && unsavedChanges.length > 0) {
				const docRef = doc(
					collection(
						firestore,
						type === ANONYMOUS
							? "anonymousMasteryData"
							: "masteryData"
					),
					id
				);
				const batch = writeBatch(firestore);

				batch.set(
					docRef,
					unsavedChanges
						.filter(change => change.type === "field")
						.reduce((changes, change) => {
							changes[change.id] = change.new;
							return changes;
						}, {}),
					{ merge: true }
				);
				Object.entries({
					itemsMastered: "mastered",
					starChart: "starChart",
					starChartJunctions: "starChartJunctions",
					steelPath: "steelPath",
					steelPathJunctions: "steelPathJunctions"
				}).forEach(([changeType, field]) => {
					batch.set(
						docRef,
						{
							[field]: arrayUnion(
								...unsavedChanges
									.filter(
										change =>
											change.type === changeType &&
											change.mastered
									)
									.map(change => change.id)
							)
						},
						{ merge: true }
					);
					batch.set(
						docRef,
						{
							[field]: arrayRemove(
								...unsavedChanges
									.filter(
										change =>
											change.type === changeType &&
											!change.mastered
									)
									.map(change => change.id)
							)
						},
						{ merge: true }
					);
				});
				batch.update(
					docRef,
					unsavedChanges
						.filter(
							change => change.type === "partiallyMasteredItems"
						)
						.reduce((data, change) => {
							data["partiallyMastered." + change.id] =
								change.new ?? deleteField();
							return data;
						}, {}),
					{ merge: true }
				);

				batch.commit();

				set({ unsavedChanges: [] });
			}
		},
		saveTimeoutId: undefined,
		save: () => {
			set(state => {
				if (state.saveTimeout) clearTimeout(state.saveTimeout);
				return {
					saveTimeout: setTimeout(() => state.saveImmediate(), 2500)
				};
			});
		},

		items: {},
		recipes: {},
		ingredientIds: {},
		flattenedItems: {},
		setData: ({ items, recipes, ingredient_ids: ingredientIds }) => {
			set({
				items,
				recipes,
				ingredientIds,
				flattenedItems: Object.entries(items).reduce(
					(flattenedItems, [category, categoryItems]) => {
						Object.entries(categoryItems).reduce(
							(flattenedItems, [name, item]) => {
								flattenedItems[name] = produce(
									item,
									draftItem => {
										draftItem.type = category;
									}
								);
								return flattenedItems;
							},
							flattenedItems
						);
						return flattenedItems;
					},
					{}
				)
			});
			get().recalculateMasteryRank();
			get().recalculateIngredients();
		},
		fetchData: async () => {
			let cached = false;
			if (localStorage.getItem("items")) {
				const cachedData = JSON.parse(localStorage.getItem("items"));
				if (cachedData.schema_version === SCHEMA_VERSION) {
					get().setData(cachedData);
					cached = true;
				}
			}

			const { updated } = await getMetadata(ref(storage, "items.json"));
			if (
				!cached ||
				localStorage.getItem("items-updated-at") !== updated
			) {
				const data = await (
					await fetch(
						"https://firebasestorage.googleapis.com/v0/b/framehub-f9cfb.appspot.com/o/items.json?alt=media"
					)
				).json();
				localStorage.setItem("items", JSON.stringify(data));
				localStorage.setItem("items-updated-at", updated);
				get().setData(data);
			}
		},

		masteryRank: 0,
		masteryBreakdown: {},
		xp: 0,
		itemsMasteredCount: 0,
		totalXP: 0,
		totalItems: 0,
		recalculateMasteryRank: () => {
			const {
				flattenedItems,
				itemsMastered,
				partiallyMasteredItems,
				railjackIntrinsics,
				drifterIntrinsics,
				hideFounders,
				starChart,
				starChartJunctions,
				steelPath,
				steelPathJunctions
			} = get();

			const masteryBreakdown = {
				STAR_CHART: junctionsToXP(starChartJunctions.size),
				STEEL_PATH: junctionsToXP(steelPathJunctions.size),
				RAILJACK_INTRINSICS: intrinsicsToXP(railjackIntrinsics),
				DRIFTER_INTRINSICS: intrinsicsToXP(drifterIntrinsics)
			};

			let xp = Object.values(masteryBreakdown).reduce(
				(xp, categoryXP) => xp + categoryXP,
				0
			);

			function addItemXP(item, rank) {
				const additionalXP = xpFromItem(item, item.type, rank);
				if (!masteryBreakdown[item.type])
					masteryBreakdown[item.type] = 0;
				masteryBreakdown[item.type] += additionalXP;
				xp += additionalXP;
			}

			let itemsMasteredCount = 0;

			let totalXP =
				junctionsToXP(planetsWithJunctions.length * 2) +
				intrinsicsToXP(
					totalRailjackIntrinsics + totalDrifterIntrinsics
				);
			let totalItems = 1; // There is an extra "Amp" item that is shown in the in-game profile.

			// Keep track of whether an amp has been mastered, because we assume the ghost "Amp" item is "mastered" by the
			// time a user has obtained and mastered an actual amp.
			let ampFound = false;

			Object.entries(flattenedItems).forEach(([itemName, item]) => {
				// Venari gains mastery XP through leveling, but does not show under the Profile. Kitguns show under both Primary
				// and Secondary tabs in the Profile, contributing 2 to the total count per barrel while only providing the
				// mastery XP once.
				const additionalItemCount = itemName.includes("Venari")
					? 0
					: item.type === "KITGUN"
						? 2
						: 1;

				if (itemsMastered.has(itemName)) {
					addItemXP(item);
					itemsMasteredCount += additionalItemCount;

					// See comment above regarding `ampFound`.
					if (!ampFound && item.type === "AMP") {
						ampFound = true;
						itemsMasteredCount++;
					}
				} else if (partiallyMasteredItems[itemName]) {
					addItemXP(item, partiallyMasteredItems[itemName]);
				}
				if (
					hideFounders &&
					foundersItems.includes(itemName) &&
					!itemsMastered.has(itemName)
				)
					return;
				totalXP += xpFromItem(item, item.type);
				totalItems += additionalItemCount;
			});

			Object.entries(flattenedNodes).forEach(([id, node]) => {
				if (node.xp) {
					totalXP += node.xp * 2;
					if (starChart.has(id)) {
						xp += node.xp;
						masteryBreakdown.STAR_CHART += node.xp;
					}
					if (steelPath.has(id)) {
						xp += node.xp;
						masteryBreakdown.STEEL_PATH += node.xp;
					}
				}
			});

			set({
				masteryRank: Math.floor(xpToMR(xp)),
				masteryBreakdown,
				xp,
				itemsMasteredCount,
				totalXP,
				totalItems
			});
		},

		itemsMastered: new Set(),
		setItemsMastered: itemsMastered => {
			setMastered("itemsMastered", itemsMastered);
			get().recalculateIngredients();
		},
		masterItem: (name, mastered) => {
			master("itemsMastered", name, mastered);
			get().recalculateIngredients();
		},
		masterAllItems: mastered => {
			Object.keys(get().partiallyMasteredItems).forEach(item =>
				get().setPartiallyMasteredItem(item, 0)
			);
			masterAll(
				"itemsMastered",
				Object.keys(get().flattenedItems).filter(
					i =>
						!get().hideFounders ||
						!foundersItems.includes(i) ||
						get().itemsMastered.has(i)
				),
				mastered
			);
			get().recalculateIngredients();
		},

		partiallyMasteredItems: {},
		setPartiallyMasteredItems: partiallyMasteredItems => {
			set(state =>
				produce(state, draftState => {
					state.unsavedChanges
						.filter(change => change.type === "partialItem")
						.forEach(change => {
							partiallyMasteredItems[change.item] = change.rank;
						});
					draftState.partiallyMasteredItems = partiallyMasteredItems;
				})
			);
			get().recalculateMasteryRank();
			get().recalculateIngredients();
		},
		setPartiallyMasteredItem: (name, rank, maxRank) => {
			if (rank === maxRank) get().masterItem(name, true);
			else if (get().itemsMastered.has(name))
				get().masterItem(name, false);
			rank = rank === maxRank || rank === 0 ? undefined : rank;

			set(state =>
				produce(state, draftState => {
					markOldNewChange(
						draftState,
						"partiallyMasteredItems",
						name,
						draftState.partiallyMasteredItems[name],
						rank
					);
					if (rank === 0 || rank === maxRank) {
						delete draftState.partiallyMasteredItems[name];
					} else {
						draftState.partiallyMasteredItems[name] = rank;
					}
				})
			);
			get().recalculateMasteryRank();
			get().recalculateIngredients();
			get().save();
		},

		displayingNodes: false,
		setDisplayingNodes: displayingNodes => set({ displayingNodes }),
		displayingSteelPath: false,
		setDisplayingSteelPath: displayingSteelPath =>
			set({ displayingSteelPath }),
		starChart: new Set(),
		starChartJunctions: new Set(),
		steelPath: new Set(),
		steelPathJunctions: new Set(),
		setNodesMastered: (nodesMastered, steelPath) =>
			setMastered(steelPath ? "steelPath" : "starChart", nodesMastered),
		masterNode: (id, steelPath, mastered) =>
			master(steelPath ? "steelPath" : "starChart", id, mastered),
		masterAllNodes: (steelPath, mastered) =>
			masterAll(
				steelPath ? "steelPath" : "starChart",
				Object.keys(flattenedNodes),
				mastered
			),
		setJunctionsMastered: (junctionsMastered, steelPath) =>
			setMastered(
				(steelPath ? "steelPath" : "starChart") + "Junctions",
				junctionsMastered
			),
		masterJunction: (id, steelPath, mastered) =>
			master(
				(steelPath ? "steelPath" : "starChart") + "Junctions",
				id,
				mastered
			),
		masterAllJunctions: (steelPath, mastered) =>
			masterAll(
				(steelPath ? "steelPath" : "starChart") + "Junctions",
				planetsWithJunctions,
				mastered
			),

		ingredients: {},
		formaCost: 0,
		recalculateIngredients: () => {
			const {
				flattenedItems,
				recipes,
				ingredientIds,
				itemsMastered,
				partiallyMasteredItems
			} = get();

			const necessaryComponents = {};
			let formaCost = 0;

			const needsRounding = new Map();

			function calculate(recipe, count = 1) {
				if (!recipe.components) return;

				Object.entries(recipe.components).forEach(
					([componentName, componentCount]) => {
						componentCount *= count / recipe.count;

						const componentRecipe = recipes[componentName];
						if (componentRecipe) {
							if (
								!Number.isInteger(
									componentCount / componentRecipe.count
								)
							) {
								needsRounding.set(
									componentName,
									(needsRounding.get(componentName) ?? 0) +
									componentCount
								);
								return;
							}
							calculate(componentRecipe, componentCount);
						}

						const ingredientId = ingredientIds[componentName];
						// Do not show generic components such as Barrels, Receivers, etc.
						if (
							ingredientId.includes("WeaponParts") ||
							ingredientId.includes("WarframeRecipes") ||
							ingredientId.includes("ArchwingRecipes") ||
							ingredientId.includes("mechPart") ||
							componentName.startsWith("Cortege") ||
							componentName.startsWith("Morgha")) {
							return;
						}

						necessaryComponents[componentName] =
							(necessaryComponents[componentName] ?? 0) +
							componentCount;
					}
				);
			}

			Object.entries(flattenedItems).forEach(([itemName, item]) => {
				if (!itemsMastered.has(itemName)) {
					if (
						!partiallyMasteredItems[itemName] &&
						recipes[itemName]
					) {
						calculate(recipes[itemName]);
					}
					if (item.maxLvl) {
						formaCost += Math.floor(
							(item.maxLvl -
								(partiallyMasteredItems[itemName] ?? 30)) /
							2
						);
					}
				}
			});

			while (needsRounding.size !== 0) {
				for (const [componentName, componentCount] of needsRounding) {
					const componentRecipe = recipes[componentName];
					const newCount =
						Math.ceil(componentCount / componentRecipe.count) *
						componentRecipe.count;

					needsRounding.delete(componentName);
					calculate(componentRecipe, newCount);
					necessaryComponents[componentName] =
						(necessaryComponents[componentName] ?? 0) + newCount;
				}
			}

			set({ ingredients: necessaryComponents, formaCost });
		},

		hideMastered: true,
		setHideMastered: firestoreFieldSetter("hideMastered"),
		hideFounders: true,
		setHideFounders: firestoreFieldSetter("hideFounders"),

		railjackIntrinsics: 0,
		setRailjackIntrinsics: firestoreFieldSetter(
			"intrinsics",
			"railjackIntrinsics"
		),
		drifterIntrinsics: 0,
		setDrifterIntrinsics: firestoreFieldSetter("drifterIntrinsics")
	}),
	shallow
);

const get = () => useStore.getState();
const set = value => useStore.setState(value);

global.framehub = {
	getItems: () => get().items,
	getFlattenedItems: () => get().flattenedItems,
	masterItem: (name, mastered) => get().masterItem(name, mastered),
	getItemsMastered: () => get().itemsMastered,

	getPartiallyMasteredItems: () => get().partiallyMasteredItems,
	setPartiallyMasteredItem: (name, rank, maxRank) =>
		get().setPartiallyMasteredItem(name, rank, maxRank),

	getStarChart: () => get().starChart,
	getStarChartJunctions: () => get().starChartJunctions,
	getSteelPath: () => get().steelPath,
	getSteelPathJunctions: () => get().steelPathJunctions,
	masterNode: (id, steelPath, mastered) =>
		get().masterNode(id, steelPath, mastered),
	masterJunction: (id, steelPath, mastered) =>
		get().masterJunction(id, steelPath, mastered)
};

function firestoreFieldSetter(key, stateKey = key) {
	return (value, load) => {
		set(state =>
			produce(state, draftState => {
				if (state[stateKey] !== value) {
					if (!load)
						markOldNewChange(
							draftState,
							"field",
							key,
							state[stateKey],
							value
						);
					draftState[stateKey] = value;
				}
			})
		);
		get().recalculateMasteryRank();
		if (!load) get().save();
	};
}

function markOldNewChange(draftState, type, id, old, _new) {
	const unsavedChanges = draftState.unsavedChanges;

	const existingChangeIndex = unsavedChanges.findIndex(
		change => change.type === type && change.id === id
	);
	if (existingChangeIndex !== -1) {
		const existingChange = unsavedChanges[existingChangeIndex];
		if (existingChange.old === _new) {
			unsavedChanges.splice(existingChangeIndex, 1);
		} else {
			existingChange.new = _new;
		}
	} else {
		unsavedChanges.push({
			type,
			id,
			old,
			new: _new
		});
	}
}

function setMastered(key, mastered) {
	const unsavedChanges = get().unsavedChanges.filter(
		change => change.type === key
	);
	const added = unsavedChanges
		.filter(change => change.mastered)
		.map(change => change.id);
	const removed = unsavedChanges
		.filter(change => !change.mastered)
		.map(change => change.id);
	mastered = mastered.filter(item => !removed.includes(item));
	added.forEach(item => {
		if (!mastered.includes(item)) mastered.push(item);
	});

	set(() => ({ [key]: new Set(mastered) }));
	get().recalculateMasteryRank();
}

function master(key, id, mastered) {
	set(state =>
		produce(state, draftState => {
			if (mastered) {
				draftState[key].add(id);
			} else {
				draftState[key].delete(id);
			}
			markMasteryChange(draftState, key, id, mastered);
		})
	);
	get().recalculateMasteryRank();
	get().save();
}

function masterAll(key, all, mastered) {
	set(state =>
		produce(state, draftState => {
			all.forEach(id => {
				if (mastered && !draftState[key].has(id)) {
					draftState[key].add(id);
					markMasteryChange(draftState, key, id, mastered);
				} else if (!mastered && draftState[key].has(id)) {
					markMasteryChange(draftState, key, id, mastered);
				}
			});
			if (!mastered) draftState[key] = new Set();
		})
	);
	get().recalculateMasteryRank();
	get().save();
}

function markMasteryChange(draftState, key, id, mastered) {
	const existingChangeIndex = draftState.unsavedChanges.findIndex(
		change => change.type === key && change.id === id
	);
	if (existingChangeIndex !== -1) {
		draftState.unsavedChanges.splice(existingChangeIndex, 1);
	} else {
		draftState.unsavedChanges.push({
			type: key,
			id,
			mastered
		});
	}
}
