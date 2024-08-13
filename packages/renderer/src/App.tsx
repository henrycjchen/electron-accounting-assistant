import {Menu} from 'antd';
import type {MenuProps} from 'antd';
import {Link, Route, Routes} from 'react-router-dom';
import {Outlet} from 'react-router-dom';
import CreateCertificates from './CreateCertificates';
import CalculateTable from './CalculateTable/CalculateTable';
import {useState} from 'react';

export default function App() {
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={<Layout />}
        >
          <Route
            index
            element={<CreateCertificates />}
          />
          <Route
            path="calculate-table"
            element={<CalculateTable />}
          />
        </Route>
      </Routes>
    </div>
  );
}

function Layout() {
  const [current, setCurrent] = useState('create-certificates');

  const onClick: MenuProps['onClick'] = e => {
    setCurrent(e.key);
  };

  return (
    <div>
      <Menu
        selectedKeys={[current]}
        onClick={onClick}
        mode="horizontal"
        style={{lineHeight: '64px'}}
        items={[
          {
            key: 'create-certificates',
            label: <Link to="/">创建凭证</Link>,
          },
          {
            key: 'calculate-table',
            label: <Link to="/calculate-table">测算表计算</Link>,
          },
        ]}
      />
      <div
        style={{
          padding: '20px',
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
