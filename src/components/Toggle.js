import React from "react";
import xIcon from "../media/x-icon.svg";
import checkmark from "../media/checkmark.svg";
import placeholderIcon from "../media/placeholderIcon.svg";
import * as PropTypes from "prop-types";

class Toggle extends React.Component {
	render() {
		let toggle = (
			<div className="radio-checkbox">
				<input type="radio" id={this.props.name + "On"} name={this.props.name}
					className={this.props.selected ? "selected" : ""}/>
				<label htmlFor={this.props.name + "On"} onClick={this.props.onToggle}>{this.props.selected ?
					<img onDragStart={e => e.preventDefault()} src={checkmark} alt=""/> :
					<img onDragStart={e => e.preventDefault()} src={placeholderIcon} alt=""/>}</label>
				<input type="radio" id={this.props.name + "Off"} name={this.props.name}
					className={!this.props.selected ? "selected" : ""}/>
				<label htmlFor={this.props.name + "Off"} onClick={this.props.onToggle}>{this.props.selected ?
					<img onDragStart={e => e.preventDefault()} src={placeholderIcon} alt=""/> :
					<img onDragStart={e => e.preventDefault()} src={xIcon} alt="X"/>}</label>
			</div>
		);
		if (this.props.label) {
			toggle = (
				<div className="labeled-input">
					<span>{this.props.label}</span>
					{toggle}
				</div>
			);
		}
		return toggle;

	}
}

Toggle.propTypes = {
	name: PropTypes.string.isRequired,
	selected: PropTypes.bool,
	label: PropTypes.string,
	onToggle: PropTypes.func
};

export default Toggle;