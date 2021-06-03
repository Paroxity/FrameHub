import classNames from "classnames";
import { useState } from "react";
import { useStore } from "../../hooks/useStore";
import placeholderIcon from "../../icons/placeholder-icon.svg";
import { ANONYMOUS, AUTHENTICATED } from "../../utils/checklist-types";
import Button from "../Button";
import DangerZone from "./DangerZone";
import ExitButton from "./ExitButton";
import LogoutButton from "./LogoutButton";
import MasteryRankInfo from "./MasteryRankInfo";
import SaveStatus from "./SaveStatus";
import SharePrompt from "./SharePrompt";
import SidebarInputs from "./SidebarInputs";
import Social from "./Social";

function Sidebar() {
	const type = useStore(state => state.type);
	const [toggled, setToggled] = useState(false);
	const [showLink, setShowLink] = useState(false);

	return (
		<>
			<div className={classNames("sidebar", { toggled })}>
				<MasteryRankInfo />
				<SidebarInputs />
				<SaveStatus />
				{type === ANONYMOUS && (
					<div>Remember to bookmark this URL.</div>
				)}
				<DangerZone />
				{type === AUTHENTICATED && (
					<Button centered onClick={() => setShowLink(true)}>
						Share
					</Button>
				)}
				<LogoutButton />
				<ExitButton />
				<Social />
			</div>
			<img
				className="hamburger"
				src={placeholderIcon}
				onClick={() => {
					setToggled(!toggled);
				}}
				alt="menu"
			/>
			<SharePrompt showLink={showLink} setShowLink={setShowLink} />
		</>
	);
}

export default Sidebar;
