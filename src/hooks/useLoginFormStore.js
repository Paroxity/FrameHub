import create from "zustand";
import { auth } from "../App";

export const useLoginFormStore = create((set, get) => ({
	email: "",
	setEmail: email => set(() => ({ email })),
	password: "",
	setPassword: password => set(() => ({ password })),
	confirmPassword: "",
	setConfirmPassword: confirmPassword => set(() => ({ confirmPassword })),
	signUp: false,
	setSignUp: signUp => set(() => ({ signUp })),
	error: "",
	setError: error => set(() => ({ error })),
	errorDisplayed: false,
	displayError: displayError => set(() => ({ errorDisplayed: displayError })),
	handleSubmit: event => {
		event.preventDefault();

		const { signUp, email, password, confirmPassword } = get();
		if (signUp) {
			if (password !== confirmPassword) {
				set({ error: "Passwords do not match.", errorDisplayed: true });
				return;
			}
			auth.createUserWithEmailAndPassword(email, password)
				.then(() =>
					set({
						signUp: false,
						password: "",
						confirmPassword: "",
						email: ""
					})
				)
				.catch(e => set({ error: e.code, errorDisplayed: true }));
			return;
		}
		auth.signInWithEmailAndPassword(email, password)
			.then(() => set({ password: "", confirmPassword: "", email: "" }))
			.catch(e => set({ error: e.code, errorDisplayed: true }));
	}
}));
