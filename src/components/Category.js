import React from 'react';
import Item from './Item.js';
import { baseXPByType } from "../utils/xp.js"
import Toggle from './Toggle.js';

const fancyCategoryNames = { "WF": "Warframe", "SENTINEL_WEAPON": "Sentinel Weapons", "AW": "Archwing", "AW_GUN": "Archwing Primary", "AW_MELEE": "Archwing Melee", "DOG": "Kubrow", "CAT": "Kavat", "MOA": "MOA", "MECH": "Necramech", "KDRIVE": "K-Drive" };

class Category extends React.Component {
    constructor(props){
        super(props);
        this.state = {"show": false};
    }

    render() {
        let category = this.props.name;

        let masteredCount = 0;
        let masteredXP = 0;
        let totalCount = 0;
        let totalXP = 0;
        Object.keys(this.props.items).forEach(itemName => {
            let item = this.props.items[itemName];
            if (item.mastered) {
                masteredCount++;
                masteredXP += baseXPByType(category) * (item.maxLvl || 30);
            }
            if ((itemName === "Excalibur Prime" || itemName === "Skana Prime" || itemName === "Lato Prime") && this.props.hideFounders && !item.mastered) return;
            totalCount++;
            totalXP += baseXPByType(category) * (item.maxLvl || 30);
        });

        if (masteredCount === totalCount && this.props.hideMastered) return <></>;

        return <div className="category">
            <div className="categoryInfo">
            <span className="category-name">{(fancyCategoryNames[category] || category.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")) + " - " + masteredCount + "/" + totalCount}</span>
            <span className="category-xp"> · {masteredXP.toLocaleString() + "/" + totalXP.toLocaleString() + " XP"}</span>
            </div>
            <div className="categoryInfo">
            <Toggle name={category} selected={this.state.show} onToggle={() => {
                this.setState({"show": !this.state.show});
            }}></Toggle>
            </div>
            {this.state.show && Object.keys(this.props.items).map(itemName => {
                let item = this.props.items[itemName];
                return <Item key={itemName} mr={this.props.mr} name={itemName} item={item} hideMastered={this.props.hideMastered} hideFounders={this.props.hideFounders} onClick={() => {
                    item.mastered = !item.mastered;
                    if (!item.mastered) delete item.mastered;
                    this.props.changeMasteredAndXP(item.mastered ? 1 : -1, baseXPByType(category) * (item.maxLvl || 30) * (item.mastered ? 1 : -1));
                }}></Item>
            })}
        </div>
    }
}

export default Category;