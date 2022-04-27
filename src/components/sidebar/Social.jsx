import discordIcon from "../../icons/discord.svg";
import githubIcon from "../../icons/github.png";
import paroxityIcon from "../../icons/paroxity.png";

export default function Social() {
	return (
		<div className="social">
			<a href="https://paroxity.net" target="_blank" rel="noreferrer">
				<img src={paroxityIcon} alt="paroxity" width="20px" />
			</a>
			<a
				href="https://github.com/Paroxity/FrameHub"
				target="_blank"
				rel="noreferrer"
			>
				<img src={githubIcon} alt="github" width="20px" />
			</a>
			<a
				href="https://discord.gg/CNZUgwy"
				target="_blank"
				rel="noreferrer"
			>
				<img src={discordIcon} alt="discord" width="20px" />
			</a>
		</div>
	);
}
