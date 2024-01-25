import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  FluentProvider,
  makeStyles,
  webLightTheme,
} from '@fluentui/react-components';
import MenuBar from '~/web/components/MenuBar';
import MainPage from '~/web/pages/MainPage';

const useStyles = makeStyles({
  app: {},
});
const App: React.FunctionComponent = () => {
  const styles = useStyles();
  return (
    <FluentProvider theme={webLightTheme}>
      <Router>
        <div className={styles.app}>
          <MenuBar />
          <Routes>
            <Route path="/" element={<MainPage />} />
            {/* Define other routes as needed */}
          </Routes>
        </div>
      </Router>
    </FluentProvider>
  );
};

export default App;
