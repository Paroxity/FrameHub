import Axios from "axios";
import "firebase/auth";
import "firebase/firestore";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import {useDocumentData} from "react-firebase-hooks/firestore";
import Masonry from "react-masonry-css";
import {useDebouncedCallback} from "use-debounce";
import {firestore} from "./App";
import Category from "./components/Category";
import CraftingComponents from "./components/CraftingComponents";
import LoadingScreen from "./components/LoadingScreen";
import Sidebar from "./components/Sidebar";
import framehub from "./media/framehub.svg";
import paroxity from "./media/paroxity.png";
import {complexToSimpleList, foundersItems} from "./utils/item";
import {baseXPByType, intrinsicsToXP, junctionsToXP, missionsToXP, xpToMR} from "./utils/xp";

function MasteryChecklist(props) {
	const shared = props.shared;
	const anonymous = props.anonymous;
	const uid = props.uid;

	const [data, loading] = useDocumentData(firestore.collection(anonymous ? "anonymousMasteryData" : "masteryData").doc(uid));

	const [items, setItems] = useState({});

	const [mastered, setMastered] = useState(0);
	const [missions, setMissions] = useState(0);
	const [junctions, setJunctions] = useState(0);
	const [intrinsics, setIntrinsics] = useState(0);

	const [hideMastered, setHideMastered] = useState(true);
	const [hideFounders, setHideFounders] = useState(true);

	const [changed, setChanged] = useState(false);
	const save = () => {
		if (!shared) {
			setChanged(false);
			firestore.collection(anonymous ? "anonymousMasteryData" : "masteryData").doc(uid).set({
				mastered: complexToSimpleList(items).filter(item => item.mastered).map(item => item.name),
				missions,
				junctions,
				intrinsics,
				hideMastered,
				hideFounders
			});
		}
	};
	const debouncedSave = useDebouncedCallback(() => {
		save();
	}, 2500);

	window.onbeforeunload = changed && !shared ? e => {
		e.preventDefault();
		e.returnValue = "";
	} : undefined;

	useEffect(() => {
		if (data) {
			(async () => {
				let loadedItems;
				if (localStorage.getItem("lastSave") < Date.now()) {
					loadedItems = (await Axios.get("https://firebasestorage.googleapis.com/v0/b/framehub-f9cfb.appspot.com/o/items.json?alt=media")).data;
					localStorage.setItem("items", JSON.stringify(loadedItems));
					localStorage.setItem("lastSave", (Date.now() + 7200000).toString());
				} else {
					loadedItems = JSON.parse(localStorage.getItem("items"));
				}

				Object.values(loadedItems).forEach(categoryItems => {
					Object.keys(categoryItems).forEach(categoryItem => {
						if (data.mastered.includes(categoryItem)) {
							categoryItems[categoryItem].mastered = true;
						}
					});
				});
				setItems(loadedItems);
				setMastered(data.mastered.length);
				setMissions(data.missions);
				setJunctions(data.junctions);
				setIntrinsics(data.intrinsics);
				setHideMastered(data.hideMastered);
				setHideFounders(data.hideFounders);
			})();
		}
	}, [data]);

	useEffect(() => {
		if (changed) debouncedSave.callback();
	}, [mastered, missions, junctions, intrinsics, hideMastered, hideFounders, changed]);

	if (loading || Object.keys(items).length === 0) return <LoadingScreen/>;

	let xp = missionsToXP(missions) + junctionsToXP(junctions) + intrinsicsToXP(intrinsics);
	complexToSimpleList(items).forEach(item => {
		if (item.mastered) xp += baseXPByType(item.type) * (item.maxLvl || 30);
	});

	return <div className="app">
		<Sidebar uid={uid} shared={shared} anonymous={anonymous} items={items} mastered={mastered}
			setMastered={setMastered} missions={missions} setMissions={setMissions}
			junctions={junctions} setJunctions={setJunctions} intrinsics={intrinsics} setIntrinsics={setIntrinsics}
			hideMastered={hideMastered} setHideMastered={setHideMastered} hideFounders={hideFounders}
			setHideFounders={setHideFounders} changed={changed} setChanged={setChanged}
			markAllAsMastered={() => {
				let additionalMastered = 0;
				Object.keys(items).forEach(category => {
					let categoryItems = items[category];
					Object.values(categoryItems).forEach(item => {
						if (!item.mastered && (!foundersItems.includes(item.name) || !hideFounders)) {
							item.mastered = true;
							additionalMastered++;
						}
					});
				});
				if (additionalMastered > 0) {
					setMastered(mastered + additionalMastered);
					setChanged(true);
				}
			}}
			reset={() => {
				Object.values(items).forEach(categoryItems => {
					Object.values(categoryItems).forEach(item => {
						item.mastered = false;
					});
				});
				setMastered(0);
				setChanged(true);
			}} save={save}/>
		<div className="content">
			<img className="framehub-logo" src={framehub} alt="" onDragStart={e => e.preventDefault()}/>
			<div className={"categories" + (shared ? " read-only" : "")}>
				<Masonry columnClassName="masonry-grid_column" className="masonry-grid" breakpointCols={{
					default: 5,
					1533: 4,
					1348: 3,
					1152: 2,
					640: 1
				}}>
					{
						Object.keys(items).filter(category => {
							let categoryItems = items[category];
							return Object.keys(categoryItems).filter(itemName => {
								let item = categoryItems[itemName];
								return (!item.mastered || !hideMastered) && (!foundersItems.includes(itemName) || !hideFounders);
							}).length > 0;
						}).map(category => {
							return <Category key={category} name={category} mr={xpToMR(xp)} hideMastered={hideMastered}
								hideFounders={hideFounders} items={items[category]}
								changeMastered={difference => {
									setMastered(mastered + difference);
									setChanged(true);
								}}
							/>;
						})
					}
				</Masonry>
			</div>
			<CraftingComponents items={items}/>
		</div>
		<img className="paroxity-logo" src={paroxity} alt="paroxity" width="50px" onDragStart={e => e.preventDefault()}
			onClick={() => window.open("https://paroxity.net")}/>
	</div>;
}

MasteryChecklist.propTypes = {
	uid: PropTypes.string.isRequired,
	shared: PropTypes.bool,
	anonymous: PropTypes.bool
};

export default MasteryChecklist;