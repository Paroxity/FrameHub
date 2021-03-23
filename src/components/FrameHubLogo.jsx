import logo from "../icons/framehub.svg";

function FrameHubLogo() {
	return (
		<img
			className="framehub-logo"
			src={logo}
			alt=""
			onDragStart={e => e.preventDefault()}
		/>
	);
}

export default FrameHubLogo;
