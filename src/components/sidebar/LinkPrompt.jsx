import { useState } from "react";
import Button from "../Button";
import FormInput from "../login/FormInput";
import Select from "../Select";
import { useStore } from "../../hooks/useStore";

function LinkPrompt() {
	const enableGameSync = useStore(state => state.enableGameSync);
	const backupMasteryData = useStore(state => state.backupMasteryData);

	const [open, setOpen] = useState(false);
	const [accountId, setAccountId] = useState("");
	const [platform, setPlatform] = useState("pc");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const confirmDisabled =
		!accountId || accountId.trim().length === 0 || loading;

	async function onConfirm() {
		setError("");
		setLoading(true);
		try {
			await backupMasteryData();
			await enableGameSync(accountId.trim(), platform);
			setOpen(false);
		} catch (e) {
			// Show any error message inline without closing the popup
			setError(e?.message || String(e));
		} finally {
			setLoading(false);
		}
	}

	function openPopup() {
		setError("");
		setOpen(true);
	}

	return (
		<>
			<Button onClick={openPopup} centered>
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
							valueSetter={value => {
								setAccountId(value);
								if (error) setError("");
							}}
						/>
						<div
							style={{
								fontSize: "14px",
								textAlign: "left",
								paddingBottom: "10px"
							}}
						>
							<a
								href="https://gist.github.com/DaPigGuy/18349a0fd5ad08502305a98f8b115c26"
								target="_blank"
								rel="noopener noreferrer"
								style={{
									color: "#bea966",
									textDecoration: "underline"
								}}
							>
								How to get Warframe account ID
							</a>
						</div>
						<Select
							centered
							value={platform}
							onChange={value => {
								setPlatform(value);
								if (error) setError("");
							}}
							placeholder="Platform"
							options={[
								{ value: "pc", label: "PC" },
								{ value: "psn", label: "PlayStation" },
								{ value: "xbox", label: "Xbox" },
								{ value: "switch", label: "Switch" },
								{ value: "mobile", label: "Mobile" }
							]}
						/>
						{error ? (
							<div className="error-box">{error}</div>
						) : null}
						<div className="button-row">
							<Button
								centered
								disabled={confirmDisabled}
								onClick={onConfirm}
							>
								{loading ? (
									<div className="spinner-small" />
								) : (
									"Confirm"
								)}
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
