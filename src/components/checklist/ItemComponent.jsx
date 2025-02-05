import classNames from "classnames";
import PropTypes from "prop-types";
import { getComponentImageUrl } from "../../utils/items";
import { useStore } from "../../hooks/useStore";

export default function ItemComponent({
	componentName,
	componentCount,
	isSubcomponent
}) {
	const componentRecipe = useStore(state => state.recipes[componentName]);
	const ingredientId = useStore(state => state.ingredientIds[componentName]);

	return (
		<div className={classNames({ "item-subcomponent": isSubcomponent })}>
			<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
				<img
					className="component-image"
					src={getComponentImageUrl(ingredientId)}
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
	componentName: PropTypes.string.isRequired,
	componentCount: PropTypes.number.isRequired,
	isSubcomponent: PropTypes.bool
};

