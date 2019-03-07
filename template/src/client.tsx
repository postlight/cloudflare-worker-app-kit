import { h, render } from "preact";
import { App } from "./components/app";

const container = document.body;
const content = container.firstElementChild!;
render(<App />, container, content);
