import PropTypes from "prop-types";
import { useRef } from "react";
import { useStore } from "../../hooks/useStore";
import Button from "../Button";

function SharePrompt({ showLink, setShowLink }) {
	const id = useStore(state => state.id);
	const showLinkRef = useRef(null);

	return (
		showLink && (
			<div className="popup show">
				<div className="popup-box">
					Here's your sharable link:
					<div className="input">
						<input
							type="text"
							readOnly
							value={`https://framehub.paroxity.net/share/${id}`}
							ref={showLinkRef}
						/>
					</div>
					{document.queryCommandSupported("copy") && (
						<Button
							centered
							onClick={() => {
								showLinkRef.current.select();
								document.execCommand("copy");
								setShowLink(false);
							}}>
							Copy
						</Button>
					)}
					<Button centered onClick={() => setShowLink(false)}>
						Close
					</Button>
				</div>
			</div>
		)
	);
}

SharePrompt.propTypes = {
	showLink: PropTypes.bool,
	setShowLink: PropTypes.func
};

export default SharePrompt;
