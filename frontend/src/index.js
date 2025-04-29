import ReactDOM from "react-dom"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { Provider } from "react-redux"
import Store from "./redux/store"
import { NotificationProvider } from "../src/components/Context/NotificationContext"

ReactDOM.render(
  <Provider store={Store}>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </Provider>,
  document.getElementById("root"),
)

reportWebVitals()
