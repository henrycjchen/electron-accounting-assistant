import {Menu} from 'antd';
import type {MenuProps} from 'antd';
import {Link, Route, Routes} from 'react-router-dom';
import {Outlet} from 'react-router-dom';
import CreateCertificates from './pages/CreateCertificates';
import CalculateTable from './pages/CalculateTable/CalculateTable';
import BillArrangement from './pages/BillArrangement';
import {useState} from 'react';
import React from 'react';

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
          <Route
            path="bill-arrangement"
            element={<BillArrangement />}
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
            label: <Link to="/">生成凭证</Link>,
          },
          {
            key: 'calculate-table',
            label: <Link to="/calculate-table">生成测算表</Link>,
          },
          {
            key: 'bill-arrangement',
            label: <Link to="/bill-arrangement">发票整理</Link>,
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
