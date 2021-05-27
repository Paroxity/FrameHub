import classNames from "classnames";
import PropTypes from "prop-types";
import { ingredientSuffixes } from "../../utils/items";

export default function ItemComponent({
	componentName,
	component,
	isSubcomponent
}) {
	return (
		<div className={classNames({ "item-subcomponent": isSubcomponent })}>
			<img
				className="component-image"
				src={`https://raw.githubusercontent.com/WFCD/warframe-items/development/data/img/${
					component?.img ||
					(componentName.includes(" Prime ") ? "prime-" : "") +
						(component.generic
							? ingredientSuffixes
									.find(suffix =>
										componentName.endsWith(suffix)
									)
									.split(" ")
									.join("-")
									.toLowerCase()
							: componentName.toLowerCase().split(" ").join("-"))
				}.png`}
				alt=""
				width="30px"
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
								component={subcomponent}
								componentName={subcomponentName}
								isSubcomponent
							/>
						);
					}
				)}
		</div>
	);
}

const componentPropType = function () {
	return PropTypes.shape({
		count: PropTypes.number.isRequired,
		components: PropTypes.objectOf(componentPropType),
		generic: PropTypes.bool,
		img: PropTypes.string
	}).apply(this, arguments);
};

ItemComponent.propTypes = {
	componentName: PropTypes.string.isRequired,
	component: PropTypes.oneOfType(componentPropType, PropTypes.number)
		.isRequired,
	isSubcomponent: PropTypes.bool
};
