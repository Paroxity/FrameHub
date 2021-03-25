import PropTypes from "prop-types";
import credits from "../../icons/credits.png";
import { ingredientSuffixes, itemShape } from "../../utils/items";
import { detailedTime } from "../../utils/time";
import GluedComponents from "../GluedComponents";

function ItemTooltip({ name, item }) {
	return (
		<>
			{item.vaulted && (
				<>
					<span className="vaulted-item">VAULTED</span>
					<br />
					<br />
				</>
			)}
			{item.components ? (
				Object.entries(item.components).map(([componentName, component]) => {
					if (!isNaN(component)) component = { count: component };
					return (
						<div key={componentName}>
							<img
								className="component-image"
								src={`https://raw.githubusercontent.com/WFCD/warframe-items/development/data/img/${
									component.img ||
									componentName.toLowerCase().split(" ").join("-")
								}.png`}
								alt=""
								width="30px"
							/>
							<span className="component-name">
								{(component.count || 1).toLocaleString()}x{" "}
								{ingredientSuffixes.includes(componentName)
									? name + " " + componentName
									: componentName}
							</span>
						</div>
					);
				})
			) : (
				<>
					<span className="item-uncraftable">UNCRAFTABLE</span>
					<br />
				</>
			)}
			<br />
			<GluedComponents
				className="item-info"
				separator=" - "
				appendAfter={
					<>
						<br />
						<br />
					</>
				}>
				{item.buildTime && item.components && (
					<span>{detailedTime(item.buildTime)}</span>
				)}
				{item.buildPrice && (
					<>
						<img className="credits" src={credits} alt="" width="15px" />{" "}
						{item.buildPrice.toLocaleString()}
					</>
				)}
				{item.mr && <span>{`Mastery Rank ${item.mr}`}</span>}
			</GluedComponents>
			<span>Ctrl + Left Click for Wiki</span>
		</>
	);
}

ItemTooltip.propTypes = {
	name: PropTypes.string,
	item: PropTypes.shape(itemShape)
};

export default ItemTooltip;
