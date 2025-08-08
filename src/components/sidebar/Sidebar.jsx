import classNames from "classnames";
import { useState } from "react";
import { useStore } from "../../hooks/useStore";
import placeholderIcon from "../../icons/placeholder-icon.svg";
import { ANONYMOUS, AUTHENTICATED } from "../../utils/checklist-types";
import Button from "../Button";
import ConfirmationPrompt from "./ConfirmationPrompt";
import DangerZone from "./DangerZone";
import ExitButton from "./ExitButton";
import LogoutButton from "./LogoutButton";
import MasteryRankInfo from "./MasteryRankInfo";
import SaveStatus from "./SaveStatus";
import SharePrompt from "./SharePrompt";
import SidebarInputs from "./SidebarInputs";
import Social from "./Social";

function Sidebar() {
	const { type, gameSyncId, gameSyncPlatform, disableGameSync } = useStore(state => ({
		type: state.type,
		gameSyncId: state.gameSyncId,
		gameSyncPlatform: state.gameSyncPlatform,
		disableGameSync: state.disableGameSync
	}));
	const [toggled, setToggled] = useState(false);
	const [unlinkCb, setUnlinkCb] = useState();
	const [unlinkMsg, setUnlinkMsg] = useState("");

	function requestUnlink() {
		setUnlinkCb(() => disableGameSync);
		setUnlinkMsg(
			"Are you sure you want to unlink your account? This will stop syncing with your in-game profile."
		);
	}

	return (
		<>
			<div className={classNames("sidebar", { toggled })}>
				<MasteryRankInfo />
				<SidebarInputs />
				<SaveStatus />
				{gameSyncId && (
					<div style={{ marginTop: "0.5em", marginBottom: "0.5em" }}>
						<div>
							Linked to {String(gameSyncPlatform).toUpperCase()} account:
							&nbsp;{gameSyncId}
						</div>
						<Button centered onClick={requestUnlink}>Unlink Account</Button>
					</div>
				)}
				{type === ANONYMOUS && (
					<div>Remember to bookmark this URL.</div>
				)}
				<DangerZone />
				{type === AUTHENTICATED && <SharePrompt />}
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
			<ConfirmationPrompt
				message={unlinkMsg}
				callback={unlinkCb}
				close={() => setUnlinkCb(undefined)}
			/>
		</>
	);
}

export default Sidebar;
