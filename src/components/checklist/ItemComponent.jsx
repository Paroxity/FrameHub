import classNames from "classnames";
import PropTypes from "prop-types";
import { getComponentImageUrl } from "../../utils/items";
import { useStore } from "../../hooks/useStore";

export default function ItemComponent({
	itemName,
	componentName,
	componentCount,
	isSubcomponent
}) {
	const componentRecipe = useStore(state => state.recipes[componentName]);
	const ingredientHash = useStore(
		state => state.ingredientHashes[componentName]
	);

	return (
		<div className={classNames({ "item-subcomponent": isSubcomponent })}>
			<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
				<img
					className="component-image"
					src={getComponentImageUrl(
						itemName,
						componentName,
						ingredientHash === "generic",
						ingredientHash
					)}
					alt=""
					width="24px"
				/>
				<span className="component-name">
					{componentCount.toLocaleString()}x {componentName}
				</span>
			</div>
			{componentRecipe?.components &&
				Object.entries(componentRecipe.components).map(
					([subcomponentName, subcomponentCount]) => {
						return (
							<ItemComponent
								key={subcomponentName}
								itemName={componentName}
								componentName={subcomponentName}
								componentCount={
									subcomponentCount *
									Math.ceil(
										componentCount / componentRecipe.count
									)
								}
								isSubcomponent
							/>
						);
					}
				)}
		</div>
	);
}

ItemComponent.propTypes = {
	itemName: PropTypes.string.isRequired,
	componentName: PropTypes.string.isRequired,
	componentCount: PropTypes.number.isRequired,
	isSubcomponent: PropTypes.bool
};
