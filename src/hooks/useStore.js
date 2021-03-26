import debounce from "debounce";
import firebase from "firebase";
import produce from "immer";
import create from "zustand";
import { firestore } from "../App";
import { ANONYMOUS, SHARED } from "../utils/checklist-types";
import {
	foundersItems,
	ingredientSuffixes,
	itemsAsArray
} from "../utils/items";
import {
	baseXPByType,
	intrinsicsToXP,
	junctionsToXP,
	missionsToXP,
	totalIntrinsics,
	totalJunctions,
	totalMissions,
	xpToMR
} from "../utils/mastery-rank";

export const useStore = create((set, get) => ({
	type: undefined,
	setType: type => set(() => ({ type })),
	id: undefined,
	setId: id => set(() => ({ id })),
	reset: () => set({ unsavedChanges: {}, unsavedItemChanges: {} }),

	unsavedChanges: {},
	unsavedItemChanges: {},
	saveImmediate: () => {
		const { type, id, unsavedChanges, unsavedItemChanges } = get();
		if (
			type !== SHARED &&
			(Object.keys(unsavedChanges).length > 0 ||
				Object.keys(unsavedItemChanges).length > 0)
		) {
			let doc = firestore
				.collection(
					type === ANONYMOUS ? "anonymousMasteryData" : "masteryData"
				)
				.doc(id);
			let batch = firestore.batch();

			batch.set(
				doc,
				Object.keys(unsavedChanges).reduce((changes, key) => {
					changes[key] = unsavedChanges[key].new;
					return changes;
				}, {}),
				{ merge: true }
			);
			batch.set(
				doc,
				{
					mastered: firebase.firestore.FieldValue.arrayUnion(
						...Object.keys(unsavedItemChanges).filter(
							item => unsavedItemChanges[item]
						)
					)
				},
				{ merge: true }
			);
			batch.set(
				doc,
				{
					mastered: firebase.firestore.FieldValue.arrayRemove(
						...Object.keys(unsavedItemChanges).filter(
							item => !unsavedItemChanges[item]
						)
					)
				},
				{ merge: true }
			);

			batch.commit();

			set({ unsavedChanges: {}, unsavedItemChanges: {} });
		}
	},
	save: debounce(() => get().saveImmediate(), 2500),

	items: {},
	fetchItems: async () => {
		if (localStorage.getItem("lastSave") < Date.now()) {
			let loadedItems = await (
				await fetch(
					"https://firebasestorage.googleapis.com/v0/b/framehub-f9cfb.appspot.com/o/items.json?alt=media"
				)
			).json();
			localStorage.setItem("items", JSON.stringify(loadedItems));
			localStorage.setItem("lastSave", (Date.now() + 7200000).toString());
			set({ items: loadedItems });
		} else {
			set({ items: JSON.parse(localStorage.getItem("items")) });
		}
		get().recalculateMasteryRank();
	},

	masteryRank: 0,
	xp: 0,
	totalXP: 0,
	totalItems: 0,
	recalculateMasteryRank: () => {
		const {
			items,
			itemsMastered,
			missions,
			junctions,
			intrinsics,
			hideFounders
		} = get();

		let xp =
			missionsToXP(missions) +
			junctionsToXP(junctions) +
			intrinsicsToXP(intrinsics);
		let totalXP =
			missionsToXP(totalMissions) +
			junctionsToXP(totalJunctions) +
			intrinsicsToXP(totalIntrinsics);
		let totalItems = 0;
		itemsAsArray(items).forEach(item => {
			if (itemsMastered.includes(item.name))
				xp += baseXPByType(item.type) * (item.maxLvl || 30);
			if (
				hideFounders &&
				foundersItems.includes(item.name) &&
				!itemsMastered.includes(item.name)
			)
				return;
			totalXP += baseXPByType(item.type) * (item.maxLvl || 30);
			totalItems++;
		});

		set({
			masteryRank: Math.floor(xpToMR(xp)),
			xp,
			totalXP,
			totalItems
		});
	},

	itemsMastered: [],
	setItemsMastered: itemsMastered => {
		const unsavedItemChanges = get().unsavedItemChanges;
		const added = Object.keys(unsavedItemChanges).filter(
			item => unsavedItemChanges[item] === true
		);
		const removed = Object.keys(unsavedItemChanges).filter(
			item => unsavedItemChanges[item] === false
		);
		itemsMastered = itemsMastered.filter(item => !removed.includes(item));
		added.forEach(item => {
			if (!itemsMastered.includes(item)) itemsMastered.push(item);
		});

		set(() => ({ itemsMastered }));
		get().recalculateMasteryRank();
		get().recalculateIngredients();
	},
	masterItem: (name, item) => {
		set(state =>
			produce(state, draftState => {
				if (draftState.itemsMastered.includes(name)) return;
				draftState.itemsMastered.push(name);

				if (draftState.unsavedItemChanges[name] === false) {
					delete draftState.unsavedItemChanges[name];
				} else {
					draftState.unsavedItemChanges[name] = true;
				}
				if (item.components) {
					Object.entries(item.components).forEach(
						([componentName, component]) => {
							if (draftState.ingredients[componentName]) {
								draftState.ingredients[componentName] -= isNaN(
									component
								)
									? component.count || 1
									: component;
								if (draftState.ingredients[componentName] === 0)
									delete draftState.ingredients[
										componentName
									];
							}
						}
					);
				}
			})
		);
		get().recalculateMasteryRank();
		get().save();
	},
	masterAllItems: () => {
		set(state =>
			produce(state, draftState => {
				itemsAsArray(draftState.items).forEach(item => {
					if (!draftState.itemsMastered.includes(item.name)) {
						if (
							!state.hideFounders ||
							!foundersItems.includes(item.name)
						) {
							draftState.itemsMastered.push(item.name);

							if (
								draftState.unsavedItemChanges[item.name] ===
								false
							) {
								delete draftState.unsavedItemChanges[item.name];
							} else {
								draftState.unsavedItemChanges[item.name] = true;
							}
						}
					}
				});
				draftState.ingredients = {};
			})
		);
		get().recalculateMasteryRank();
		get().save();
	},
	unmasterItem: (name, item) => {
		set(state =>
			produce(state, draftState => {
				let index = draftState.itemsMastered.indexOf(name);
				if (index === -1) return;

				draftState.itemsMastered.splice(index, 1);
				if (draftState.unsavedItemChanges[name] === true) {
					delete draftState.unsavedItemChanges[name];
				} else {
					draftState.unsavedItemChanges[name] = false;
				}
				if (item.components) {
					Object.entries(item.components).forEach(
						([componentName, component]) => {
							if (ingredientSuffixes.includes(componentName))
								return;
							if (!draftState.ingredients[componentName])
								draftState.ingredients[componentName] = 0;
							draftState.ingredients[componentName] += isNaN(
								component
							)
								? component.count || 1
								: component;
						}
					);
				}
			})
		);
		get().recalculateMasteryRank();
		get().save();
	},
	unmasterAllItems: () => {
		set(state =>
			produce(state, draftState => {
				state.itemsMastered.forEach(item => {
					if (draftState.unsavedItemChanges[item] === true) {
						delete draftState.unsavedItemChanges[item];
					} else {
						draftState.unsavedItemChanges[item] = false;
					}
				});
				draftState.itemsMastered = [];
			})
		);
		get().recalculateMasteryRank();
		get().recalculateIngredients();
		get().save();
	},

	ingredients: {},
	recalculateIngredients: () => {
		const { items, itemsMastered } = get();
		const necessaryComponents = {};
		itemsAsArray(items).forEach(item => {
			if (!itemsMastered.includes(item.name) && item.components) {
				Object.entries(item.components).forEach(([name, component]) => {
					if (ingredientSuffixes.includes(name)) return;
					if (!necessaryComponents[name])
						necessaryComponents[name] = 0;
					necessaryComponents[name] += isNaN(component)
						? component.count || 1
						: component;
				});
			}
		});
		set({ ingredients: necessaryComponents });
	},

	hideMastered: true,
	setHideMastered: (hideMastered, load) =>
		setAndMarkChange(set, load, "hideMastered", hideMastered),
	hideFounders: true,
	setHideFounders: (hideFounders, load) => {
		setAndMarkChange(set, load, "hideFounders", hideFounders);
		get().recalculateMasteryRank();
	},

	missions: 0,
	setMissions: (missions, load) => {
		setAndMarkChange(set, load, "missions", missions);
		get().recalculateMasteryRank();
	},
	junctions: 0,
	setJunctions: (junctions, load) => {
		setAndMarkChange(set, load, "junctions", junctions);
		get().recalculateMasteryRank();
	},
	intrinsics: 0,
	setIntrinsics: (intrinsics, load) => {
		setAndMarkChange(set, load, "intrinsics", intrinsics);
		get().recalculateMasteryRank();
	}
}));

function setAndMarkChange(set, load, key, value) {
	set(state =>
		produce(state, draftState => {
			if (state[key] !== value) {
				if (!load) {
					if (draftState.unsavedChanges[key]) {
						if (draftState.unsavedChanges[key].old === value) {
							delete draftState.unsavedChanges[key];
						} else {
							draftState.unsavedChanges[key].new = value;
						}
					} else {
						draftState.unsavedChanges[key] = {
							old: state[key],
							new: value
						};
						state.save();
					}
				}
				draftState[key] = value;
			}
		})
	);
}
