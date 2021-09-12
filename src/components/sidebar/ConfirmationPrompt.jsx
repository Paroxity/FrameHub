import PropTypes from "prop-types";
import Button from "../Button";

function ConfirmationPrompt({ message, callback, close }) {
	return callback ? (
		<div className="popup show">
			<div className="popup-box">
				<p>{message}</p>
				<Button
					centered
					onClick={() => {
						close();
						callback();
					}}>
					Okay
				</Button>
				<Button centered onClick={() => close()}>
					Cancel
				</Button>
			</div>
		</div>
	) : null;
}

ConfirmationPrompt.propTypes = {
	message: PropTypes.string,
	callback: PropTypes.func,
	close: PropTypes.func
};

export default ConfirmationPrompt;
