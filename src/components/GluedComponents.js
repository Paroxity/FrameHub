import React from "react";

function GluedComponents(props) {
	let children = props.children.filter(child => child !== undefined);
	if (children.length === 0) return <></>;
	return <><span>{children.filter(child => child !== undefined).map((child, i) => {
		return <React.Fragment key={i}>{i === 0 ? "" : props.separator}{child}</React.Fragment>;
	})}</span>{props.appendAfter}</>;
}

export default GluedComponents;