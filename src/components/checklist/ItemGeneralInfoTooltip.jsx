import PropTypes from "prop-types";
import credits from "../../icons/credits.png";
import ducats from "../../icons/ducats.png";
import { itemShape } from "../../utils/items";
import { detailedTime } from "../../utils/time";
import GluedComponents from "../GluedComponents";
import { PaginatedTooltipTitle } from "../PaginatedTooltip";
import ItemComponent from "./ItemComponent";
import { useStore } from "../../hooks/useStore";

function ItemGeneralInfoTooltip({ item, itemName }) {
	const isMacOS =
		window.navigator.userAgentData?.platform === "macOS" ||
		window.navigator.platform === "MacIntel"; //TODO: Remove usage of deprecated Navigator.platform
	const recipe = useStore(state => state.recipes[itemName]);

	return (
		<div className="item-tooltip">
			<PaginatedTooltipTitle title="General Information" />
			{recipe?.components ? (
				<div className="item-craftable">
					{Object.entries(recipe.components).map(
						([componentName, componentCount]) => {
							return (
								<ItemComponent
									key={componentName}
									itemName={itemName}
									componentName={componentName}
									componentCount={componentCount}
								/>
							);
						}
					)}
				</div>
			) : (
				<span className="item-uncraftable">
					{item.baro ? (
						<>
							Purchase from Baro Ki'Teer for{" "}
							<img
								className="ducats"
								src={ducats}
								alt=""
								width="20px"
							/>{" "}
							{item.baro[1].toLocaleString()} /{" "}
							<img
								className="credits"
								src={credits}
								alt=""
								width="20px"
							/>{" "}
							{item.baro[0].toLocaleString()}
						</>
					) : (
						(item.description ?? "Unknown Acquisition")
					)}
				</span>
			)}
			<GluedComponents className="item-info" separator=" - ">
				{recipe?.components && (
					<span className="item-build-time">
						{detailedTime(recipe.time)}
					</span>
				)}
				{recipe?.price && (
					<>
						<img
							className="credits"
							src={credits}
							alt=""
							width="15px"
						/>{" "}
						<span className="item-build-price">
							{recipe.price.toLocaleString()}
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
