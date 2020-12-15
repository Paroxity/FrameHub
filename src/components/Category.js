import PropTypes from "prop-types";
import React, {useState} from "react";
import {foundersItems} from "../utils/item";
import {baseXPByType} from "../utils/xp.js";
import Item from "./Item.js";
import {Toggle} from "./Toggle.js";

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

function Category(props) {
	let category = props.name;

	let shouldShow = false;
	if (localStorage.getItem("categoryShown")) shouldShow = JSON.parse(localStorage.getItem("categoryShown"))[category];
	const [show, setShow] = useState(shouldShow);

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
		if (foundersItems.includes(itemName) && props.hideFounders && !item.mastered) return;
		totalCount++;
		totalXP += baseXPByType(category) * (item.maxLvl || 30);
	});

	if (masteredCount === totalCount && props.hideMastered) return <></>;
	return <div className="category" id={category}>
		<div className="categoryInfo">
			<span
				className="category-name">{(fancyCategoryNames[category] || category.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" "))}</span>
			<br/>
			<span>{masteredCount}/{totalCount}</span>
			<br/>
			<span
				className="category-xp">{masteredXP.toLocaleString()}/{totalXP.toLocaleString()} XP</span>
		</div>
		<div className="categoryInfo">
			<Toggle name={category} selected={show} onToggle={() => {
				let value = JSON.parse(localStorage.getItem("categoryShown") || "{}");
				value[category] = !show;
				localStorage.setItem("categoryShown", JSON.stringify(value));
				setShow(!show);
			}}/>
		</div>
		{show && Object.keys(props.items).map(itemName => {
			let item = props.items[itemName];
			return <Item key={itemName} mr={props.mr} name={itemName} item={item}
				hideMastered={props.hideMastered} hideFounders={props.hideFounders}
				onClick={() => {
					item.mastered = !item.mastered;
					if (!item.mastered) delete item.mastered;
					props.changeMastered(item.mastered ? 1 : -1);
				}}/>;
		})}
	</div>;
}

Category.propTypes = {
	name: PropTypes.string.isRequired,
	items: PropTypes.object.isRequired,
	mr: PropTypes.number.isRequired,
	hideMastered: PropTypes.bool.isRequired,
	hideFounders: PropTypes.bool.isRequired,
	changeMastered: PropTypes.func.isRequired
};

export default Category;