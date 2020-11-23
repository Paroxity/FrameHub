import React, {createRef, useCallback, useEffect, useRef, useState} from 'react';
import Category from './components/Category.js';
import NumberInput from './components/NumberInput.js';
import LoadingScreen from './components/LoadingScreen.js';
import Toggle from './components/Toggle.js';
import {complexToSimpleList, getItemComponents, ingredientSuffixes} from './utils/item.js';
import {
    baseXPByType,
    intrinsicsToXP,
    junctionsToXP,
    missionsToXP,
    totalIntrinsics,
    totalJunctions,
    totalMissions,
    totalMissionXP,
    xpToMR
} from './utils/xp.js';
import 'firebase/auth';
import 'firebase/firestore';
import Axios from 'axios';
import framehub from './media/framehub.svg';
import paroxity from './media/paroxity.png';
import placeholderIcon from './media/placeholderIcon.svg';
import Masonry from "react-masonry-css";

function MasteryChecklist(props) {
    const [items, setItems] = useState({});

    const [mastered, setMastered] = useState(0);
    const [missions, setMissions] = useState(0);
    const [junctions, setJunctions] = useState(0);
    const [intrinsics, setIntrinsics] = useState(0);
    const [xp, setXp] = useState(0);

    const [hideMastered, setHideMastered] = useState(false);
    const [hideFounders, setHideFounders] = useState(true);
    const [showComponents, setShowComponents] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    const [changed, setChanged] = useState(false);

    const containerRef = useRef(null);

    const auth = props.auth;
    const firestore = props.firestore;
    const user = props.user;


    if (changed) {
        window.onbeforeunload = e => {
            e.preventDefault();
            e.returnValue = "";
        };
    } else {
        window.onbeforeunload = undefined;
    }

    const startUp = useCallback(async () => {
        let loadedItems = {};

        if (localStorage.getItem('lastSave') < Date.now()) {
            loadedItems = (await Axios.get("https://firebasestorage.googleapis.com/v0/b/framehub-f9cfb.appspot.com/o/items.json?alt=media")).data;
            localStorage.setItem("items", JSON.stringify(loadedItems));
            localStorage.setItem("lastSave", (Date.now() + 43200000).toString());
        } else {
            loadedItems = JSON.parse(localStorage.getItem("items"));
        }

        let data = (await firestore.collection("masteryData").doc(user[0].uid).get()).data();
        if (data) {
            let loadedXP = missionsToXP(data.missions) + junctionsToXP(data.junctions) + intrinsicsToXP(data.intrinsics);
            let masteredCount = 0;
            Object.keys(loadedItems).forEach(category => {
                let categoryItem = loadedItems[category];
                Object.keys(categoryItem).forEach(itemName => {
                    if (data.mastered.includes(itemName)) {
                        let item = categoryItem[itemName];
                        item.mastered = true;
                        loadedXP += baseXPByType(category) * (item.maxLvl || 30);
                        masteredCount++;
                    }
                });
            });
            setXp(loadedXP);
            setMastered(masteredCount);
            setMissions(data.missions);
            setJunctions(data.junctions);
            setIntrinsics(data.intrinsics);
            setHideMastered(data.hideMastered);
            setHideFounders(data.hideFounders);
        }
        setItems(loadedItems);
    }, [firestore, user]);

    const saveData = () => {
        setChanged(false);
        firestore.collection("masteryData").doc(user[0].uid).set({
            mastered: complexToSimpleList(items).filter(item => item.mastered).map(item => item.name),
            missions,
            junctions,
            intrinsics,
            hideMastered,
            hideFounders
        })
    };

    useEffect(() => {
        startUp();
    }, [startUp]);
    if (Object.keys(items).length === 0) return <LoadingScreen/>

    let necessaryComponents = {};
    let maximumXP = totalMissionXP + junctionsToXP(totalJunctions) + intrinsicsToXP(totalIntrinsics);
    let maximumItems = 0;
    complexToSimpleList(items).forEach(item => {
        if (!item.mastered) {
            let itemComponents = getItemComponents(item, item.name);
            Object.keys(itemComponents).forEach(component => {
                let hasSuffix = ingredientSuffixes.map(suffix => component === item.name + " " + suffix).filter(v => v === true).length;
                if (hasSuffix) return;
                if (!necessaryComponents[component]) necessaryComponents[component] = 0;
                necessaryComponents[component] += itemComponents[component];
            });
        }
        if ((item.name !== "Excalibur Prime" && item.name !== "Skana Prime" && item.name !== "Lato Prime") || !hideFounders || item.mastered) {
            maximumXP += baseXPByType(item.type) * (item.maxLvl || 30);
            maximumItems++;
        }
    });

    const breakpointColumnsObj = {
        default: 4,
        1533: 3,
        1248: 2,
        550: 1
    };

    return <div className="app">
        <div className={"sidebar" + (showSidebar ? " toggled" : "")}>
            <img src="" alt="" width="100px"/>
            <br/>
            <span className="mastery-rank">{"Mastery Rank " + xpToMR(xp)}</span>
            <br/>
            <span className="items-mastered">{mastered.toLocaleString()}/{maximumItems.toLocaleString()} Mastered</span>
            <br/>
            <span className="xp">{xp.toLocaleString()}/{maximumXP.toLocaleString()} XP</span>
            <NumberInput name="Missions" min={0} max={totalMissions} value={missions.toString()} onChange={value => {
                setXp(xp + missionsToXP(value - missions));
                setMissions(value);
                setChanged(true);
            }} tooltip={<p>Steel Path missions: {totalMissions / 2}</p>}/>
            <NumberInput name="Junctions" min={0} max={totalJunctions} value={junctions.toString()} onChange={value => {
                setXp(xp + junctionsToXP(value - junctions));
                setJunctions(value);
                setChanged(true);
            }}
                         tooltip={<p>Steel Path junctions: {totalJunctions / 2}</p>}/>
            <NumberInput name="Intrinsics" min={0} max={totalIntrinsics} value={intrinsics.toString()}
                         onChange={value => {
                             setXp(xp + intrinsicsToXP(value - intrinsics));
                             setIntrinsics(value);
                             setChanged(true);
                         }}
                         tooltip={
                             <p>10 of each category.</p>
                         }/>
            <Toggle name="hideMastered" label="Hide Mastered" selected={hideMastered} onToggle={() => {
                setHideMastered(!hideMastered);
                setChanged(true);
            }}/>
            <Toggle name="hideFounders" label="Hide Founders" selected={hideFounders} onToggle={() => {
                setHideFounders(!hideFounders);
                setChanged(true);
            }}/>
            <div className={"button center" + (!changed ? ' disabled' : '')}>
                <button onClick={() => {
                    if (changed) {
                        saveData();
                    }
                }}>Save
                </button>
            </div>

            <span className="danger-text">Danger zone</span>
            <div className="danger">
                <div className="button center">
                    <button onClick={() => {
                        let additionalMastered = 0;
                        let additionalXP = 0;
                        Object.keys(items).forEach(category => {
                            let categoryItems = items[category];
                            Object.values(categoryItems).forEach(item => {
                                if (!item.mastered && ((item.name !== "Excalibur Prime" && item.name !== "Skana Prime" && item.name !== "Lato Prime") || !hideFounders)) {
                                    item.mastered = true;
                                    additionalMastered++;
                                    additionalXP += baseXPByType(category) * (item.maxLvl || 30);
                                }
                            });
                        });
                        setMastered(mastered + additionalMastered);
                        setXp(xp + additionalXP);
                        setChanged(true);
                    }}>Mark All as Mastered
                    </button>
                </div>

                <div className="button center">
                    <button onClick={() => {
                        Object.values(items).forEach(categoryItems => {
                            Object.values(categoryItems).forEach(item => {
                                item.mastered = false;
                            });
                        });
                        setMastered(0);
                        setXp(missionsToXP(missions) + junctionsToXP(junctions) + intrinsicsToXP(intrinsics));
                        setChanged(true);
                    }}>Reset
                    </button>
                </div>
            </div>
            <br/>
            <div className="button center">
                <button onClick={() => {
                    saveData();
                    auth.signOut();
                }}>Logout
                </button>
            </div>
        </div>
        <div className="content">
            <img className="framehub-logo" src={framehub} alt="" onDragStart={e => e.preventDefault()}/>
            <div className="categories" ref={containerRef}>
                <Masonry columnClassName="masonry-grid_column" className="masonry-grid"
                         breakpointCols={breakpointColumnsObj}>
                    {
                        Object.keys(items).map(category => {
                            return <Category key={category} name={category} mr={xpToMR(xp)} hideMastered={hideMastered}
                                             hideFounders={hideFounders} items={items[category]}
                                             changeMasteredAndXP={(m, x) => {
                                                 setMastered(mastered + m);
                                                 setXp(xp + x);
                                                 setChanged(true);
                                             }}

                            />
                        })
                    }
                </Masonry>
            </div>
            <Toggle name="showComponents" label="Show All Components" selected={showComponents} onToggle={() => {
                setShowComponents(!showComponents);
            }}/>
            {showComponents && Object.keys(necessaryComponents).map(item => {
                return <div key={item}>
                    <img className="component-image"
                         src={"https://raw.githubusercontent.com/WFCD/warframe-items/development/data/img/" + item.toLowerCase().split(" ").join("-") + ".png"}
                         alt="" width="30px"/>
                    <span className="component-name">{necessaryComponents[item].toLocaleString()}x {item}</span>
                    <br/>
                </div>
            })}
        </div>
        <img className="paroxity-logo" src={paroxity} alt="paroxity" width="50px" onDragStart={e => e.preventDefault()}
             onClick={() => {
                 window.open("https://paroxity.net");
             }}/>
        <img className="hamburger" src={placeholderIcon} onClick={() => {
            setShowSidebar(!showSidebar);
        }} alt="menu"/>
    </div>
}

export default MasteryChecklist;