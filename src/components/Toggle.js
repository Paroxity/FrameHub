import PropTypes from "prop-types";
import React from "react";
import checkmark from "../media/checkmark.svg";
import placeholderIcon from "../media/placeholderIcon.svg";
import xIcon from "../media/x-icon.svg";

export function Toggle(props) {
	let onToggle = () => {
		if (!props.disabled) props.onToggle(!props.selected);
	};

	return <div className="radio-checkbox">
		<input type="radio" id={props.name + "On"} name={props.name}
			className={props.selected ? "selected" : ""}/>
		<label htmlFor={props.name + "On"} onClick={onToggle}>
			{props.selected ?
				<img onDragStart={e => e.preventDefault()} src={checkmark} alt=""/> :
				<img onDragStart={e => e.preventDefault()} src={placeholderIcon} alt=""/>}
		</label>
		<input type="radio" id={props.name + "Off"} name={props.name}
			className={!props.selected ? "selected" : ""}/>
		<label htmlFor={props.name + "Off"} onClick={onToggle}>
			{props.selected ?
				<img onDragStart={e => e.preventDefault()} src={placeholderIcon} alt=""/> :
				<img onDragStart={e => e.preventDefault()} src={xIcon} alt="X"/>}
		</label>
	</div>;
}

Toggle.propTypes = {
	name: PropTypes.string.isRequired,
	disabled: PropTypes.bool,
	selected: PropTypes.bool,
	onToggle: PropTypes.func
};

export function LabeledToggle(props) {
	return <div className="labeled-input">
		<span>{props.label}</span>
		<Toggle name={props.name} disabled={props.disabled} selected={props.selected} onToggle={props.onToggle}/>
	</div>;
}

LabeledToggle.propTypes = {label: PropTypes.string, ...Toggle.propTypes};