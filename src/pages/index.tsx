import { Route, Routes } from 'react-router-dom';
import { Videos } from './videos';
import { Home } from './home';
import { Subscription } from './subscription';
import { Video } from './video';

const routes = [
  { path: '/', Page: Home },
  { path: 'videos', Page: Videos },
  { path: 'subscription', Page: Subscription },
  { path: 'video', Page: Video },
];

function Routing() {
  const getRoutes = () => routes.map(({ path, Page }) => <Route key={path} path={path} element={<Page />} />);

  return <Routes>{getRoutes()}</Routes>;
}

export { Routing };
