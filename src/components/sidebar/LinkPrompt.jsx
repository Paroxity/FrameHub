import { useState } from "react";
import Button from "../Button";
import FormInput from "../login/FormInput";
import Select from "../Select";
import { useStore } from "../../hooks/useStore";

function LinkPrompt() {
	const enableGameSync = useStore(state => state.enableGameSync);

	const [open, setOpen] = useState(false);
	const [accountId, setAccountId] = useState("");
	const [platform, setPlatform] = useState("pc");
	const confirmDisabled = !accountId || accountId.trim().length === 0;

	async function onConfirm() {
		try {
			await enableGameSync(accountId.trim(), platform);
		} finally {
			setOpen(false);
		}
	}

	return (
		<>
			<Button onClick={() => setOpen(true)} centered>
				Link Account
			</Button>
			{open ? (
				<div className="popup show">
					<div className="popup-box link-popup">
						<div className="mastery-rank">Link your account</div>
						<FormInput
							type="text"
							placeholder="Account ID"
							autoComplete={false}
							valueSetter={setAccountId}
						/>
						<Select
							centered
							value={platform}
							onChange={setPlatform}
							placeholder="Platform"
							options={[
								{ value: "pc", label: "PC" },
								{ value: "psn", label: "PlayStation" },
								{ value: "xbox", label: "Xbox" },
								{ value: "switch", label: "Switch" },
								{ value: "mobile", label: "Mobile" }
							]}
						/>
						<div className="button-row">
							<Button
								centered
								disabled={confirmDisabled}
								onClick={onConfirm}>
								Confirm
							</Button>
							<Button centered onClick={() => setOpen(false)}>
								Cancel
							</Button>
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}

export default LinkPrompt;
