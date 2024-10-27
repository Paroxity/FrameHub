import classNames from "classnames";
import PropTypes from "prop-types";
import { getComponentImageUrl } from "../../utils/items";

export default function ItemComponent({
	itemName,
	componentName,
	component,
	isSubcomponent
}) {
	return (
		<div className={classNames({ "item-subcomponent": isSubcomponent })}>
			<img
				className="component-image"
				src={getComponentImageUrl(itemName, componentName, component.generic, component.hash)}
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
								itemName={componentName}
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

