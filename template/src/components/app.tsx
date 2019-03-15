import { h, VNode } from "preact";
import "./app.css";

export const App = (): VNode => (
  <div>
    <section class="content">
      <h1>Hello, ☁️ Worker App!</h1>
    </section>
    <footer class="footer">
      <p>A micro project from your friends at</p>
      <a href="https://postlight.com/labs">
        <img
          id="logo"
          src="/assets/images/postlight-labs.gif"
          alt="Postlight Labs"
          width={204}
          height={45}
        />
      </a>
    </footer>
  </div>
);
