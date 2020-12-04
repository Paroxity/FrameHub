import React, {useState} from "react";
import Tooltip from "./Tooltip";
import {foundersItems, ingredientSuffixes} from "../utils/item.js";
import credits from "../media/credits.png";
import {detailedTime} from "../utils/time";
import checkmark from "../media/checkmark.svg";
import GluedComponents from "./GluedComponents";
import PropTypes from "prop-types";

function Item(props) {
	const [showTooltip, setShowTooltip] = useState(false);
	const [x, setX] = useState(0);
	const [y, setY] = useState(0);

	let name = props.name;
	let item = props.item;

	if (item.mastered && props.hideMastered) return <></>;
	if (foundersItems.includes(name) && props.hideFounders && !item.mastered) return <></>;

	return (
		<div
			className={"item" + (item.mastered ? " item-mastered" : "") + ((item.mr || 0) > props.mr ? " item-locked" : "")}>
			{showTooltip && <Tooltip title="Information" x={x} y={y}>
				{item.vaulted && <><span className="vaulted-item">VAULTED</span><br/><br/></>}
				{(() => {
					if (!item.components) return <><span className="item-uncraftable">UNCRAFTABLE</span><br/></>;

					return Object.keys(item.components).map(componentName => {
						let component = item.components[componentName];
						if (!isNaN(component)) component = {"count": component};
						return <div key={componentName}>
							<img className="component-image"
								src={"https://raw.githubusercontent.com/WFCD/warframe-items/development/data/img/" + (component.img || componentName.toLowerCase().split(" ").join("-")) + ".png"}
								alt="" width="30px"/>
							<span
								className="component-name">{(component.count || 1).toLocaleString()}x {ingredientSuffixes.includes(componentName) ? name + " " + componentName : componentName}</span>
						</div>;
					});
				})()}
				<br/>
				<GluedComponents className="item-info" separator=" - " appendAfter={<><br/><br/></>}>
					{(item.buildTime && item.components) && <span>{detailedTime(item.buildTime)}</span>}
					{item.buildPrice && <><img className="credits" src={credits} alt=""
						width="15px"/> {item.buildPrice.toLocaleString()}</>}
					{item.mr && <span>{"Mastery Rank " + item.mr}</span>}
				</GluedComponents>
				<span>Ctrl + Left Click for Wiki</span>
			</Tooltip>}
			<div className="button"
				onMouseOver={e => {
					setShowTooltip(true);
					setX(e.clientX + 20);
					setY(e.clientY + 30);
				}}
				onMouseOut={() => {
					setShowTooltip(false);
				}}
				onMouseMove={e => {
					setX(e.clientX + 20);
					setY(e.clientY + 30);
				}}>
				<button className="item-name" onClick={e => {
					if (e.ctrlKey) {
						window.open(item.wiki || "https://warframe.fandom.com/wiki/" + props.name);
					} else {
						if (props.hideMastered) {
							setShowTooltip(false);
						}
						if (props.onClick) props.onClick();
					}
				}}>{name + ((item.maxLvl || 30) !== 30 ? " [" + item.maxLvl + "]" : "")}{item.mastered &&
				<img src={checkmark} className="checkmark" alt=""/>}</button>
			</div>
		</div>
	);
}

Item.propTypes = {
	name: PropTypes.string.isRequired,
	item: PropTypes.shape({
		wiki: PropTypes.string,
		mr: PropTypes.number,
		mastered: PropTypes.bool,
		vaulted: PropTypes.bool,
		buildTime: PropTypes.number,
		buildPrice: PropTypes.number,
		components: PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.shape({
				img: PropTypes.string,
				count: PropTypes.number
			})
		]),
		maxLvl: PropTypes.number
	}).isRequired,
	mr: PropTypes.number.isRequired,
	hideMastered: PropTypes.bool,
	hideFounders: PropTypes.bool,
	onClick: PropTypes.func
};

export default Item;