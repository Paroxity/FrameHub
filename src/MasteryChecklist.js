import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useHistory} from "react-router-dom";
import {useParams} from 'react-router-dom';
import Category from './components/Category.js';
import NumberInput from './components/NumberInput.js';
import LoadingScreen from './components/LoadingScreen.js';
import Toggle from './components/Toggle.js';
import {complexToSimpleList, foundersItems, getItemComponents, ingredientSuffixes} from './utils/item.js';
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
import firebase from "firebase/app";
import 'firebase/auth';
import 'firebase/firestore';
import Axios from 'axios';
import framehub from './media/framehub.svg';
import paroxity from './media/paroxity.png';
import placeholderIcon from './media/placeholderIcon.svg';
import Masonry from "react-masonry-css";
import Button from "./components/Button";
import debounce from 'lodash.debounce';
import {useAuthState} from "react-firebase-hooks/auth";

function useDebounce(callback, delay) {
    // Memoizing the callback because if it's an arrow function
    // it would be different on each render
    const memoizedCallback = useCallback(callback, []); // eslint-disable-line react-hooks/exhaustive-deps
    const debouncedFn = useRef(debounce(memoizedCallback, delay));

    useEffect(() => {
        debouncedFn.current = debounce(memoizedCallback, delay);
    }, [memoizedCallback, debouncedFn, delay]);

    return debouncedFn.current;
}

