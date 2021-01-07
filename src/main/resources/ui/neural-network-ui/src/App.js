import { ReactFlowProvider } from 'react-flow-renderer';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import NetworkConfiguration from './NetworkConfiguration';

function App() {
  
  
  return (
    <ReactFlowProvider>
        <Router forceRefresh={true}>
           <Switch>
            <Route exact path="/">
                <NetworkConfiguration />
            </Route>
        </Switch>
        </Router>
        </ReactFlowProvider>
  );
}

export default App;
