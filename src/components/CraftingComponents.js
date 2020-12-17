import PropTypes from "prop-types";
import React, {useState} from "react";
import Masonry from "react-masonry-css";
import {complexToSimpleList, ingredientSuffixes, itemShape} from "../utils/item";
import {LabeledToggle} from "./Toggle";

function CraftingComponents(props) {
	let [showComponents, setShowComponents] = useState(false);

	let necessaryComponents = {};
	complexToSimpleList(props.items).forEach(item => {
		if (!item.mastered && item.components) Object.keys(item.components).forEach(name => {
			if (ingredientSuffixes.includes(name)) return;
			if (!necessaryComponents[name]) necessaryComponents[name] = 0;
			necessaryComponents[name] += isNaN(item.components[name]) ? (item.components[name].count || 1) : item.components[name];
		});
	});

	return <>
		<LabeledToggle name="showComponents" label="Show All Components" selected={showComponents} onToggle={() => {
			setShowComponents(!showComponents);
		}}/>
		<Masonry columnClassName="masonry-grid_column" className="masonry-grid" breakpointCols={{
			default: 5,
			1533: 4,
			1348: 3,
			1152: 2,
			640: 1
		}}>
			{showComponents && Object.keys(necessaryComponents).sort((a, b) => {
				let countA = necessaryComponents[a];
				let countB = necessaryComponents[b];
				if (countA > countB) return -1;
				if (countA < countB) return 1;
				return a.localeCompare(b);
			}).map(item => {
				return <div key={item}>
					<img className="component-image"
						src={`https://raw.githubusercontent.com/WFCD/warframe-items/development/data/img/${item.toLowerCase().split(" ").join("-")}.png`}
						alt="" width="30px" onDragStart={e => e.preventDefault()}/>
					<span className="component-name">{necessaryComponents[item].toLocaleString()}x {item}</span>
					<br/>
				</div>;
			})}
		</Masonry>
	</>;
}

CraftingComponents.propTypes = {
	items: PropTypes.objectOf(PropTypes.objectOf(PropTypes.shape(itemShape))).isRequired
};

export default CraftingComponents;