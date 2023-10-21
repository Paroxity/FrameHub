import classNames from "classnames";
import PropTypes from "prop-types";
import { ingredientSuffixes } from "../../utils/items";

export default function ItemComponent({
	itemName,
	componentName,
	component,
	isSubcomponent
}) {
	const imageName =
		(componentName.includes(" Prime ") ? "prime-" : "") +
		(component.generic
			? ingredientSuffixes.find(suffix =>
					componentName.endsWith(suffix)
			  ) ?? componentName.replace(`${itemName} `, "")
			: componentName);

	return (
		<div className={classNames({ "item-subcomponent": isSubcomponent })}>
			<img
				className="component-image"
				src={`https://cdn.warframestat.us/img/${
					component?.img ||
					imageName.split(" ").join("-").toLowerCase()
				}.png`}
				alt=""
				width="24px"
			/>
			<span className="component-name">
				{(component?.count || component).toLocaleString()}x{" "}
				{componentName}
			</span>
			{component?.components &&
				Object.entries(component.components).map(
					([subcomponentName, subcomponent]) => {
						return (
							<ItemComponent
								key={subcomponentName}
								itemName={itemName}
								componentName={subcomponentName}
								component={subcomponent}
								isSubcomponent
							/>
						);
					}
				)}
		</div>
	);
}

const componentShape = {
	count: PropTypes.number.isRequired,
	generic: PropTypes.bool,
	img: PropTypes.string
};
const componentType = PropTypes.oneOfType([
	PropTypes.shape(componentShape),
	PropTypes.number
]);
componentShape.components = PropTypes.objectOf(componentType);

ItemComponent.propTypes = {
	componentName: PropTypes.string.isRequired,
	component: componentType.isRequired,
	isSubcomponent: PropTypes.bool
};
