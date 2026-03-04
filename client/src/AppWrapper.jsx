import { BrowserRouter as Router } from "react-router";

/**
 * This component wraps our App with the providers we do not want to have in our tests
 */
const AppWrapper = ({ children }) => {
  return <Router>{children}</Router>;
};

export default AppWrapper;
