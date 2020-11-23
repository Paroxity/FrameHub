import React, {useState} from 'react';
import Item from './Item.js';
import {baseXPByType} from "../utils/xp.js"
import Toggle from './Toggle.js';

const fancyCategoryNames = {
    "WF": "Warframe",
    "SENTINEL_WEAPON": "Sentinel Weapons",
    "AW": "Archwing",
    "AW_GUN": "Archwing Primary",
    "AW_MELEE": "Archwing Melee",
    "DOG": "Kubrow",
    "CAT": "Kavat",
    "MOA": "MOA",
    "MECH": "Necramech",
    "KDRIVE": "K-Drive"
};

const Category = (props) => {
    const [show, setShow] = useState(false);
    let category = props.name;

    let masteredCount = 0;
    let masteredXP = 0;
    let totalCount = 0;
    let totalXP = 0;
    Object.keys(props.items).forEach(itemName => {
        let item = props.items[itemName];
        if (item.mastered) {
            masteredCount++;
            masteredXP += baseXPByType(category) * (item.maxLvl || 30);
        }
        if ((itemName === "Excalibur Prime" || itemName === "Skana Prime" || itemName === "Lato Prime") && props.hideFounders && !item.mastered) return;
        totalCount++;
        totalXP += baseXPByType(category) * (item.maxLvl || 30);
    });

    if (masteredCount === totalCount && props.hideMastered) return <></>;
    return <div className="category" id={category}>
        <div className="categoryInfo">
                <span
                    className="category-name">{(fancyCategoryNames[category] || category.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")) + " - " + masteredCount + "/" + totalCount}</span>
            <br/>
            <span
                className="category-xp">{masteredXP.toLocaleString()}/{totalXP.toLocaleString()} XP</span>
        </div>
        <br/>
        <div className="categoryInfo">
            <Toggle name={category} selected={show} onToggle={() => {
                setShow(!show)
            }}/>
        </div>
        {show && Object.keys(props.items).map(itemName => {
            let item = props.items[itemName];
            return <Item key={itemName} mr={props.mr} name={itemName} item={item}
                         hideMastered={props.hideMastered} hideFounders={props.hideFounders}
                         onClick={() => {
                             item.mastered = !item.mastered;
                             if (!item.mastered) delete item.mastered;
                             props.changeMasteredAndXP(item.mastered ? 1 : -1, baseXPByType(category) * (item.maxLvl || 30) * (item.mastered ? 1 : -1));
                         }}/>
        })}
    </div>
}

export default Category;