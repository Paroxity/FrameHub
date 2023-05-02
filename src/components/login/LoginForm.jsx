import { shallow } from "zustand/shallow";
import { useLoginFormStore } from "../../hooks/useLoginFormStore";
import Button from "../Button";
import FormInput from "./FormInput";

function LoginForm() {
	const { handleSubmit, setEmail, setPassword, setConfirmPassword, signUp } =
		useLoginFormStore(
			state => ({
				handleSubmit: state.handleSubmit,
				setEmail: state.setEmail,
				setPassword: state.setPassword,
				setConfirmPassword: state.setConfirmPassword,
				signUp: state.signUp
			}),
			shallow
		);

	return (
		<form onSubmit={handleSubmit}>
			<FormInput type="text" placeholder="EMAIL" valueSetter={setEmail} />
			<FormInput
				type="password"
				placeholder="PASSWORD"
				autoComplete={true}
				valueSetter={setPassword}
			/>
			{signUp && (
				<FormInput
					type="password"
					placeholder="CONFIRM PASSWORD"
					autoComplete={true}
					valueSetter={setConfirmPassword}
				/>
			)}
			<Button centered submit>
				{signUp ? "Sign up" : "Login"}
			</Button>
		</form>
	);
}

export default LoginForm;
