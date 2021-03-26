import "firebase/auth";
import "firebase/storage";
import FrameHubLogo from "../components/FrameHubLogo";
import AdditionalActions from "../components/login/AdditionalActions";
import AlternativeLogin from "../components/login/AlternativeLogin";
import LoginForm from "../components/login/LoginForm";
import LoginFormPopup from "../components/login/LoginFormPopup";

function Login() {
	return (
		<div className="login">
			<FrameHubLogo />
			<LoginForm />
			<AdditionalActions />
			<AlternativeLogin />
			<div className="disclaimer">
				FrameHub is not affiliated with Digital Extremes or Warframe.
			</div>
			<LoginFormPopup />
		</div>
	);
}

export default Login;
