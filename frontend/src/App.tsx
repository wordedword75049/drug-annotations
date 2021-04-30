import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import NctDrugsList from 'pages/DrugsList';
import AbstractDrugsList from 'pages/DrugsList/abstratIndex';
import './App.scss';
import Experimental from 'pages/Experimental';
import { publicPath } from 'paths';

const App = () => {
  return (
    <div className="container">
      {/* <Router>
        <Route
          path="/drugs/:drugId"
          render={({ match, history }) => <Experimental drugId={match.params.drugId} history={history} />}
        />
        <Route exact path="/nct" render={({ history }) => <NctDrugsList history={history}/>} />
      </Router>
      <Router>
        <Route
          path="/drugs/:drugId"
          render={({ match, history }) => <Experimental drugId={match.params.drugId} history={history} />}
        />
        <Route exact path="/abstracts" render={({ history }) => <AbstractsDrugsList history={history}/>} />
      </Router> */}
      <Router basename={publicPath}>
        <div>
          <nav>
            <ul>
              {/* <li>
              <Link to="/">Home</Link>
            </li> */}
              <li>
                <Link to="/nct">NCT</Link>
              </li>
              <li>
                <Link to="/abstracts">Abstracts</Link>
              </li>
            </ul>
          </nav>
          <Switch>
             <Route path="/nct" render={({ history }) => <NctDrugsList history={history} />} />
            <Route
              path="/abstracts"
              render={({ history }) => <AbstractDrugsList history={history} />}
            />
            <Route
              exact
              path="/drugs/:drugId"
              render={({ match, history }) => (
                <Experimental drugId={match.params.drugId} history={history} />
              )}
            />
          </Switch>
        </div>
      </Router>
    </div>
  );
};
export default App;
