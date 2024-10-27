import classNames from "classnames";
import PropTypes from "prop-types";
import { ingredientSuffixes } from "../../utils/items";

export default function ItemComponent({
	itemName,
	componentName,
	component,
	isSubcomponent
}) {
	const imageName = (
		component.generic
			? (componentName.includes(" Prime ") ? "prime-" : "") +
					ingredientSuffixes.find(suffix =>
						componentName.endsWith(suffix)
					) ?? componentName.replace(`${itemName} `, "")
			: componentName + "-" + component.hash
	)
		.split(" ")
		.join("-")
		.toLowerCase();

	return (
		<div className={classNames({ "item-subcomponent": isSubcomponent })}>
			<img
				className="component-image"
				src={`https://cdn.warframestat.us/img/${imageName}.png`}
				alt=""
				width="24px"
			/>
			<span className="component-name">
				{component.count.toLocaleString()}x {componentName}
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
	hash: PropTypes.string
};
componentShape.components = PropTypes.objectOf(PropTypes.shape(componentShape));

ItemComponent.propTypes = {
	componentName: PropTypes.string.isRequired,
	component: PropTypes.shape(componentShape).isRequired,
	isSubcomponent: PropTypes.bool
};