function MasteryChecklist() {
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
    const [showShare, setShowShare] = useState(false);

    const [changed, setChanged] = useState(false);

    const textAreaRef = useRef(null);

    const auth = firebase.app("secondary").auth();
    const firestore = firebase.app("secondary").firestore();
    const user = useAuthState(auth);

    const {uid} = useParams();

    const history = useHistory();

    console.log(uid);

    if (changed) {
        window.onbeforeunload = e => {
            e.preventDefault();
            e.returnValue = "";
        };
    } else {
        window.onbeforeunload = undefined;
    }
    const copyToClipboard = () => {
        textAreaRef.current.select();
        document.execCommand('copy');
    };
    const startUp = useCallback(async () => {
        let loadedItems = {};

        let worldState;
        try {
            worldState = (await Axios.get("https://cors-proxy.aericio.workers.dev/?https://content.warframe.com/dynamic/worldState.php")).data
        } catch (e) {
            console.log("Error retrieving Warframe world state from WFCD");
            console.log(e);
        }

        if (localStorage.getItem('lastSave') < Date.now() || (worldState && worldState.BuildLabel !== localStorage.getItem('lastWFBuild'))) {
            loadedItems = (await Axios.get("https://firebasestorage.googleapis.com/v0/b/framehub-f9cfb.appspot.com/o/items.json?alt=media")).data;
            localStorage.setItem("items", JSON.stringify(loadedItems));
            localStorage.setItem("lastSave", (Date.now() + 7200000).toString());
            localStorage.setItem("lastWFBuild", worldState.BuildLabel);
        } else {
            loadedItems = JSON.parse(localStorage.getItem("items"));
        }

        let data = (await firestore.collection("masteryData").doc(uid || user[0].uid).get()).data();
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
    }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

    const saveData = (intrinsics, junctions, missions, mastered, hideFounders, hideMastered, items) => {
        if (user) {
            setChanged(false);
            firestore.collection("masteryData").doc(user[0].uid).set({
                mastered: complexToSimpleList(items).filter(item => item.mastered).map(item => item.name),
                missions,
                junctions,
                intrinsics,
                hideMastered,
                hideFounders
            })
        }
    };

    useEffect(() => {
        startUp();
    }, [startUp]);


    const debouncedSave = useDebounce((intrinsics, junctions, missions, mastered, hideFounders, hideMastered, items) => saveData(intrinsics, junctions, missions, mastered, hideFounders, hideMastered, items), 5000);

    useEffect(() => {
        if (changed) {
            debouncedSave(intrinsics, junctions, missions, mastered, hideFounders, hideMastered, items);
        }
    }, [intrinsics, junctions, missions, mastered, hideFounders, hideMastered, debouncedSave, items, changed]);
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
        if (!foundersItems.includes(item.name) || !hideFounders || item.mastered) {
            maximumXP += baseXPByType(item.type) * (item.maxLvl || 30);
            maximumItems++;
        }
    });

    const breakpointColumnsObj = {
        default: 5,
        1533: 4,
        1348: 3,
        1152: 2,
        640: 1
    };

    return <div className="app">
        <div className={"sidebar" + (showSidebar ? " toggled" : "") + (!uid ? '' : ' read-only')}>
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
                if (!uid) setChanged(true);
            }} tooltip={<p>Steel Path missions: {totalMissions / 2}</p>}/>
            <NumberInput name="Junctions" min={0} max={totalJunctions} value={junctions.toString()} onChange={value => {
                setXp(xp + junctionsToXP(value - junctions));
                setJunctions(value);
                if (!uid) setChanged(true);
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
                if (!uid) setChanged(true);
            }}/>
            <Toggle name="hideFounders" label="Hide Founders" selected={hideFounders} onToggle={() => {
                setHideFounders(!hideFounders);
                if (!uid) setChanged(true);
            }}/>
            {!uid &&
            <div className="autosave-text">{changed ? "Your changes are unsaved." : "Changes autosaved."}</div>}
            {!uid &&
            <>
                <span className="danger-text">Danger zone</span>
                <div className="danger">
                    <Button centered onClick={() => {
                        let additionalMastered = 0;
                        let additionalXP = 0;
                        Object.keys(items).forEach(category => {
                            let categoryItems = items[category];
                            Object.values(categoryItems).forEach(item => {
                                if (!item.mastered && (!foundersItems.includes(item.name) || !hideFounders)) {
                                    item.mastered = true;
                                    additionalMastered++;
                                    additionalXP += baseXPByType(category) * (item.maxLvl || 30);
                                }
                            });
                        });
                        setMastered(mastered + additionalMastered);
                        setXp(xp + additionalXP);
                        if (!uid) setChanged(true);
                    }}>Mark All as Mastered</Button>

                    <Button centered onClick={() => {
                        Object.values(items).forEach(categoryItems => {
                            Object.values(categoryItems).forEach(item => {
                                item.mastered = false;
                            });
                        });
                        setMastered(0);
                        setXp(missionsToXP(missions) + junctionsToXP(junctions) + intrinsicsToXP(intrinsics));
                        if (!uid) setChanged(true);
                    }}>Reset</Button>
                </div>
            </>
            }
            <br/>
            {
                !uid &&
                <Button centered onClick={() => {
                    setShowShare(true);
                }
                }>Share</Button>
            }
            {auth && !uid && <Button centered onClick={() => {
                auth.signOut();
            }} disabled={changed}>Logout</Button>}
            {uid && <Button centered onClick={() => {
                history.push('/')
            }
            }>Exit</Button>}
        </div>
        <div className="content">
            <img className="framehub-logo" src={framehub} alt="" onDragStart={e => e.preventDefault()}/>
            <div className={"categories" + (!uid ? '' : ' read-only')}>
                <Masonry columnClassName="masonry-grid_column" className="masonry-grid"
                         breakpointCols={breakpointColumnsObj}>
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
                                             changeMasteredAndXP={(m, x) => {
                                                 setMastered(mastered + m);
                                                 setXp(xp + x);
                                                 if (!uid) setChanged(true);
                                             }}
                            />
                        })
                    }
                </Masonry>
            </div>
            <Toggle name="showComponents" label="Show All Components" selected={showComponents} onToggle={() => {
                setShowComponents(!showComponents);
            }}/>
            <Masonry columnClassName="masonry-grid_column" className="masonry-grid"
                     breakpointCols={breakpointColumnsObj}>
                {showComponents && Object.keys(necessaryComponents).map(item => {
                    return <div key={item}>
                        <img className="component-image"
                             src={"https://raw.githubusercontent.com/WFCD/warframe-items/development/data/img/" + item.toLowerCase().split(" ").join("-") + ".png"}
                             alt="" width="30px"/>
                        <span className="component-name">{necessaryComponents[item].toLocaleString()}x {item}</span>
                        <br/>
                    </div>
                })}
            </Masonry>
        </div>
        <img className="paroxity-logo" src={paroxity} alt="paroxity" width="50px" onDragStart={e => e.preventDefault()}
             onClick={() => {
                 window.open("https://paroxity.net");
             }}/>
        <img className="hamburger" src={placeholderIcon} onClick={() => {
            setShowSidebar(!showSidebar);
        }} alt="menu"/>
        <div className={showShare ? "popup show" : "popup"}>
            <div className={"popup-box"}>
                Here's your sharable link:
                <div className="input"><input type="text"
                                              readOnly value={"https://framehub.paroxity.net/" + user[0].uid}
                                              ref={textAreaRef}/></div>

                {
                    document.queryCommandSupported('copy') &&
                    <Button centered onClick={e => {
                        copyToClipboard(e);
                        setShowShare(false);
                    }}>Copy</Button>
                }
                <Button centered onClick={() => {
                    setShowShare(false);
                }}>Close</Button>
            </div>
        </div>
    </div>
}

export default MasteryChecklist;