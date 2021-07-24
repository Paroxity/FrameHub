import classNames from "classnames";
import PropTypes from "prop-types";
import checkmark from "../icons/checkmark.svg";
import placeholderIcon from "../icons/placeholder-icon.svg";
import xIcon from "../icons/x-icon.svg";

function Toggle(props) {
	const onToggle = () => props.onToggle(!props.toggled);

	return (
		<div className="radio-checkbox">
			<div className={props.toggled ? "selected" : ""} onClick={onToggle}>
				<img
					onDragStart={e => e.preventDefault()}
					src={props.toggled ? checkmark : placeholderIcon}
					alt=""
				/>
			</div>
			<div className={props.toggled ? "" : "selected"} onClick={onToggle}>
				<img
					onDragStart={e => e.preventDefault()}
					src={props.toggled ? placeholderIcon : xIcon}
					alt=""
				/>
			</div>
		</div>
	);
}

Toggle.propTypes = {
	toggled: PropTypes.bool,
	disabled: PropTypes.bool,
	onToggle: PropTypes.func
};

export default Toggle;

export function LabeledToggle(props) {
	return (
		<div className={classNames("labeled-input", props.className)}>
			<span>{props.label}</span>
			<Toggle toggled={props.toggled} onToggle={props.onToggle} />
		</div>
	);
}

LabeledToggle.propTypes = {
	className: PropTypes.string,
	label: PropTypes.string,
	toggled: PropTypes.bool,
	disabled: PropTypes.bool,
	onToggle: PropTypes.func
};
