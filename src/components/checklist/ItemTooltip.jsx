import PropTypes from "prop-types";
import credits from "../../icons/credits.png";
import { itemShape } from "../../utils/items";
import { detailedTime } from "../../utils/time";
import GluedComponents from "../GluedComponents";
import ItemComponent from "./ItemComponent";

function ItemTooltip({ item }) {
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
				Object.entries(item.components).map(
					([componentName, component]) => {
						return (
							<ItemComponent
								key={componentName}
								componentName={componentName}
								component={component}
							/>
						);
					}
				)
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
						<img
							className="credits"
							src={credits}
							alt=""
							width="15px"
						/>{" "}
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
	item: PropTypes.shape(itemShape)
};

export default ItemTooltip;
