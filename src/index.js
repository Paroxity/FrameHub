import React from "react";
import {createRoot} from "react-dom/client";
import App from "./App";
import "./index.css";
import { enableMapSet } from "immer";

enableMapSet();

createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<App/>
	</React.StrictMode>,
);
