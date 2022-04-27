import classNames from "classnames";
import PropTypes from "prop-types";

function Button(props) {
	return (
		<div
			className={classNames("button", {
				center: props.centered,
				disabled: props.disabled
			})}
		>
			<button
				className={props.className}
				onClick={props.onClick}
				type={props.submit ? "submit" : "button"}
				disabled={props.disabled}
			>
				{props.children}
			</button>
		</div>
	);
}

Button.propTypes = {
	centered: PropTypes.bool,
	disabled: PropTypes.bool,
	submit: PropTypes.bool,
	onClick: PropTypes.func,
	className: PropTypes.string,
	children: PropTypes.node
};

export default Button;
