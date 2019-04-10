import React, { useState, useEffect } from 'react';
import {Tab, Button, Segment, Header, Icon, Message} from 'semantic-ui-react';
import List from './List';

const aclURL = 'http://localhost:8000/acl';
const ERROR_STATE = {
  status: false,
  message: '',
};
const PERMISSIONS_STATE = [];
const TOKEN_STATE = 'abcd1234';

const panes = (token, permissions) => [
  {
    menuItem: 'Platforms',
    pane: (
      <Tab.Pane key="platforms">
        <List
          token={token}
          url="http://localhost:8000/platforms"
          permissions={permissions}
          resource="platforms"
        />
      </Tab.Pane>
    ),
  },
  {
    menuItem: 'Products',
    pane: (
      <Tab.Pane key="products">
        <List
          token={token}
          url="http://localhost:8000/products"
          permissions={permissions}
          resource="products"
        />
      </Tab.Pane>
    ),
  },
];

const getACL = async (token) => {
  const res = await fetch(aclURL, {
    method: 'GET',
    headers: {
      'Authorization': token,
    },
  });
  const { status } = res;
  const success = status === 200;
  const data = success ? await res.json() : await res.text();

  return {
    status,
    success,
    data,
  };
}

const App = () => {
  const [token, setToken] = useState(TOKEN_STATE);
  const [permissions, setPermissions] = useState(PERMISSIONS_STATE);
  const [error, setError] = useState(ERROR_STATE);

  useEffect(() => {
    getACL(token)
      .then(({ status, success, data }) => {
        if (success) {
          setPermissions(data);
          setError(ERROR_STATE);
        } else {
          setError({
            status: true,
            message: `${status}: ${data}`,
          });
        }
      })
    ;

    return () => {
      setError(ERROR_STATE);
      setPermissions(PERMISSIONS_STATE);
    }
  }, [token]);

  return (
    <div style={{ padding: 20 }}>
      {error.status
        ? (
          <Message negative>
            <Message.Header>Oops, something went wrong.</Message.Header>
            <p>{error.message}</p>
          </Message>
        ) : (
          <div>
            <Segment placeholder>
              <Header icon>
                <Icon name='users' />
                Please select the user you want to use.
              </Header>
              <Segment.Inline>
                <Button.Group>
                  <Button onClick={() => setToken('abcd1234')} color={token === 'abcd1234' ? 'teal' : 'grey'}>John Doe</Button>
                  <Button.Or />
                  <Button onClick={() => setToken('abcd5678')} color={token === 'abcd5678' ? 'teal' : 'grey'}>Mary Doe</Button>
                </Button.Group>
              </Segment.Inline>
            </Segment>
            {permissions.length > 0 && (
              <Tab
                panes={panes(token, permissions)}
                renderActiveOnly={false}
                menu={{ secondary: true, pointing: true }}
              />
            )}
          </div>
        )
      }
    </div>
  );
}

export default App;
