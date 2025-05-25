import PropTypes from "prop-types";
import { useState } from "react";
import nodes from "../../../resources/nodes.json";
import { planetJunctionsMap } from "../../../utils/nodes";
import Toggle from "../../Toggle";
import PlanetInfo from "./PlanetInfo";
import PlanetJunction from "./PlanetJunction";
import PlanetNode from "./PlanetNode";

function Planet({ name }) {
	const [visible, setVisible] = useState(
		localStorage.getItem("planetShown")
			? JSON.parse(localStorage.getItem("planetShown"))[name] ?? true
			: true
	);
	const planetNodes = nodes[name];

	return (
		<div className="planet">
			<PlanetInfo name={name} />
			<Toggle
				toggled={visible}
				onToggle={value => {
					const planetShown =
						JSON.parse(localStorage.getItem("planetShown")) || {};
					planetShown[name] = value;
					localStorage.setItem(
						"planetShown",
						JSON.stringify(planetShown)
					);
					setVisible(value);
				}}
			/>
			{visible && (
				<>
					{planetJunctionsMap[name] && (
						<PlanetJunction planet={name} />
					)}
					{Object.entries(planetNodes).map(([id, node]) => {
						return <PlanetNode key={id} id={id} node={node} />;
					})}
				</>
			)}
		</div>
	);
}

Planet.propTypes = {
	name: PropTypes.string.isRequired
};

export default Planet;
