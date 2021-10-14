import PropTypes from "prop-types";
import credits from "../../icons/credits.png";
import { itemShape } from "../../utils/items";
import { detailedTime } from "../../utils/time";
import GluedComponents from "../GluedComponents";
import { PaginatedTooltipTitle } from "../PaginatedTooltip";
import ItemComponent from "./ItemComponent";

function ItemGeneralInfoTooltip({ item }) {
	const isMacOS =
		window.navigator.userAgentData?.platform === "macOS" ||
		window.navigator.platform === "MacIntel"; //TODO: Remove usage of deprecated Navigator.platform

	return (
		<div className="item-tooltip">
			<PaginatedTooltipTitle title="General Information" />
			{item.components ? (
				<div className="item-craftable">
					{Object.entries(item.components).map(
						([componentName, component]) => {
							return (
								<ItemComponent
									key={componentName}
									componentName={componentName}
									component={component}
								/>
							);
						}
					)}
				</div>
			) : (
				<span className="item-uncraftable">UNCRAFTABLE</span>
			)}
			<GluedComponents className="item-info" separator=" - ">
				{item.buildTime && item.components && (
					<span className="item-build-time">
						{detailedTime(item.buildTime)}
					</span>
				)}
				{item.buildPrice && (
					<>
						<img
							className="credits"
							src={credits}
							alt=""
							width="15px"
						/>{" "}
						<span className="item-build-price">
							{item.buildPrice.toLocaleString()}
						</span>
					</>
				)}
				{item.mr && <span>{`Mastery Rank ${item.mr}`}</span>}
			</GluedComponents>
			<span>{isMacOS ? "Cmd" : "Ctrl"} + Left Click for Wiki</span>
		</div>
	);
}

ItemGeneralInfoTooltip.propTypes = {
	item: PropTypes.shape(itemShape)
};

export default ItemGeneralInfoTooltip;
